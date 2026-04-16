<?php

namespace App\Repositories;

use App\Models\ActivityLog;
use App\Repositories\Contracts\AuditRepositoryInterface;

class AuditRepository implements AuditRepositoryInterface
{
    public function log(array $data)
    {
        return ActivityLog::create($data);
    }
}
