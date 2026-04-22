<?php

namespace App\Repositories\Contracts;

interface SupplierRepositoryInterface
{
    public function paginate($perPage = 10);
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function toggleActive($id);
}
