<?php

namespace App\Repositories\Contracts;

interface ProductRepositoryInterface
{
    public function paginate($perPage = 10, $categoryId = null);
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function toggleActive($id);
    
    // Nested relations
    public function syncUnits($productId, array $unitsData);
    public function updateSafeguard($productId, array $safeguardData);
}
