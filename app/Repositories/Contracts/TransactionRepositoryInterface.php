<?php

namespace App\Repositories\Contracts;

interface TransactionRepositoryInterface
{
    public function create(array $data);
    public function find(int $id);
    public function getByShift(int $shiftId);
    public function getByLocation(int $locationId, int $perPage = 15);
    public function voidTransaction(int $id);
    public function sumCashByShift(int $shiftId): float;
}
