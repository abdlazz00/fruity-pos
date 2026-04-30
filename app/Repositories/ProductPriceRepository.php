<?php

namespace App\Repositories;

use App\Models\ProductPrice;
use App\Models\Inventory;
use App\Models\Product;
use App\Repositories\Contracts\ProductPriceRepositoryInterface;
use Illuminate\Support\Facades\DB;

class ProductPriceRepository implements ProductPriceRepositoryInterface
{
    protected $model;

    public function __construct(ProductPrice $model)
    {
        $this->model = $model;
    }

    /**
     * Paginated list of product prices with product info.
     */
    public function paginate($perPage = 15, $status = null)
    {
        $query = $this->model
            ->with(['product.category', 'locker', 'tiers'])
            ->join('products', 'product_prices.product_id', '=', 'products.id')
            ->select('product_prices.*')
            ->where('products.is_active', true);

        if ($status) {
            $query->where('product_prices.status', $status);
        }

        return $query->orderBy('products.name')->paginate($perPage);
    }

    public function find($id)
    {
        return $this->model->with(['product.category', 'locker', 'tiers'])->findOrFail($id);
    }

    public function findByProduct($productId)
    {
        return $this->model->with(['product', 'tiers'])->where('product_id', $productId)->first();
    }

    /**
     * Create or update a product price row.
     */
    public function createOrUpdate($productId, array $data)
    {
        return $this->model->updateOrCreate(
            ['product_id' => $productId],
            $data
        );
    }

    /**
     * Lock or unlock a product price.
     */
    public function updateStatus($id, string $status, ?int $userId = null)
    {
        $price = $this->model->findOrFail($id);

        $updateData = ['status' => $status];

        if ($status === 'locked') {
            $updateData['locked_at'] = now();
            $updateData['locked_by'] = $userId;
        } else {
            $updateData['locked_at'] = null;
            $updateData['locked_by'] = null;
        }

        $price->update($updateData);
        return $price->fresh(['product', 'tiers']);
    }

    /**
     * Get avg_cost per location for a product (S5-B09 / FR-303).
     *
     * Returns collection of: location_id, location_name, location_code, quantity, avg_cost
     */
    public function getAvgCostPerLocation($productId)
    {
        return Inventory::where('product_id', $productId)
            ->join('locations', 'inventories.location_id', '=', 'locations.id')
            ->select([
                'inventories.location_id',
                'locations.name as location_name',
                'locations.code as location_code',
                'inventories.quantity',
                'inventories.avg_cost',
            ])
            ->orderBy('locations.name')
            ->get();
    }

    /**
     * Get all product IDs that have a locked price (S5-B12 / FR-307).
     */
    public function getLockedProductIds(): array
    {
        return $this->model
            ->where('status', 'locked')
            ->pluck('product_id')
            ->toArray();
    }
}
