<?php

namespace App\Repositories\Contracts;

interface UserRepositoryInterface
{
    public function paginateByLocation($locationId = null, $perPage = 15);
    public function find($id);
    public function countByRoleLocation($role, $locationId);
    public function create(array $data);
    public function update($id, array $data);
    public function toggleActive($id);
}
