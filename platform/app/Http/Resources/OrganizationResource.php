<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
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
            'slug' => $this->slug,
            'role_labels' => $this->role_labels,
            'settings' => $this->settings,
            'timezone' => $this->timezone,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
