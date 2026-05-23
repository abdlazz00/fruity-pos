<?php

namespace App\Listeners;

use App\Events\InboundCreated;
use App\Services\PricingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

/**
 * Listener: Recalculate hpp_baseline after inbound (S5-B13).
 *
 * When new stock arrives, the WAC changes. This listener
 * triggers a recalculation of hpp_baseline and notifies
 * Owners if the baseline has shifted (FR-310).
 *
 * Implements ShouldQueue so heavy HPP recalculation + owner notifications
 * do not block the inbound receipt HTTP response.
 */
class RecalculateHppBaseline implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries   = 3;
    public int $backoff = 15;

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
