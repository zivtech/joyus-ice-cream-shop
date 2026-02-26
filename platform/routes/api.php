<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\ComplianceRuleController;
use App\Http\Controllers\Api\DailyActualController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\OnboardingController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\PolicyExceptionRequestController;
use App\Http\Controllers\Api\PtoRequestController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ScheduleSlotController;
use App\Http\Controllers\Api\ShiftAssignmentController;
use App\Http\Controllers\Api\TenantSettingController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/health', [HealthController::class, 'status']);
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

    // Locations
    Route::apiResource('locations', LocationController::class);

    // Employees — named routes before apiResource to avoid {employee} catch
    Route::get('employees/certification-status', [EmployeeController::class, 'certificationStatus']);
    Route::apiResource('employees', EmployeeController::class);

    // Tenant settings (upsert replaces store)
    Route::apiResource('settings', TenantSettingController::class)->except(['store']);
    Route::put('/settings', [TenantSettingController::class, 'upsert']);

    // Schedules
    Route::apiResource('schedules', ScheduleController::class);
    Route::post('schedules/{schedule}/submit', [ScheduleController::class, 'submit']);
    Route::post('schedules/{schedule}/approve', [ScheduleController::class, 'approve']);
    Route::post('schedules/{schedule}/reject', [ScheduleController::class, 'reject']);
    Route::post('schedules/{schedule}/publish', [ScheduleController::class, 'publish']);

    // Schedule Slots
    Route::apiResource('schedule-slots', ScheduleSlotController::class)->only(['store', 'update', 'destroy']);

    // Shift Assignments
    Route::apiResource('shift-assignments', ShiftAssignmentController::class)->only(['store', 'destroy']);

    // Daily Actuals — named routes before generic ones
    Route::get('daily-actuals/variance', [DailyActualController::class, 'variance']);
    Route::get('daily-actuals/rollup', [DailyActualController::class, 'rollup']);
    Route::get('daily-actuals', [DailyActualController::class, 'index']);
    Route::get('daily-actuals/summary', [DailyActualController::class, 'summary']);

    // Compliance Rules — named routes before apiResource to avoid {compliance_rule} catch
    Route::get('compliance-rules/presets', [ComplianceRuleController::class, 'presets']);
    Route::post('compliance-rules/validate', [ComplianceRuleController::class, 'validate']);
    Route::apiResource('compliance-rules', ComplianceRuleController::class);

    // Exception Requests
    Route::post('exception-requests/{exceptionRequest}/approve', [PolicyExceptionRequestController::class, 'approve']);
    Route::post('exception-requests/{exceptionRequest}/reject', [PolicyExceptionRequestController::class, 'reject']);
    Route::apiResource('exception-requests', PolicyExceptionRequestController::class)->only(['index', 'store', 'show']);

    // PTO Requests
    Route::post('pto-requests/{ptoRequest}/approve', [PtoRequestController::class, 'approve']);
    Route::post('pto-requests/{ptoRequest}/deny', [PtoRequestController::class, 'deny']);
    Route::post('pto-requests/{ptoRequest}/cancel', [PtoRequestController::class, 'cancel']);
    Route::apiResource('pto-requests', PtoRequestController::class)->only(['index', 'store', 'show']);

    // Onboarding
    Route::get('onboarding/status', [OnboardingController::class, 'status']);
    Route::post('onboarding/connect-pos', [OnboardingController::class, 'connectPos']);
    Route::post('onboarding/import-data', [OnboardingController::class, 'importData']);
    Route::post('onboarding/configure-rules', [OnboardingController::class, 'configureRules']);

    // Billing
    Route::get('billing/status', [BillingController::class, 'status']);
    Route::post('billing/subscribe', [BillingController::class, 'subscribe']);
    Route::post('billing/cancel', [BillingController::class, 'cancel']);
});
