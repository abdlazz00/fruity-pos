<?php

namespace App\Repositories\Contracts;

interface ShiftRepositoryInterface
{
    public function findActiveShift(int $userId);
    public function find(int $id);
    public function openShift(array $data);
    public function closeShift(int $id, array $data);
    public function getShiftsByLocation(int $locationId, int $perPage = 15);
    public function getShiftsByUser(int $userId, int $perPage = 15);
}
