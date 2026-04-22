<?php

namespace App\Services;

use App\Repositories\Contracts\ProductRepositoryInterface;

class ProductService
{
    protected $repository;
    protected $auditService;

    public function __construct(ProductRepositoryInterface $repository, AuditService $auditService)
    {
        $this->repository = $repository;
        $this->auditService = $auditService;
    }

    public function getPaginatedProducts($categoryId = null)
    {
        return $this->repository->paginate(10, $categoryId);
    }

    public function createProduct(array $data, array $units = [], array $safeguard = [])
    {
        $product = $this->repository->create($data);
        
        if (!empty($units)) {
            $this->repository->syncUnits($product->id, $units);
        }

        if (!empty($safeguard)) {
            $this->repository->updateSafeguard($product->id, $safeguard);
        }

        $this->auditService->logAction('create', $product, $data);
        return $product->load(['units', 'safeguard']);
    }

    public function updateProduct($id, array $data, array $units = [], array $safeguard = [])
    {
        $product = $this->repository->update($id, $data);

        if (!empty($units)) {
            $this->repository->syncUnits($product->id, $units);
        }

        if (!empty($safeguard)) {
            $this->repository->updateSafeguard($product->id, $safeguard);
        }

        $this->auditService->logAction('update', $product, $data);
        return $product->load(['units', 'safeguard']);
    }

    public function toggleProduct($id)
    {
        $product = $this->repository->toggleActive($id);
        $this->auditService->logAction('toggle_active', $product, ['is_active' => $product->is_active]);
        return $product;
    }
}
