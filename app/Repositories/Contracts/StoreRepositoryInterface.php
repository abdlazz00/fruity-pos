<?php

namespace App\Repositories\Contracts;

interface StoreRepositoryInterface
{
    public function allActive();
    public function paginate($perPage = 15);
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function toggleActive($id);
}
