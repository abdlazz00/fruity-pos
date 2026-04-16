<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    public function paginateByLocation($locationId = null, $perPage = 15)
    {
        $query = User::with('location')->latest();
        if ($locationId) {
            $query->where('location_id', $locationId);
        }
        return $query->paginate($perPage);
    }

    public function find($id)
    {
        return User::findOrFail($id);
    }

    public function countByRoleLocation($role, $locationId)
    {
        return User::where('role', $role)
            ->where('location_id', $locationId)
            ->where('is_active', true)
            ->count();
    }

    public function create(array $data)
    {
        return User::create($data);
    }

    public function update($id, array $data)
    {
        $user = $this->find($id);
        $user->update($data);
        return $user;
    }

    public function toggleActive($id)
    {
        $user = $this->find($id);
        $user->is_active = !$user->is_active;
        $user->save();
        return $user;
    }
}
