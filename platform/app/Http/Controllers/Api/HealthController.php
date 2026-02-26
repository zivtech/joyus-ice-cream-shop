<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SchedulingEngineService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * Public health check endpoint for monitoring.
     */
    public function status()
    {
        $services = [];

        // Database check
        $dbStart = microtime(true);
        try {
            DB::select('SELECT 1');
            $dbLatency = round((microtime(true) - $dbStart) * 1000);
            $services['database'] = ['status' => 'up', 'latency_ms' => $dbLatency];
        } catch (\Exception $e) {
            $services['database'] = ['status' => 'down', 'error' => $e->getMessage()];
        }

        // Scheduling engine check
        try {
            $engine = new SchedulingEngineService();
            $engineUp = $engine->healthCheck();
            $services['scheduling_engine'] = [
                'status' => $engineUp ? 'up' : 'down',
                'url'    => config('services.scheduling_engine.url', 'http://127.0.0.1:3100'),
            ];
        } catch (\Exception $e) {
            $services['scheduling_engine'] = ['status' => 'down', 'error' => $e->getMessage()];
        }

        // Cache check
        try {
            Cache::put('health_check', 'ok', 10);
            $cacheValue = Cache::get('health_check');
            $services['cache'] = ['status' => $cacheValue === 'ok' ? 'up' : 'down'];
        } catch (\Exception $e) {
            $services['cache'] = ['status' => 'down', 'error' => $e->getMessage()];
        }

        $allUp = collect($services)->every(fn ($s) => $s['status'] === 'up');

        return response()->json([
            'status'    => $allUp ? 'healthy' : 'degraded',
            'version'   => '1.0.0',
            'services'  => $services,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
