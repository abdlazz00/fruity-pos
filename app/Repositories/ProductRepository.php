<?php

namespace App\Repositories;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;

class ProductRepository implements ProductRepositoryInterface
{
    protected $model;

    public function __construct(Product $model)
    {
        $this->model = $model;
    }

    public function paginate($perPage = 10, $categoryId = null)
    {
        $query = $this->model->with(['category', 'units', 'safeguard']);
        
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        return $query->latest()->paginate($perPage);
    }

    public function find($id)
    {
        return $this->model->with(['category', 'units', 'safeguard'])->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $product = $this->model->findOrFail($id);
        $product->update($data);
        return $product;
    }

    public function toggleActive($id)
    {
        $product = $this->model->findOrFail($id);
        $product->update(['is_active' => !$product->is_active]);
        return $product;
    }

    public function syncUnits($productId, array $unitsData)
    {
        $product = $this->model->findOrFail($productId);
        // Hapus unit lama, ganti baru
        $product->units()->delete();
        
        if (!empty($unitsData)) {
            $product->units()->createMany($unitsData);
        }
    }

    public function updateSafeguard($productId, array $safeguardData)
    {
        $product = $this->model->findOrFail($productId);
        $product->safeguard()->updateOrCreate(
            ['product_id' => $productId],
            $safeguardData
        );
    }
}
