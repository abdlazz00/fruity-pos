<?php

namespace App\Listeners;

use App\Events\PriceLocked;
use Illuminate\Support\Facades\Log;

/**
 * Listener: SyncPriceToAllBranches (S5-B11 / FR-308).
 *
 * When a price is locked, broadcast happens automatically via
 * PriceLocked's ShouldBroadcast interface. This listener handles
 * any additional server-side logic needed after a price lock,
 * such as logging or cache invalidation.
 */
class SyncPriceToAllBranches
{
    public function handle(PriceLocked $event): void
    {
        $price = $event->productPrice;

        Log::info('Price locked and synced to all branches', [
            'product_id'    => $price->product_id,
            'selling_price' => $price->selling_price,
            'locked_at'     => $price->locked_at,
        ]);

        // Future: Invalidate cached POS product catalog here
        // Cache::tags(['pos-catalog'])->flush();
    }
}
