<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EmployeeResource\Pages;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Organization;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class EmployeeResource extends Resource
{
    protected static ?string $model = Employee::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';

    protected static ?string $navigationGroup = 'Tenants';

    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('tenant_id')
                ->label('Organization')
                ->options(Organization::pluck('name', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\Select::make('location_id')
                ->label('Location')
                ->options(Location::pluck('name', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\TextInput::make('name')
                ->required()
                ->maxLength(255),
            Forms\Components\TextInput::make('email')
                ->email()
                ->maxLength(255),
            Forms\Components\TextInput::make('phone')
                ->tel()
                ->maxLength(50),
            Forms\Components\TextInput::make('pay_rate')
                ->numeric()
                ->prefix('$'),
            Forms\Components\Select::make('status')
                ->options([
                    'active'     => 'Active',
                    'inactive'   => 'Inactive',
                    'terminated' => 'Terminated',
                ]),
            Forms\Components\TextInput::make('square_employee_id')
                ->maxLength(255),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('location.name')
                    ->label('Location')
                    ->sortable(),
                Tables\Columns\TextColumn::make('pay_rate')
                    ->money('usd')
                    ->label('Pay Rate'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active'     => 'success',
                        'inactive'   => 'gray',
                        'terminated' => 'danger',
                        default      => 'gray',
                    }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'active'     => 'Active',
                        'inactive'   => 'Inactive',
                        'terminated' => 'Terminated',
                    ]),
            ])
            ->defaultSort('id', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListEmployees::route('/'),
            'create' => Pages\CreateEmployee::route('/create'),
            'edit'   => Pages\EditEmployee::route('/{record}/edit'),
        ];
    }
}
