<?php

namespace App\Repositories\Contracts;

interface AuditRepositoryInterface
{
    public function log(array $data);
}
