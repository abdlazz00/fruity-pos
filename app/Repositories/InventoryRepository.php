<?php

namespace App\Repositories;

use App\Models\Inventory;
use App\Repositories\Contracts\InventoryRepositoryInterface;

class InventoryRepository implements InventoryRepositoryInterface
{
    protected $model;

    public function __construct(Inventory $model)
    {
        $this->model = $model;
    }

    public function getByProductAndLocation($productId, $locationId)
    {
        return $this->model
            ->where('product_id', $productId)
            ->where('location_id', $locationId)
            ->first();
    }

    /**
     * Update or create inventory row and recalculate WAC.
     *
     * WAC formula (FR-207):
     *   new_avg = ((old_qty * old_avg) + (add_qty * new_hpp)) / (old_qty + add_qty)
     *
     * @param int   $productId
     * @param int   $locationId
     * @param float $addQty     Quantity to add (in base UoM)
     * @param float $newHpp     HPP of the incoming batch
     */
    public function updateOrCreateStock($productId, $locationId, float $addQty, float $newHpp)
    {
        $inventory = $this->model
            ->where('product_id', $productId)
            ->where('location_id', $locationId)
            ->first();

        if ($inventory) {
            $oldQty  = (float) $inventory->quantity;
            $oldAvg  = (float) $inventory->avg_cost;
            $totalQty = $oldQty + $addQty;

            // WAC recalculation (FR-207)
            $newAvg = $totalQty > 0
                ? (($oldQty * $oldAvg) + ($addQty * $newHpp)) / $totalQty
                : $newHpp;

            $inventory->update([
                'quantity' => $totalQty,
                'avg_cost' => round($newAvg, 2),
            ]);
        } else {
            $inventory = $this->model->create([
                'product_id'  => $productId,
                'location_id' => $locationId,
                'quantity'    => $addQty,
                'avg_cost'    => round($newHpp, 2),
            ]);
        }

        return $inventory;
    }

    /**
     * Deduct stock quantity for a product at a specific location (S6-B: POS sale).
     *
     * Does NOT change avg_cost — cost basis remains until next inbound.
     *
     * @throws \RuntimeException if insufficient stock
     */
    public function deductStock(int $productId, int $locationId, float $qty): bool
    {
        $inventory = $this->model
            ->where('product_id', $productId)
            ->where('location_id', $locationId)
            ->first();

        if (!$inventory || (float) $inventory->quantity < $qty) {
            throw new \RuntimeException(
                "Stok tidak mencukupi untuk product_id={$productId} di location_id={$locationId}. " .
                "Tersedia: " . ($inventory ? $inventory->quantity : 0) . ", diminta: {$qty}"
            );
        }

        $inventory->update([
            'quantity' => (float) $inventory->quantity - $qty,
        ]);

        return true;
    }
}
