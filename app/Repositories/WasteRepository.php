<?php

namespace App\Repositories;

use App\Models\WasteRequest;
use App\Repositories\Contracts\WasteRepositoryInterface;

class WasteRepository implements WasteRepositoryInterface
{
    protected $model;

    public function __construct(WasteRequest $model)
    {
        $this->model = $model;
    }

    public function getByLocation(?int $locationId, ?string $status = null)
    {
        $query = $this->model
            ->with(['location', 'requester', 'approver', 'items.product'])
            ->latest();

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate(15);
    }

    /**
     * Get all pending waste requests across all locations (for Owner approval).
     */
    public function getAllPending()
    {
        return $this->model
            ->where('status', 'pending')
            ->with(['location', 'requester', 'items.product'])
            ->latest()
            ->paginate(15);
    }

    public function findById(int $id)
    {
        return $this->model
            ->with(['location', 'requester', 'approver', 'items.product'])
            ->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data)
    {
        $waste = $this->model->findOrFail($id);
        $waste->update($data);
        return $waste->fresh();
    }
}
