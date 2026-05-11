<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired whenever inventory stock is reduced at a specific location.
 *
 * Triggers: POS sale, Waste approved, Opname approved, Mutation shipped.
 * Listener: CheckReorderPoint (S9-B05)
 */
class StockDeducted
{
    use Dispatchable, SerializesModels;

    /**
     * Array of product IDs whose stock was reduced.
     * @var array<int>
     */
    public array $productIds;

    /**
     * The location ID where stock was reduced.
     */
    public int $locationId;

    /**
     * Create a new event instance.
     *
     * @param array<int> $productIds
     * @param int $locationId
     */
    public function __construct(array $productIds, int $locationId)
    {
        $this->productIds = $productIds;
        $this->locationId = $locationId;
    }
}
