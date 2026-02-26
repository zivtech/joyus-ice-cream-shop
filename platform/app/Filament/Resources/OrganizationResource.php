<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrganizationResource\Pages;
use App\Filament\Resources\OrganizationResource\RelationManagers;
use App\Models\Organization;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OrganizationResource extends Resource
{
    protected static ?string $model = Organization::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';

    protected static ?string $navigationGroup = 'Tenants';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')
                ->required()
                ->maxLength(255),
            Forms\Components\TextInput::make('slug')
                ->required()
                ->maxLength(255),
            Forms\Components\Select::make('timezone')
                ->required()
                ->options([
                    'America/New_York'    => 'Eastern Time (ET)',
                    'America/Chicago'     => 'Central Time (CT)',
                    'America/Denver'      => 'Mountain Time (MT)',
                    'America/Los_Angeles' => 'Pacific Time (PT)',
                    'America/Anchorage'   => 'Alaska Time (AKT)',
                    'Pacific/Honolulu'    => 'Hawaii Time (HT)',
                    'America/Phoenix'     => 'Arizona (no DST)',
                ])
                ->searchable(),
            Forms\Components\Select::make('status')
                ->required()
                ->options([
                    'active'    => 'Active',
                    'inactive'  => 'Inactive',
                    'suspended' => 'Suspended',
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('slug')->searchable(),
                Tables\Columns\TextColumn::make('timezone'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active'    => 'success',
                        'inactive'  => 'gray',
                        'suspended' => 'danger',
                        default     => 'gray',
                    }),
                Tables\Columns\TextColumn::make('locations_count')
                    ->counts('locations')
                    ->label('Locations'),
                Tables\Columns\TextColumn::make('users_count')
                    ->counts('users')
                    ->label('Users'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'active'    => 'Active',
                        'inactive'  => 'Inactive',
                        'suspended' => 'Suspended',
                    ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelationManagers(): array
    {
        return [
            RelationManagers\LocationsRelationManager::class,
            RelationManagers\UsersRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListOrganizations::route('/'),
            'create' => Pages\CreateOrganization::route('/create'),
            'edit'   => Pages\EditOrganization::route('/{record}/edit'),
        ];
    }
}
