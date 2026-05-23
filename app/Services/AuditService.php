<?php

namespace App\Services;

use App\Jobs\LogAuditJob;
use App\Repositories\Contracts\AuditRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class AuditService
{
    protected $repository;

    public function __construct(AuditRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Log login action synchronously (security audit - must be instant).
     */
    public function logLogin($userId, $ipAddress)
    {
        return $this->repository->log([
            'user_id' => $userId,
            'action' => 'login',
            'ip_address' => $ipAddress,
        ]);
    }

    /**
     * Log CRUD actions asynchronously via Redis Queue.
     */
    public function logAction($action, $model, $changes = null, $userId = null, $ipAddress = null)
    {
        LogAuditJob::dispatch([
            'user_id' => $userId ?? Auth::id(),
            'action' => $action,
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'changes' => $changes,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);
    }
}
