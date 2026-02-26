<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ScheduleResource\Pages;
use App\Models\Organization;
use App\Models\Schedule;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ScheduleResource extends Resource
{
    protected static ?string $model = Schedule::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationGroup = 'Operations';

    protected static ?int $navigationSort = 2;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('tenant_id')
                ->label('Tenant ID')
                ->disabled(),
            Forms\Components\TextInput::make('location_id')
                ->label('Location ID')
                ->disabled(),
            Forms\Components\TextInput::make('week_start')
                ->disabled(),
            Forms\Components\Select::make('status')
                ->options([
                    'draft'     => 'Draft',
                    'pending'   => 'Pending',
                    'approved'  => 'Approved',
                    'rejected'  => 'Rejected',
                    'published' => 'Published',
                ])
                ->label('Status (emergency intervention only)'),
            Forms\Components\Textarea::make('notes')
                ->rows(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('location.name')
                    ->label('Location')
                    ->sortable(),
                Tables\Columns\TextColumn::make('week_start')->date()->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'draft'     => 'gray',
                        'pending'   => 'warning',
                        'approved'  => 'success',
                        'rejected'  => 'danger',
                        'published' => 'info',
                        default     => 'gray',
                    }),
                Tables\Columns\TextColumn::make('submitted_at')->dateTime(),
                Tables\Columns\TextColumn::make('published_at')->dateTime(),
                Tables\Columns\TextColumn::make('tenant_id')
                    ->label('Organization')
                    ->formatStateUsing(fn ($state) => Organization::find($state)?->name ?? $state),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft'     => 'Draft',
                        'pending'   => 'Pending',
                        'approved'  => 'Approved',
                        'rejected'  => 'Rejected',
                        'published' => 'Published',
                    ]),
            ])
            ->defaultSort('week_start', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSchedules::route('/'),
            'view'  => Pages\ViewSchedule::route('/{record}'),
        ];
    }
}
