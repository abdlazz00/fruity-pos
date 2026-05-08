<?php

namespace App\Repositories;

use App\Models\StockOpname;
use App\Repositories\Contracts\OpnameRepositoryInterface;

class OpnameRepository implements OpnameRepositoryInterface
{
    protected $model;

    public function __construct(StockOpname $model)
    {
        $this->model = $model;
    }

    public function getByLocation(?int $locationId, ?string $status = null)
    {
        $query = $this->model
            ->with(['location', 'conductor', 'approver', 'items.product'])
            ->latest();

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate(15);
    }

    public function findById(int $id)
    {
        return $this->model
            ->with(['location', 'conductor', 'approver', 'items.product'])
            ->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data)
    {
        $opname = $this->model->findOrFail($id);
        $opname->update($data);
        return $opname->fresh();
    }
}
