<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\StoreRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Enums\Role;

class UserService
{
    protected $repository;
    protected $storeRepository;
    protected $auditService;

    public function __construct(
        UserRepositoryInterface $repository,
        StoreRepositoryInterface $storeRepository,
        AuditService $auditService
    ) {
        $this->repository = $repository;
        $this->storeRepository = $storeRepository;
        $this->auditService = $auditService;
    }

    public function getPaginatedUsers($locationId = null)
    {
        return $this->repository->paginateByLocation($locationId);
    }

    public function createUser(array $data)
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        
        $user = $this->repository->create($data);
        $this->auditService->logAction('create', $user, $data);
        return $user;
    }

    public function updateUser($id, array $data)
    {
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user = $this->repository->update($id, $data);
        $this->auditService->logAction('update', $user, $data);
        return $user;
    }

    public function toggleUser($id)
    {
        $user = $this->repository->find($id);

        // Validasi minimal 1 aktif role
        if ($user->is_active && $user->location_id && in_array($user->role->value, ['stockist', 'kasir', 'admin'])) {
            $location = $this->storeRepository->find($user->location_id);
            if ($location->is_active) {
                $countRoles = $this->repository->countByRoleLocation($user->role->value, $user->location_id);
                if ($countRoles <= 1) {
                    throw ValidationException::withMessages([
                        'user' => 'Tidak bisa menonaktifkan pengguna. Setiap toko aktif minimal harus memiliki 1 ' . ucfirst($user->role->value) . '.'
                    ]);
                }
            }
        }

        $toggledUser = $this->repository->toggleActive($id);
        $this->auditService->logAction('toggle_active', $toggledUser, ['is_active' => $toggledUser->is_active]);
        return $toggledUser;
    }
}
