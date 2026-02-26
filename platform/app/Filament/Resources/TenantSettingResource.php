<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TenantSettingResource\Pages;
use App\Models\Organization;
use App\Models\TenantSetting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TenantSettingResource extends Resource
{
    protected static ?string $model = TenantSetting::class;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationGroup = 'Platform';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('tenant_id')
                ->label('Organization')
                ->options(Organization::pluck('name', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\TextInput::make('category')
                ->required()
                ->maxLength(255),
            Forms\Components\TextInput::make('key_name')
                ->required()
                ->maxLength(255),
            Forms\Components\Textarea::make('value')
                ->label('Value (JSON)')
                ->rows(4),
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
                Tables\Columns\TextColumn::make('category')->sortable(),
                Tables\Columns\TextColumn::make('key_name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('value')
                    ->formatStateUsing(fn ($state) => is_array($state)
                        ? substr(json_encode($state), 0, 50)
                        : substr((string) $state, 0, 50)
                    )
                    ->label('Value'),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category')
                    ->options(
                        TenantSetting::query()->distinct()->pluck('category', 'category')
                    ),
            ])
            ->defaultSort('updated_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListTenantSettings::route('/'),
            'create' => Pages\CreateTenantSetting::route('/create'),
            'edit'   => Pages\EditTenantSetting::route('/{record}/edit'),
        ];
    }
}
