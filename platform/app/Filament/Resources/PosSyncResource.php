<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PosSyncResource\Pages;
use App\Models\Organization;
use App\Models\PosSync;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PosSyncResource extends Resource
{
    protected static ?string $model = PosSync::class;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-path';

    protected static ?string $navigationGroup = 'Audit Log';

    protected static ?int $navigationSort = 1;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('tenant_id')->label('Tenant ID')->disabled(),
            Forms\Components\TextInput::make('location_id')->label('Location ID')->disabled(),
            Forms\Components\TextInput::make('adapter')->disabled(),
            Forms\Components\TextInput::make('period_start')->disabled(),
            Forms\Components\TextInput::make('period_end')->disabled(),
            Forms\Components\TextInput::make('transactions_synced')->disabled(),
            Forms\Components\TextInput::make('employees_synced')->disabled(),
            Forms\Components\TextInput::make('status')->disabled(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('tenant_id')
                    ->label('Organization')
                    ->formatStateUsing(fn ($state) => Organization::find($state)?->name ?? $state),
                Tables\Columns\TextColumn::make('location.code')->label('Location'),
                Tables\Columns\TextColumn::make('adapter'),
                Tables\Columns\TextColumn::make('period_start')->date(),
                Tables\Columns\TextColumn::make('period_end')->date(),
                Tables\Columns\TextColumn::make('transactions_synced'),
                Tables\Columns\TextColumn::make('employees_synced'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'success' => 'success',
                        'failed'  => 'danger',
                        'pending' => 'warning',
                        default   => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('adapter')
                    ->options([
                        'square' => 'Square',
                        'toast'  => 'Toast',
                        'clover' => 'Clover',
                    ]),
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'success' => 'Success',
                        'failed'  => 'Failed',
                        'pending' => 'Pending',
                    ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPosSyncs::route('/'),
            'view'  => Pages\ViewPosSync::route('/{record}'),
        ];
    }
}
