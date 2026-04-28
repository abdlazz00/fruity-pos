<?php

namespace App\Repositories\Contracts;

interface InboundRepositoryInterface
{
    public function paginate($perPage = 10, $locationId = null);
    public function find($id);
    public function create(array $data);
}
