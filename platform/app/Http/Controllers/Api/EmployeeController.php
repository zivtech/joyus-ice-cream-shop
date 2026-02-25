<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Employee::class);

        $query = Employee::where('tenant_id', $request->user()->organization_id);

        if ($request->has('location_id')) {
            $query->where('location_id', $request->input('location_id'));
        }

        return EmployeeResource::collection($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Employee::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'string', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'pay_rate' => ['required', 'numeric', 'min:0'],
            'location_id' => ['sometimes', 'nullable', 'integer', 'exists:locations,id'],
            'certifications' => ['sometimes', 'nullable', 'array'],
            'certification_expiry' => ['sometimes', 'nullable', 'array'],
            'square_employee_id' => ['sometimes', 'nullable', 'string', 'max:100'],
            'availability' => ['sometimes', 'nullable', 'array'],
            'hire_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['required', 'string', 'in:active,inactive,terminated'],
        ]);

        $employee = Employee::create(array_merge($validated, [
            'tenant_id' => $request->user()->organization_id,
        ]));

        return (new EmployeeResource($employee))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $employee = Employee::findOrFail($id);

        $this->authorize('view', $employee);

        return new EmployeeResource($employee);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $employee = Employee::findOrFail($id);

        $this->authorize('update', $employee);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'string', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'pay_rate' => ['sometimes', 'numeric', 'min:0'],
            'location_id' => ['sometimes', 'nullable', 'integer', 'exists:locations,id'],
            'certifications' => ['sometimes', 'nullable', 'array'],
            'certification_expiry' => ['sometimes', 'nullable', 'array'],
            'square_employee_id' => ['sometimes', 'nullable', 'string', 'max:100'],
            'availability' => ['sometimes', 'nullable', 'array'],
            'hire_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', 'string', 'in:active,inactive,terminated'],
        ]);

        $employee->update($validated);

        return new EmployeeResource($employee);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $employee = Employee::findOrFail($id);

        $this->authorize('delete', $employee);

        $employee->delete();

        return response()->noContent();
    }
}
