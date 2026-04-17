<?php

namespace App\Services;

use App\Repositories\Contracts\StoreRepositoryInterface;
use App\Services\AuditService;

class StoreService
{
    protected $repository;
    protected $auditService;

    public function __construct(StoreRepositoryInterface $repository, AuditService $auditService)
    {
        $this->repository = $repository;
        $this->auditService = $auditService;
    }

    public function getPaginatedStores()
    {
        return $this->repository->paginate();
    }

    public function createStore(array $data)
    {
        $assignedUserIds = $data['assigned_users'] ?? [];
        unset($data['assigned_users']);

        $store = $this->repository->create($data);

        // Assign selected users to this store
        if (!empty($assignedUserIds)) {
            \App\Models\User::whereIn('id', $assignedUserIds)
                ->where('role', '!=', 'owner')
                ->update(['location_id' => $store->id]);
        }

        $this->auditService->logAction('create', $store, $data);
        return $store;
    }

    public function updateStore($id, array $data)
    {
        $assignedUserIds = $data['assigned_users'] ?? [];
        unset($data['assigned_users']);

        $store = $this->repository->update($id, $data);

        // Unassign users previously in this store but no longer selected
        \App\Models\User::where('location_id', $store->id)
            ->whereNotIn('id', $assignedUserIds)
            ->update(['location_id' => null]);

        // Assign newly selected users to this store
        if (!empty($assignedUserIds)) {
            \App\Models\User::whereIn('id', $assignedUserIds)
                ->where('role', '!=', 'owner')
                ->update(['location_id' => $store->id]);
        }

        $this->auditService->logAction('update', $store, $data);
        return $store;
    }

    public function toggleStore($id)
    {
        $store = $this->repository->find($id);

        if (!$store->is_active) {
            // Kita akan MENGAKTIFKAN toko, cek ketersediaan staff
            $hasStockist = $store->users()->where('role', 'stockist')->where('is_active', true)->exists();
            $hasKasir = $store->users()->where('role', 'kasir')->where('is_active', true)->exists();
            $hasAdmin = $store->users()->where('role', 'admin')->where('is_active', true)->exists();

            if (!$hasStockist || !$hasKasir || !$hasAdmin) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'store' => 'Tidak bisa mengaktifkan toko. Toko harus memiliki minimal 1 Stockist, 1 Kasir, dan 1 Admin aktif.'
                ]);
            }
        }

        $toggledStore = $this->repository->toggleActive($id);
        $this->auditService->logAction('toggle_active', $toggledStore, ['is_active' => $toggledStore->is_active]);
        return $toggledStore;
    }
}
