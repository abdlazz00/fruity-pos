<?php

namespace App\Repositories;

use App\Models\StockMutation;
use App\Repositories\Contracts\MutationRepositoryInterface;

class MutationRepository implements MutationRepositoryInterface
{
    protected $model;

    public function __construct(StockMutation $model)
    {
        $this->model = $model;
    }

    public function getByLocation(?int $locationId, ?string $status = null)
    {
        $query = $this->model
            ->with(['fromLocation', 'toLocation', 'creator', 'receiver', 'items.product'])
            ->latest();

        if ($locationId) {
            $query->where(function ($q) use ($locationId) {
                $q->where('from_location_id', $locationId)
                  ->orWhere('to_location_id', $locationId);
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate(15);
    }

    public function findById(int $id)
    {
        return $this->model
            ->with(['fromLocation', 'toLocation', 'creator', 'receiver', 'items.product'])
            ->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data)
    {
        $mutation = $this->model->findOrFail($id);
        $mutation->update($data);
        return $mutation->fresh();
    }
}
