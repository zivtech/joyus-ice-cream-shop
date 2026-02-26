<?php

namespace App\Filament\Resources\ComplianceRuleResource\Pages;

use App\Filament\Resources\ComplianceRuleResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditComplianceRule extends EditRecord
{
    protected static string $resource = ComplianceRuleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
