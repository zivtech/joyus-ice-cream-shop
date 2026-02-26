<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

class SchedulingEngineService
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.scheduling_engine.url', 'http://127.0.0.1:3100');
    }

    /**
     * Calculate weekly financial metrics for a location at a specific month.
     */
    public function weeklyMetrics(array $params): array
    {
        return $this->post('/compute/weekly-metrics', $params);
    }

    /**
     * Calculate monthly financial metrics.
     */
    public function monthlyMetrics(array $params): array
    {
        return $this->post('/compute/monthly-metrics', $params);
    }

    /**
     * Validate day coverage against workflow rules.
     */
    public function dayValidation(array $day, array $workflow): array
    {
        return $this->post('/compute/day-validation', [
            'day' => $day,
            'workflow' => $workflow,
        ]);
    }

    /**
     * Check financial viability of a schedule day.
     */
    public function financialViability(array $params): array
    {
        return $this->post('/compute/financial-viability', $params);
    }

    /**
     * Get weather impact signal for a date.
     */
    public function weatherImpact(array $params): array
    {
        return $this->post('/compute/weather-impact', $params);
    }

    /**
     * Assess overstaffing for a day.
     */
    public function overstaffAssessment(array $params): array
    {
        return $this->post('/compute/overstaff-assessment', $params);
    }

    /**
     * Run readiness checks for a week.
     */
    public function weekReadiness(array $params): array
    {
        return $this->post('/compute/week-readiness', $params);
    }

    /**
     * Evaluate seasonal trigger timing.
     */
    public function triggerTiming(array $params): array
    {
        return $this->post('/compute/trigger-timing', $params);
    }

    /**
     * Health check — verify the engine service is running.
     */
    public function healthCheck(): bool
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/health");
            return $response->ok() && ($response->json('status') === 'ok');
        } catch (ConnectionException) {
            return false;
        }
    }

    /**
     * Send a POST request to the engine service.
     */
    private function post(string $path, array $data): array
    {
        $response = Http::timeout(30)
            ->baseUrl($this->baseUrl)
            ->post($path, $data);

        if ($response->failed()) {
            $error = $response->json('error', 'Scheduling engine request failed');
            throw new \RuntimeException("Scheduling engine error: {$error}");
        }

        return $response->json();
    }
}
