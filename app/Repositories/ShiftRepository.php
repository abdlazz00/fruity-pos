<?php

namespace App\Repositories;

use App\Models\Shift;
use App\Repositories\Contracts\ShiftRepositoryInterface;

class ShiftRepository implements ShiftRepositoryInterface
{
    protected $model;

    public function __construct(Shift $model)
    {
        $this->model = $model;
    }

    /**
     * Find the currently active (open) shift for a user.
     */
    public function findActiveShift(int $userId)
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('status', 'open')
            ->with('location')
            ->first();
    }

    public function find(int $id)
    {
        return $this->model->with(['user', 'location', 'transactions.items'])->findOrFail($id);
    }

    /**
     * Open a new shift.
     */
    public function openShift(array $data)
    {
        return $this->model->create($data);
    }

    /**
     * Close an open shift with balance reconciliation data.
     */
    public function closeShift(int $id, array $data)
    {
        $shift = $this->model->findOrFail($id);
        $shift->update($data);
        return $shift->fresh(['user', 'location']);
    }

    /**
     * Get paginated shifts for a location (Owner view).
     */
    public function getShiftsByLocation(int $locationId, int $perPage = 15)
    {
        return $this->model
            ->where('location_id', $locationId)
            ->with(['user'])
            ->orderByDesc('opened_at')
            ->paginate($perPage);
    }

    /**
     * Get paginated shifts for a specific user (Kasir/Admin view).
     */
    public function getShiftsByUser(int $userId, int $perPage = 15)
    {
        return $this->model
            ->where('user_id', $userId)
            ->with(['location'])
            ->orderByDesc('opened_at')
            ->paginate($perPage);
    }
}
