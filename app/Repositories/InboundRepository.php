<?php

namespace App\Repositories;

use App\Models\Inbound;
use App\Repositories\Contracts\InboundRepositoryInterface;

class InboundRepository implements InboundRepositoryInterface
{
    protected $model;

    public function __construct(Inbound $model)
    {
        $this->model = $model;
    }

    public function paginate($perPage = 10, $locationId = null)
    {
        $query = $this->model
            ->with(['purchaseOrder.supplier', 'receiver', 'location', 'items.product', 'items.productUnit']);

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        return $query->latest()->paginate($perPage);
    }

    public function find($id)
    {
        return $this->model
            ->with(['purchaseOrder.supplier', 'receiver', 'location', 'items.product', 'items.productUnit'])
            ->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }
}
