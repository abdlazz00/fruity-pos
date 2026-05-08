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

    public function handle(object $event): void
    {
        $productIds = [];

        if ($event instanceof \App\Events\InboundCreated) {
            $inbound = $event->inbound->load('items');
            $productIds = $inbound->items->pluck('product_id')->unique()->values()->toArray();
        } elseif ($event instanceof \App\Events\WasteApproved) {
            $waste = $event->wasteRequest->load('items');
            $productIds = $waste->items->pluck('product_id')->unique()->values()->toArray();
        } else {
            return;
        }

        if (!empty($productIds)) {
            $this->pricingService->onInboundReceived($productIds);
        }
    }
}
