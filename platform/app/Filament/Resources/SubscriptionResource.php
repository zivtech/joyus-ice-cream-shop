<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SubscriptionResource\Pages;
use App\Models\Organization;
use App\Models\Subscription;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SubscriptionResource extends Resource
{
    protected static ?string $model = Subscription::class;

    protected static ?string $navigationIcon = 'heroicon-o-credit-card';

    protected static ?string $navigationGroup = 'Platform';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('tenant_id')
                ->label('Organization')
                ->options(Organization::pluck('name', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\Select::make('plan')
                ->required()
                ->options([
                    'starter'      => 'Starter',
                    'professional' => 'Professional',
                    'enterprise'   => 'Enterprise',
                ]),
            Forms\Components\Select::make('status')
                ->required()
                ->options([
                    'trialing'  => 'Trialing',
                    'active'    => 'Active',
                    'past_due'  => 'Past Due',
                    'canceled'  => 'Canceled',
                ]),
            Forms\Components\TextInput::make('stripe_subscription_id')
                ->maxLength(255),
            Forms\Components\TextInput::make('stripe_customer_id')
                ->maxLength(255),
            Forms\Components\DateTimePicker::make('trial_ends_at'),
            Forms\Components\DateTimePicker::make('current_period_start'),
            Forms\Components\DateTimePicker::make('current_period_end'),
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
                Tables\Columns\TextColumn::make('plan')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'starter'      => 'gray',
                        'professional' => 'info',
                        'enterprise'   => 'success',
                        default        => 'gray',
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active'   => 'success',
                        'trialing' => 'info',
                        'canceled' => 'danger',
                        'past_due' => 'warning',
                        default    => 'gray',
                    }),
                Tables\Columns\TextColumn::make('trial_ends_at')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('current_period_end')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('plan')
                    ->options([
                        'starter'      => 'Starter',
                        'professional' => 'Professional',
                        'enterprise'   => 'Enterprise',
                    ]),
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'trialing' => 'Trialing',
                        'active'   => 'Active',
                        'past_due' => 'Past Due',
                        'canceled' => 'Canceled',
                    ]),
            ])
            ->defaultSort('id', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListSubscriptions::route('/'),
            'create' => Pages\CreateSubscription::route('/create'),
            'edit'   => Pages\EditSubscription::route('/{record}/edit'),
        ];
    }
}
