<?php

namespace App\Adapters\Pos;

use App\Contracts\PosAdapter;
use App\Models\Location;
use App\Models\TenantSetting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SquareAdapter implements PosAdapter
{
    private const BASE_URL = 'https://connect.squareapis.com/v2';
    private const MAX_RETRIES = 3;
    private const RETRY_DELAY_MS = 1000;

    public function name(): string
    {
        return 'square';
    }

    public function importDailySales(Location $location, string $startDate, string $endDate): Collection
    {
        $token = $this->getAccessToken($location->tenant_id);
        if (! $token) {
            Log::error("Square adapter: no access token for tenant {$location->tenant_id}");
            return collect();
        }

        $dailyAggregates = [];

        // Fetch orders aggregated by day
        $orders = $this->fetchAllOrders($token, $location->square_location_id, $startDate, $endDate);
        foreach ($orders as $order) {
            $date = substr($order['created_at'] ?? '', 0, 10);
            if (! $date) {
                continue;
            }

            if (! isset($dailyAggregates[$date])) {
                $dailyAggregates[$date] = [
                    'date'         => $date,
                    'transactions' => 0,
                    'revenue'      => 0.0,
                    'store_labor'  => 0.0,
                ];
            }

            $dailyAggregates[$date]['transactions']++;

            // Square amounts are in cents
            $totalMoney = $order['total_money']['amount'] ?? 0;
            $dailyAggregates[$date]['revenue'] += $totalMoney / 100.0;
        }

        // Fetch labor shifts for the period
        $shifts = $this->fetchLaborShifts($token, $location->square_location_id, $startDate, $endDate);
        foreach ($shifts as $shift) {
            $date = substr($shift['start_at'] ?? '', 0, 10);
            if (! $date || ! isset($dailyAggregates[$date])) {
                continue;
            }

            $wageMoney = $shift['wage']['hourly_rate']['amount'] ?? 0;
            $hourlyRate = $wageMoney / 100.0;

            // Calculate hours from start/end
            if (isset($shift['start_at'], $shift['end_at'])) {
                $start = strtotime($shift['start_at']);
                $end = strtotime($shift['end_at']);
                $hours = ($end - $start) / 3600.0;
                $dailyAggregates[$date]['store_labor'] += $hourlyRate * $hours;
            }
        }

        return collect(array_values($dailyAggregates));
    }

    public function importEmployees(Location $location): Collection
    {
        $token = $this->getAccessToken($location->tenant_id);
        if (! $token) {
            Log::error("Square adapter: no access token for tenant {$location->tenant_id}");
            return collect();
        }

        $employees = collect();
        $cursor = null;

        do {
            $body = [
                'query' => [
                    'filter' => [
                        'location_ids' => [$location->square_location_id],
                        'status'       => 'ACTIVE',
                    ],
                ],
            ];
            if ($cursor) {
                $body['cursor'] = $cursor;
            }

            $response = $this->request('POST', '/team-members/search', $token, $body);
            if (! $response) {
                break;
            }

            $members = $response['team_members'] ?? [];
            foreach ($members as $member) {
                $employees->push([
                    'external_id' => $member['id'] ?? null,
                    'first_name'  => $member['given_name'] ?? '',
                    'last_name'   => $member['family_name'] ?? '',
                    'email'       => $member['email_address'] ?? null,
                    'phone'       => $member['phone_number'] ?? null,
                    'roles'       => array_column($member['assigned_locations']['assignment'] ?? [], 'role'),
                    'pay_rate'    => null,
                    'status'      => strtolower($member['status'] ?? 'active'),
                ]);
            }

            $cursor = $response['cursor'] ?? null;
        } while ($cursor);

        return $employees;
    }

    public function publishSchedule(Location $location, array $schedulePayload): array
    {
        $token = $this->getAccessToken($location->tenant_id);
        if (! $token) {
            return [
                'total'     => 0,
                'published' => 0,
                'failed'    => 0,
                'skipped'   => 0,
                'results'   => [],
            ];
        }

        $shifts = $schedulePayload['shifts'] ?? [];
        $results = [];
        $published = 0;
        $failed = 0;
        $skipped = 0;

        foreach ($shifts as $shift) {
            $idempotencyKey = Str::uuid()->toString();

            // Create the scheduled shift
            $createBody = [
                'idempotency_key' => $idempotencyKey,
                'scheduled_shift' => [
                    'location_id'     => $location->square_location_id,
                    'team_member_id'  => $shift['employee_external_id'] ?? null,
                    'start_at'        => $shift['start_at'] ?? null,
                    'end_at'          => $shift['end_at'] ?? null,
                ],
            ];

            $createResponse = $this->request('POST', '/labor/scheduled-shifts', $token, $createBody);

            if (! $createResponse || isset($createResponse['errors'])) {
                $failed++;
                $results[] = [
                    'shift'  => $shift,
                    'status' => 'failed',
                    'error'  => $createResponse['errors'] ?? 'Create request failed',
                ];
                continue;
            }

            $shiftId = $createResponse['scheduled_shift']['id'] ?? null;
            if (! $shiftId) {
                $failed++;
                $results[] = [
                    'shift'  => $shift,
                    'status' => 'failed',
                    'error'  => 'No shift ID returned',
                ];
                continue;
            }

            // Publish the shift
            $publishResponse = $this->request('POST', "/labor/scheduled-shifts/{$shiftId}/publish", $token, []);

            if ($publishResponse && ! isset($publishResponse['errors'])) {
                $published++;
                $results[] = [
                    'shift'    => $shift,
                    'status'   => 'published',
                    'shift_id' => $shiftId,
                ];
            } else {
                $failed++;
                $results[] = [
                    'shift'  => $shift,
                    'status' => 'failed',
                    'error'  => $publishResponse['errors'] ?? 'Publish request failed',
                ];
            }
        }

        return [
            'total'     => count($shifts),
            'published' => $published,
            'failed'    => $failed,
            'skipped'   => $skipped,
            'results'   => $results,
        ];
    }

    public function healthCheck(Location $location): bool
    {
        $token = $this->getAccessToken($location->tenant_id);
        if (! $token) {
            return false;
        }

        $squareLocationId = $location->square_location_id;
        if (! $squareLocationId) {
            return false;
        }

        try {
            $response = Http::withToken($token)
                ->timeout(10)
                ->get(self::BASE_URL . "/locations/{$squareLocationId}");

            return $response->successful();
        } catch (\Exception $e) {
            Log::warning("Square health check failed: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Get the Square access token from TenantSetting.
     */
    private function getAccessToken(int $tenantId): ?string
    {
        $setting = TenantSetting::where('tenant_id', $tenantId)
            ->where('category', 'pos')
            ->where('key_name', 'square_access_token')
            ->first();

        return $setting?->value;
    }

    /**
     * Fetch all orders for a location and date range, handling pagination.
     */
    private function fetchAllOrders(string $token, string $locationId, string $startDate, string $endDate): array
    {
        $orders = [];
        $cursor = null;

        do {
            $body = [
                'location_ids' => [$locationId],
                'query'        => [
                    'filter' => [
                        'date_time_filter' => [
                            'created_at' => [
                                'start_at' => $startDate . 'T00:00:00Z',
                                'end_at'   => $endDate . 'T23:59:59Z',
                            ],
                        ],
                    ],
                    'sort' => [
                        'sort_field' => 'CREATED_AT',
                        'sort_order' => 'ASC',
                    ],
                ],
            ];
            if ($cursor) {
                $body['cursor'] = $cursor;
            }

            $response = $this->request('POST', '/orders/search', $token, $body);
            if (! $response) {
                break;
            }

            $orders = array_merge($orders, $response['orders'] ?? []);
            $cursor = $response['cursor'] ?? null;
        } while ($cursor);

        return $orders;
    }

    /**
     * Fetch labor shifts for a location and date range, handling pagination.
     */
    private function fetchLaborShifts(string $token, string $locationId, string $startDate, string $endDate): array
    {
        $shifts = [];
        $cursor = null;

        do {
            $body = [
                'query' => [
                    'filter' => [
                        'location_ids' => [$locationId],
                        'start'        => [
                            'start_at' => $startDate . 'T00:00:00Z',
                            'end_at'   => $endDate . 'T23:59:59Z',
                        ],
                    ],
                ],
            ];
            if ($cursor) {
                $body['cursor'] = $cursor;
            }

            $response = $this->request('POST', '/labor/shifts/search', $token, $body);
            if (! $response) {
                break;
            }

            $shifts = array_merge($shifts, $response['shifts'] ?? []);
            $cursor = $response['cursor'] ?? null;
        } while ($cursor);

        return $shifts;
    }

    /**
     * Make an HTTP request to the Square API with retry logic for rate limiting.
     */
    private function request(string $method, string $path, string $token, array $body = []): ?array
    {
        $url = self::BASE_URL . $path;

        for ($attempt = 1; $attempt <= self::MAX_RETRIES; $attempt++) {
            try {
                $pending = Http::withToken($token)
                    ->timeout(30)
                    ->acceptJson();

                $response = match (strtoupper($method)) {
                    'GET'  => $pending->get($url),
                    'POST' => $pending->post($url, $body),
                    default => $pending->send($method, $url, ['json' => $body]),
                };

                if ($response->status() === 429) {
                    $retryAfter = (int) ($response->header('Retry-After') ?: 1);
                    Log::info("Square API rate limited, retrying in {$retryAfter}s (attempt {$attempt}/" . self::MAX_RETRIES . ')');
                    usleep(max($retryAfter * 1000000, self::RETRY_DELAY_MS * 1000));
                    continue;
                }

                if ($response->successful()) {
                    return $response->json();
                }

                Log::error("Square API error [{$response->status()}]: {$response->body()}", [
                    'method' => $method,
                    'path'   => $path,
                ]);

                return $response->json() ?: null;
            } catch (\Exception $e) {
                Log::error("Square API exception: {$e->getMessage()}", [
                    'method'  => $method,
                    'path'    => $path,
                    'attempt' => $attempt,
                ]);

                if ($attempt < self::MAX_RETRIES) {
                    usleep(self::RETRY_DELAY_MS * 1000 * $attempt);
                }
            }
        }

        return null;
    }
}
