<?php

namespace App\Services;

use App\Repositories\Contracts\ShiftRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Validation\ValidationException;

class ShiftService
{
    protected $shiftRepo;
    protected $transactionRepo;
    protected $auditService;

    public function __construct(
        ShiftRepositoryInterface $shiftRepo,
        TransactionRepositoryInterface $transactionRepo,
        AuditService $auditService
    ) {
        $this->shiftRepo = $shiftRepo;
        $this->transactionRepo = $transactionRepo;
        $this->auditService = $auditService;
    }

    // ─────────────────────────────────────────────
    // Open Shift
    // ─────────────────────────────────────────────

    /**
     * Open a new shift for a kasir/admin.
     *
     * Rules:
     * - User must not have an existing open shift.
     * - User must be bound to a location.
     * - Opening balance must be >= 0.
     */
    public function openShift(int $userId, int $locationId, float $openingBalance): \App\Models\Shift
    {
        // Check for existing open shift
        $existingShift = $this->shiftRepo->findActiveShift($userId);
        if ($existingShift) {
            throw ValidationException::withMessages([
                'shift' => 'Anda sudah memiliki shift aktif. Tutup shift terlebih dahulu.',
            ]);
        }

        if ($openingBalance < 0) {
            throw ValidationException::withMessages([
                'opening_balance' => 'Saldo awal tidak boleh negatif.',
            ]);
        }

        $shift = $this->shiftRepo->openShift([
            'user_id'         => $userId,
            'location_id'     => $locationId,
            'opened_at'       => now(),
            'opening_balance' => $openingBalance,
            'status'          => 'open',
        ]);

        $this->auditService->logAction('open_shift', $shift, [
            'opening_balance' => $openingBalance,
        ]);

        return $shift->load(['user', 'location']);
    }

    // ─────────────────────────────────────────────
    // Close Shift
    // ─────────────────────────────────────────────

    /**
     * Close a shift with balance reconciliation.
     *
     * expected_balance = opening_balance + total cash sales in this shift
     * difference = actual_balance - expected_balance
     */
    public function closeShift(int $shiftId, float $actualBalance): \App\Models\Shift
    {
        $shift = $this->shiftRepo->find($shiftId);

        if ($shift->isClosed()) {
            throw ValidationException::withMessages([
                'shift' => 'Shift ini sudah ditutup.',
            ]);
        }

        // Calculate expected balance: opening + cash income during shift
        $cashIncome = $this->transactionRepo->sumCashByShift($shiftId);
        $expectedBalance = (float) $shift->opening_balance + $cashIncome;
        $difference = $actualBalance - $expectedBalance;

        $closedShift = $this->shiftRepo->closeShift($shiftId, [
            'closed_at'        => now(),
            'expected_balance' => round($expectedBalance, 2),
            'actual_balance'   => round($actualBalance, 2),
            'difference'       => round($difference, 2),
            'status'           => 'closed',
        ]);

        $this->auditService->logAction('close_shift', $closedShift, [
            'expected_balance' => $expectedBalance,
            'actual_balance'   => $actualBalance,
            'difference'       => $difference,
        ]);

        return $closedShift;
    }

    // ─────────────────────────────────────────────
    // Read
    // ─────────────────────────────────────────────

    public function getActiveShift(int $userId)
    {
        return $this->shiftRepo->findActiveShift($userId);
    }

    public function findShift(int $id)
    {
        return $this->shiftRepo->find($id);
    }

    public function getMyShifts(int $userId, int $perPage = 15)
    {
        return $this->shiftRepo->getShiftsByUser($userId, $perPage);
    }
}
