<?php

namespace App\Filament\Resources\OrganizationResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class LocationsRelationManager extends RelationManager
{
    protected static string $relationship = 'locations';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('code')
                ->required()
                ->maxLength(50),
            Forms\Components\TextInput::make('name')
                ->required()
                ->maxLength(255),
            Forms\Components\Select::make('pos_adapter')
                ->options([
                    'square' => 'Square',
                    'toast'  => 'Toast',
                    'clover' => 'Clover',
                ]),
            Forms\Components\Select::make('status')
                ->options([
                    'active'   => 'Active',
                    'inactive' => 'Inactive',
                ])
                ->default('active'),
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
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code'),
                Tables\Columns\TextColumn::make('name'),
                Tables\Columns\TextColumn::make('pos_adapter')->label('POS Adapter'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active'   => 'success',
                        'inactive' => 'gray',
                        default    => 'gray',
                    }),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
