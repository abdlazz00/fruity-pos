<?php

namespace App\Repositories;

use App\Models\ReorderPoint;
use App\Models\Inventory;
use App\Repositories\Contracts\ReorderPointRepositoryInterface;

class ReorderPointRepository implements ReorderPointRepositoryInterface
{
    protected $model;

    public function __construct(ReorderPoint $model)
    {
        $this->model = $model;
    }

    /**
     * Get all reorder points for a location (or all locations if null).
     */
    public function getByLocation(?int $locationId)
    {
        $query = $this->model
            ->with(['product', 'location', 'creator', 'updater'])
            ->orderByDesc('updated_at');

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        return $query->paginate(20);
    }

    /**
     * Find a reorder point by ID.
     */
    public function findById(int $id)
    {
        return $this->model
            ->with(['product', 'location', 'creator', 'updater'])
            ->findOrFail($id);
    }

    /**
     * Find a reorder point for a specific product at a specific location (FR-1210).
     */
    public function findByProductAndLocation(int $productId, int $locationId)
    {
        return $this->model
            ->where('product_id', $productId)
            ->where('location_id', $locationId)
            ->first();
    }

    /**
     * Create a new reorder point.
     */
    public function create(array $data)
    {
        return $this->model->create($data);
    }

    /**
     * Update a reorder point.
     */
    public function update(int $id, array $data)
    {
        $reorderPoint = $this->model->findOrFail($id);
        $reorderPoint->update($data);
        return $reorderPoint->fresh(['product', 'location']);
    }

    /**
     * Delete a reorder point.
     */
    public function delete(int $id)
    {
        $reorderPoint = $this->model->findOrFail($id);
        $reorderPoint->delete();
        return true;
    }

    /**
     * Get active reorder points for specific products at a specific location.
     * Used by CheckReorderPoint listener to evaluate thresholds (FR-1211).
     */
    public function getActiveByProductIds(array $productIds, int $locationId)
    {
        return $this->model
            ->where('location_id', $locationId)
            ->where('is_active', true)
            ->whereIn('product_id', $productIds)
            ->with('product')
            ->get();
    }

    /**
     * Get low stock alerts: active reorder points where current inventory < min_quantity.
     * Used by Dashboard (FR-1213) and ReorderPoint index page.
     */
    public function getLowStockAlerts(?int $locationId)
    {
        $query = $this->model
            ->where('is_active', true)
            ->with(['product', 'location']);

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        return $query->get()->filter(function ($rp) {
            $inventory = Inventory::where('product_id', $rp->product_id)
                ->where('location_id', $rp->location_id)
                ->first();

            $currentStock = $inventory ? (float) $inventory->quantity : 0;
            return $currentStock < (float) $rp->min_quantity;
        })->values();
    }
}
