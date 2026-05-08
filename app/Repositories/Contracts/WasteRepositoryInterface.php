<?php

namespace App\Repositories\Contracts;

interface WasteRepositoryInterface
{
    public function getByLocation(?int $locationId, ?string $status = null);
    public function getAllPending();
    public function findById(int $id);
    public function create(array $data);
    public function update(int $id, array $data);
}
