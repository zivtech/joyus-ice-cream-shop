<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DeliverySyncResource\Pages;
use App\Models\DeliverySync;
use App\Models\Organization;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DeliverySyncResource extends Resource
{
    protected static ?string $model = DeliverySync::class;

    protected static ?string $navigationIcon = 'heroicon-o-truck';

    protected static ?string $navigationGroup = 'Audit Log';

    protected static ?int $navigationSort = 2;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('tenant_id')->label('Tenant ID')->disabled(),
            Forms\Components\TextInput::make('location_id')->label('Location ID')->disabled(),
            Forms\Components\TextInput::make('source')->disabled(),
            Forms\Components\TextInput::make('period_start')->disabled(),
            Forms\Components\TextInput::make('period_end')->disabled(),
            Forms\Components\TextInput::make('rows_total')->disabled(),
            Forms\Components\TextInput::make('rows_applied')->disabled(),
            Forms\Components\TextInput::make('rows_skipped')->disabled(),
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
                Tables\Columns\TextColumn::make('source')->label('Adapter'),
                Tables\Columns\TextColumn::make('period_start')->date(),
                Tables\Columns\TextColumn::make('period_end')->date(),
                Tables\Columns\TextColumn::make('rows_total')->label('Total'),
                Tables\Columns\TextColumn::make('rows_applied')->label('Applied'),
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
                Tables\Filters\SelectFilter::make('source')
                    ->label('Adapter')
                    ->options([
                        'doordash' => 'DoorDash',
                        'ubereats' => 'UberEats',
                        'grubhub'  => 'Grubhub',
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
            'index' => Pages\ListDeliverySyncs::route('/'),
            'view'  => Pages\ViewDeliverySync::route('/{record}'),
        ];
    }
}
