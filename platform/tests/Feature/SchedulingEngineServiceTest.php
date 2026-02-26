<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\SchedulingEngineService;
use Illuminate\Support\Facades\Http;

class SchedulingEngineServiceTest extends TestCase
{
    public function test_health_check_returns_true_when_engine_is_running(): void
    {
        Http::fake([
            '127.0.0.1:3100/health' => Http::response(['status' => 'ok']),
        ]);

        $service = app(SchedulingEngineService::class);
        $this->assertTrue($service->healthCheck());
    }

    public function test_health_check_returns_false_when_engine_is_down(): void
    {
        Http::fake([
            '127.0.0.1:3100/health' => Http::response(null, 500),
        ]);

        $service = app(SchedulingEngineService::class);
        $this->assertFalse($service->healthCheck());
    }

    public function test_day_validation_calls_engine(): void
    {
        Http::fake([
            '127.0.0.1:3100/compute/day-validation' => Http::response([
                'ok' => true,
                'message' => 'Coverage rules satisfied.',
            ]),
        ]);

        $service = app(SchedulingEngineService::class);
        $result = $service->dayValidation(
            ['slots' => []],
            ['minOpeners' => 1, 'minClosers' => 2, 'requirePolicyApproval' => true, 'requireGMApproval' => true]
        );

        $this->assertTrue($result['ok']);
    }

    public function test_weekly_metrics_calls_engine(): void
    {
        Http::fake([
            '127.0.0.1:3100/compute/weekly-metrics' => Http::response([
                'revenue' => 5000,
                'labor' => 1200,
                'gp' => 2400,
                'laborPct' => 24.0,
                'mondayRevenue' => 0,
                'mondayLabor' => 0,
                'managerAddedLabor' => 0,
                'managerFloorHours' => 0,
                'managerMgmtHours' => 0,
            ]),
        ]);

        $service = app(SchedulingEngineService::class);
        $result = $service->weeklyMetrics([
            'weekdayProfile' => [],
            'mondayLabor' => 0,
            'planKey' => 'current_6_day',
            'mondayScenario' => 'base',
            'settings' => [],
            'managerActive' => false,
            'managerMgmtShare' => 0,
            'mode' => 'include',
        ]);

        $this->assertEquals(5000, $result['revenue']);
    }

    public function test_engine_error_throws_runtime_exception(): void
    {
        Http::fake([
            '127.0.0.1:3100/compute/day-validation' => Http::response(['error' => 'Invalid input'], 400),
        ]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Scheduling engine error: Invalid input');

        $service = app(SchedulingEngineService::class);
        $service->dayValidation(['slots' => []], ['minOpeners' => 1, 'minClosers' => 2, 'requirePolicyApproval' => true, 'requireGMApproval' => true]);
    }
}
