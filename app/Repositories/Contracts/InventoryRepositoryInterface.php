<?php

namespace App\Repositories\Contracts;

interface InventoryRepositoryInterface
{
    public function getByProductAndLocation($productId, $locationId);
    public function updateOrCreateStock($productId, $locationId, float $addQty, float $newHpp);
    public function deductStock(int $productId, int $locationId, float $qty): bool;
}
