<?php

namespace App\Listeners;

use App\Events\StockDeducted;
use App\Services\ReorderPointService;

/**
 * Listener: Check Reorder Point thresholds after stock deduction (S9-B05).
 *
 * Attached to: StockDeducted event (fired from POS sale, Waste approved,
 * Opname approved, Mutation shipped).
 *
 * FR-1211: Cek REAL-TIME setiap stok berkurang.
 * FR-1214: Cooldown 1 jam per produk per toko.
 */
class CheckReorderPoint
{
    protected $reorderPointService;

    public function __construct(ReorderPointService $reorderPointService)
    {
        $this->reorderPointService = $reorderPointService;
    }

    public function handle(StockDeducted $event): void
    {
        $this->reorderPointService->checkThreshold(
            $event->productIds,
            $event->locationId
        );
    }
}
