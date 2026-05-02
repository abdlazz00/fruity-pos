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
        
        $newUnitNames = collect($unitsData)->pluck('name')->filter()->toArray();

        // Hapus unit lama yang tidak ada di request baru
        foreach ($product->units as $unit) {
            if (!in_array($unit->name, $newUnitNames)) {
                try {
                    $unit->delete();
                } catch (\Exception $e) {
                    // Abaikan jika unit sedang dipakai di inbound_items atau table lain
                }
            }
        }

        // Tambahkan atau perbarui unit
        foreach ($unitsData as $data) {
            if (isset($data['name'])) {
                $product->units()->updateOrCreate(
                    ['name' => $data['name']],
                    $data
                );
            }
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
