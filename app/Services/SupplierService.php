<?php

namespace App\Services;

use App\Repositories\Contracts\SupplierRepositoryInterface;

class SupplierService
{
    protected $repository;
    protected $auditService;

    public function __construct(SupplierRepositoryInterface $repository, AuditService $auditService)
    {
        $this->repository = $repository;
        $this->auditService = $auditService;
    }

    public function getPaginatedSuppliers()
    {
        return $this->repository->paginate();
    }

    public function createSupplier(array $data)
    {
        $supplier = $this->repository->create($data);
        $this->auditService->logAction('create', $supplier, $data);
        return $supplier;
    }

    public function updateSupplier($id, array $data)
    {
        $supplier = $this->repository->update($id, $data);
        $this->auditService->logAction('update', $supplier, $data);
        return $supplier;
    }

    public function toggleSupplier($id)
    {
        $supplier = $this->repository->toggleActive($id);
        $this->auditService->logAction('toggle_active', $supplier, ['is_active' => $supplier->is_active]);
        return $supplier;
    }
}
