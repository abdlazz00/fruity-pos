<?php

namespace App\Repositories;

use App\Models\Transaction;
use App\Repositories\Contracts\TransactionRepositoryInterface;

class TransactionRepository implements TransactionRepositoryInterface
{
    protected $model;

    public function __construct(Transaction $model)
    {
        $this->model = $model;
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function find(int $id)
    {
        return $this->model->with(['items.product', 'user', 'location', 'shift'])->findOrFail($id);
    }

    /**
     * Get all transactions for a specific shift.
     */
    public function getByShift(int $shiftId)
    {
        return $this->model
            ->where('shift_id', $shiftId)
            ->where('status', 'completed')
            ->with('items')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Get paginated transactions for a location.
     */
    public function getByLocation(int $locationId, int $perPage = 15)
    {
        return $this->model
            ->where('location_id', $locationId)
            ->with(['user', 'items'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * Void a transaction (soft cancel).
     */
    public function voidTransaction(int $id)
    {
        $transaction = $this->model->findOrFail($id);
        $transaction->update(['status' => 'voided']);
        return $transaction->fresh(['items']);
    }

    /**
     * Sum total cash payments in a shift (for balance calculation).
     */
    public function sumCashByShift(int $shiftId): float
    {
        return (float) $this->model
            ->where('shift_id', $shiftId)
            ->where('status', 'completed')
            ->where('payment_method', 'cash')
            ->sum('total');
    }
}
