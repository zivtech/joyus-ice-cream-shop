<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HealthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_200_without_auth(): void
    {
        Http::fake([
            '127.0.0.1:3100/health' => Http::response(['status' => 'ok'], 200),
        ]);

        $response = $this->getJson('/api/health');

        $response->assertOk()
            ->assertJsonStructure([
                'status',
                'version',
                'services' => ['database', 'scheduling_engine', 'cache'],
                'timestamp',
            ]);
    }

    public function test_health_shows_database_status(): void
    {
        Http::fake([
            '127.0.0.1:3100/health' => Http::response(['status' => 'ok'], 200),
        ]);

        $response = $this->getJson('/api/health');

        $response->assertOk()
            ->assertJsonPath('services.database.status', 'up');
    }

    public function test_health_shows_scheduling_engine_status(): void
    {
        Http::fake([
            '127.0.0.1:3100/health' => Http::response(['status' => 'ok'], 200),
        ]);

        $response = $this->getJson('/api/health');

        $response->assertOk()
            ->assertJsonPath('services.scheduling_engine.status', 'up');
    }

    public function test_health_shows_degraded_when_engine_down(): void
    {
        Http::fake([
            '127.0.0.1:3100/health' => Http::response(['status' => 'error'], 500),
        ]);

        $response = $this->getJson('/api/health');

        $response->assertOk()
            ->assertJsonPath('services.scheduling_engine.status', 'down')
            ->assertJsonPath('status', 'degraded');
    }

    public function test_health_shows_cache_status(): void
    {
        Http::fake([
            '127.0.0.1:3100/health' => Http::response(['status' => 'ok'], 200),
        ]);

        $response = $this->getJson('/api/health');

        $response->assertOk()
            ->assertJsonPath('services.cache.status', 'up');
    }
}
