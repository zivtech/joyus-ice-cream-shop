<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ComplianceRuleResource\Pages;
use App\Models\ComplianceRule;
use App\Models\Organization;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ComplianceRuleResource extends Resource
{
    protected static ?string $model = ComplianceRule::class;

    protected static ?string $navigationIcon = 'heroicon-o-shield-check';

    protected static ?string $navigationGroup = 'Operations';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('tenant_id')
                ->label('Organization')
                ->options(Organization::pluck('name', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\TextInput::make('jurisdiction')
                ->required()
                ->maxLength(255),
            Forms\Components\TextInput::make('certification_type')
                ->required()
                ->maxLength(255),
            Forms\Components\Select::make('coverage_requirement')
                ->required()
                ->options([
                    'every_shift'     => 'Every Shift',
                    'operating_hours' => 'Operating Hours',
                    'per_location'    => 'Per Location',
                ]),
            Forms\Components\Select::make('constraint_type')
                ->required()
                ->options([
                    'hard' => 'Hard',
                    'soft' => 'Soft',
                ]),
            Forms\Components\TextInput::make('minimum_certified_count')
                ->numeric()
                ->required(),
            Forms\Components\TextInput::make('expiration_months')
                ->numeric(),
            Forms\Components\Toggle::make('active')
                ->default(true),
            Forms\Components\Textarea::make('notes')
                ->rows(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('jurisdiction')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('certification_type')->searchable(),
                Tables\Columns\TextColumn::make('coverage_requirement'),
                Tables\Columns\TextColumn::make('constraint_type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'hard' => 'danger',
                        'soft' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('minimum_certified_count')->label('Min Count'),
                Tables\Columns\IconColumn::make('active')->boolean(),
                Tables\Columns\TextColumn::make('tenant_id')
                    ->label('Organization')
                    ->formatStateUsing(fn ($state) => Organization::find($state)?->name ?? $state),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('constraint_type')
                    ->options([
                        'hard' => 'Hard',
                        'soft' => 'Soft',
                    ]),
                Tables\Filters\SelectFilter::make('jurisdiction')
                    ->options(
                        ComplianceRule::query()->distinct()->pluck('jurisdiction', 'jurisdiction')
                    ),
                Tables\Filters\TernaryFilter::make('active'),
            ])
            ->defaultSort('id', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListComplianceRules::route('/'),
            'create' => Pages\CreateComplianceRule::route('/create'),
            'edit'   => Pages\EditComplianceRule::route('/{record}/edit'),
        ];
    }
}
