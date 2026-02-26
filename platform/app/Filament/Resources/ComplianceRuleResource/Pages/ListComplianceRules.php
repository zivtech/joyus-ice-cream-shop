<?php

namespace App\Filament\Resources\ComplianceRuleResource\Pages;

use App\Filament\Resources\ComplianceRuleResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListComplianceRules extends ListRecords
{
    protected static string $resource = ComplianceRuleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
