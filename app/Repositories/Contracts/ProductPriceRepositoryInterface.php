<?php

namespace App\Repositories\Contracts;

interface ProductPriceRepositoryInterface
{
    public function paginate($perPage = 15, $status = null);
    public function find($id);
    public function findByProduct($productId);
    public function createOrUpdate($productId, array $data);
    public function updateStatus($id, string $status, ?int $userId = null);
    public function getAvgCostPerLocation($productId);
    public function getLockedProductIds(): array;
}
