<?php

namespace App\Listeners;

use App\Events\InboundCreated;
use App\Services\PricingService;

/**
 * Listener: Recalculate hpp_baseline after inbound (S5-B13).
 *
 * When new stock arrives, the WAC changes. This listener
 * triggers a recalculation of hpp_baseline and notifies
 * Owners if the baseline has shifted (FR-310).
 */
class RecalculateHppBaseline
{
    protected $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    public function handle(InboundCreated $event): void
    {
        $inbound = $event->inbound->load('items');

        // Collect unique product IDs from this inbound
        $productIds = $inbound->items
            ->pluck('product_id')
            ->unique()
            ->values()
            ->toArray();

        // Recalculate baseline + send notification if changed
        $this->pricingService->onInboundReceived($productIds);
    }
}
