<x-filament-widgets::widget>
    <x-filament::section heading="Recent Activity">
        <div class="space-y-3">
            @forelse ($this->getActivities() as $activity)
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 mt-0.5">
                        <x-filament::icon
                            :icon="$activity['icon']"
                            class="h-5 w-5 text-gray-400 dark:text-gray-500"
                        />
                    </div>
                    <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {{ $activity['label'] }}
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ $activity['detail'] }}
                        </p>
                    </div>
                    <div class="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {{ $activity['time']?->diffForHumans() ?? '' }}
                    </div>
                </div>
            @empty
                <p class="text-sm text-gray-500 dark:text-gray-400">No recent activity.</p>
            @endforelse
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
