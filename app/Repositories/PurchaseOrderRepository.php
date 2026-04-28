<?php

namespace App\Repositories;

use App\Models\PurchaseOrder;
use App\Repositories\Contracts\PurchaseOrderRepositoryInterface;

class PurchaseOrderRepository implements PurchaseOrderRepositoryInterface
{
    protected $model;

    public function __construct(PurchaseOrder $model)
    {
        $this->model = $model;
    }

    public function paginate($perPage = 10, $locationId = null, $status = null)
    {
        $query = $this->model
            ->with(['supplier', 'location', 'creator', 'items.product', 'items.productUnit']);

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->latest()->paginate($perPage);
    }

    public function find($id)
    {
        return $this->model
            ->with(['supplier', 'location', 'creator', 'items.product', 'items.productUnit', 'inbounds.items'])
            ->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $po = $this->model->findOrFail($id);
        $po->update($data);
        return $po;
    }

    public function delete($id)
    {
        $po = $this->model->findOrFail($id);
        $po->delete();
        return true;
    }

    public function syncItems($poId, array $items)
    {
        $po = $this->model->findOrFail($poId);
        // Delete existing items, then recreate
        $po->items()->delete();

        if (!empty($items)) {
            $po->items()->createMany($items);
        }

        return $po->load('items.product', 'items.productUnit');
    }

    public function getItemsByPo($poId)
    {
        $po = $this->model->findOrFail($poId);
        return $po->items()->with(['product', 'productUnit'])->get();
    }
}
