<?php

namespace App\Repositories;

use App\Models\Supplier;
use App\Repositories\Contracts\SupplierRepositoryInterface;

class SupplierRepository implements SupplierRepositoryInterface
{
    protected $model;

    public function __construct(Supplier $model)
    {
        $this->model = $model;
    }

    public function paginate($perPage = 10)
    {
        return $this->model->paginate($perPage);
    }

    public function find($id)
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $supplier = $this->model->findOrFail($id);
        $supplier->update($data);
        return $supplier;
    }

    public function toggleActive($id)
    {
        $supplier = $this->model->findOrFail($id);
        $supplier->update(['is_active' => !$supplier->is_active]);
        return $supplier;
    }
}
