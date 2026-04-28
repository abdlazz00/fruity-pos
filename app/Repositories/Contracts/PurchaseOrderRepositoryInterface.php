<?php

namespace App\Repositories\Contracts;

interface PurchaseOrderRepositoryInterface
{
    public function paginate($perPage = 10, $locationId = null, $status = null);
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);

    // Items
    public function syncItems($poId, array $items);
    public function getItemsByPo($poId);
}
