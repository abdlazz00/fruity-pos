<?php

namespace App\Repositories\Contracts;

interface ReorderPointRepositoryInterface
{
    public function getByLocation(?int $locationId);
    public function findById(int $id);
    public function findByProductAndLocation(int $productId, int $locationId);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);
    public function getActiveByProductIds(array $productIds, int $locationId);
    public function getLowStockAlerts(?int $locationId);
}
