<?php

namespace App\Listeners;

use App\Events\InboundCreated;
use App\Repositories\Contracts\InventoryRepositoryInterface;

class RecalculateWAC
{
    protected $inventoryRepo;

    public function __construct(InventoryRepositoryInterface $inventoryRepo)
    {
        $this->inventoryRepo = $inventoryRepo;
    }

    /**
     * Handle the InboundCreated event.
     *
     * For each inbound item:
     *  1. Calculate HPP Mentah = total_buy_price / (quantity_received × content_per_unit)
     *  2. Convert received qty to base UoM = quantity_received × content_per_unit
     *  3. Update inventory WAC using formula:
     *     new_avg = ((old_qty × old_avg) + (base_qty × hpp_raw)) / (old_qty + base_qty)
     */
    public function handle(InboundCreated $event): void
    {
        $inbound = $event->inbound->load('items.productUnit');
        $locationId = $inbound->location_id;

        foreach ($inbound->items as $item) {
            // Convert to base UoM quantity
            $conversionFactor = $item->productUnit?->conversion_to_base ?? 1;
            $baseQty = (float) $item->quantity_received * (float) $conversionFactor;

            // HPP raw is already pre-calculated and stored on the item
            $hppRaw = (float) $item->hpp_raw_calculated;

            // Update inventory stock + WAC
            $this->inventoryRepo->updateOrCreateStock(
                $item->product_id,
                $locationId,
                $baseQty,
                $hppRaw
            );
        }
    }
}
