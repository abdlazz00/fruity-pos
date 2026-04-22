<?php

namespace App\Services;

use App\Repositories\Contracts\CategoryRepositoryInterface;

class CategoryService
{
    protected $repository;
    protected $auditService;

    public function __construct(CategoryRepositoryInterface $repository, AuditService $auditService)
    {
        $this->repository = $repository;
        $this->auditService = $auditService;
    }

    public function getAllCategories()
    {
        return $this->repository->all();
    }

    public function getPaginatedCategories()
    {
        return $this->repository->paginate();
    }

    public function createCategory(array $data)
    {
        $category = $this->repository->create($data);
        $this->auditService->logAction('create', $category, $data);
        return $category;
    }

    public function updateCategory($id, array $data)
    {
        $category = $this->repository->update($id, $data);
        $this->auditService->logAction('update', $category, $data);
        return $category;
    }

    public function deleteCategory($id)
    {
        $category = $this->repository->find($id);
        $this->repository->delete($id);
        $this->auditService->logAction('delete', $category);
        return true;
    }
}
