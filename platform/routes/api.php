<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\TenantSettingController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes with tenant scoping
Route::middleware(['auth:sanctum', 'tenant.scope'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Organization
    Route::get('/organization', [OrganizationController::class, 'show']);
    Route::patch('/organization', [OrganizationController::class, 'update']);
    Route::patch('/organization/role-labels', [OrganizationController::class, 'updateRoleLabels']);

    // Locations & Employees
    Route::apiResource('locations', LocationController::class);
    Route::apiResource('employees', EmployeeController::class);

    // Tenant settings (upsert replaces store)
    Route::apiResource('settings', TenantSettingController::class)->except(['store']);
    Route::put('/settings', [TenantSettingController::class, 'upsert']);
});
