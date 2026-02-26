<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LocationResource\Pages;
use App\Models\Location;
use App\Models\Organization;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class LocationResource extends Resource
{
    protected static ?string $model = Location::class;

    protected static ?string $navigationIcon = 'heroicon-o-map-pin';

    protected static ?string $navigationGroup = 'Tenants';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('tenant_id')
                ->label('Organization')
                ->options(Organization::pluck('name', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\TextInput::make('code')
                ->required()
                ->maxLength(50),
            Forms\Components\TextInput::make('name')
                ->required()
                ->maxLength(255),
            Forms\Components\Select::make('timezone')
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
            Forms\Components\Select::make('pos_adapter')
                ->options([
                    'square' => 'Square',
                    'toast'  => 'Toast',
                    'clover' => 'Clover',
                ]),
            Forms\Components\TextInput::make('square_location_id')
                ->maxLength(255),
            Forms\Components\Select::make('status')
                ->options([
                    'active'   => 'Active',
                    'inactive' => 'Inactive',
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('code')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('tenant_id')
                    ->label('Organization')
                    ->formatStateUsing(fn ($state) => Organization::find($state)?->name ?? $state),
                Tables\Columns\TextColumn::make('pos_adapter')->label('POS Adapter'),
                Tables\Columns\TextColumn::make('square_location_id')->label('Square Location ID'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active'   => 'success',
                        'inactive' => 'gray',
                        default    => 'gray',
                    }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'active'   => 'Active',
                        'inactive' => 'Inactive',
                    ]),
                Tables\Filters\SelectFilter::make('pos_adapter')
                    ->options([
                        'square' => 'Square',
                        'toast'  => 'Toast',
                        'clover' => 'Clover',
                    ]),
            ])
            ->defaultSort('id', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListLocations::route('/'),
            'create' => Pages\CreateLocation::route('/create'),
            'edit'   => Pages\EditLocation::route('/{record}/edit'),
        ];
    }
}
