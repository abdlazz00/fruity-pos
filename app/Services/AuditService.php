<?php

namespace App\Services;

use App\Repositories\Contracts\AuditRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class AuditService
{
    protected $repository;

    public function __construct(AuditRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function logLogin($userId, $ipAddress)
    {
        return $this->repository->log([
            'user_id' => $userId,
            'action' => 'login',
            'ip_address' => $ipAddress,
        ]);
    }

    public function logAction($action, $model, $changes = null, $userId = null, $ipAddress = null)
    {
        return $this->repository->log([
            'user_id' => $userId ?? Auth::id(),
            'action' => $action,
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'changes' => $changes,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);
    }
}
