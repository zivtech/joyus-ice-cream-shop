<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'pay_rate' => $this->pay_rate,
            'location_id' => $this->location_id,
            'certifications' => $this->certifications,
            'certification_expiry' => $this->certification_expiry,
            'square_employee_id' => $this->square_employee_id,
            'status' => $this->status,
            'hire_date' => $this->hire_date,
            'created_at' => $this->created_at,
        ];
    }
}
