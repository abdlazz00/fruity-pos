<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     */
    protected $listen = [
        \App\Events\InboundCreated::class => [
            \App\Listeners\RecalculateWAC::class,
            \App\Listeners\SendInboundNotification::class,
            \App\Listeners\RecalculateHppBaseline::class,
        ],
        \App\Events\PriceLocked::class => [
            \App\Listeners\SyncPriceToAllBranches::class,
        ],
        // ── Sprint 8: Mutation Events ──
        \App\Events\MutationShipped::class => [
            \App\Listeners\NotifyMutationShipped::class,
        ],
        \App\Events\MutationReceived::class => [
            \App\Listeners\HandleMutationReceived::class,
        ],
        // ── Sprint 8: Waste Events ──
        \App\Events\WasteSubmitted::class => [
            \App\Listeners\NotifyWasteSubmitted::class,
        ],
        \App\Events\WasteApproved::class => [
            \App\Listeners\RecalculateHppBaseline::class,
        ],
        // ── Sprint 9: Reorder Point ──
        \App\Events\StockDeducted::class => [
            \App\Listeners\CheckReorderPoint::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        parent::boot();
    }
}
