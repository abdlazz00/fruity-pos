<?php

namespace App\Repositories\Contracts;

interface InventoryRepositoryInterface
{
    public function getByProductAndLocation($productId, $locationId);
    public function updateOrCreateStock($productId, $locationId, float $addQty, float $newHpp);
}
