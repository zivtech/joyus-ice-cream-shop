<?php

namespace App\Providers;

use App\Models\Employee;
use App\Models\Location;
use App\Models\TenantSetting;
use App\Policies\EmployeePolicy;
use App\Policies\LocationPolicy;
use App\Policies\TenantSettingPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider;

class AppServiceProvider extends AuthServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Location::class      => LocationPolicy::class,
        Employee::class      => EmployeePolicy::class,
        TenantSetting::class => TenantSettingPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\SchedulingEngineService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
