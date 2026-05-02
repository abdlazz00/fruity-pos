<?php

namespace App\Http\Controllers;

use App\Services\ShiftService;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    protected $shiftService;

    public function __construct(ShiftService $shiftService)
    {
        $this->shiftService = $shiftService;
    }

    /**
     * Shift Saya — main page (S6-F: Shift Management).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $activeShift = $this->shiftService->getActiveShift($user->id);
        $shifts = $this->shiftService->getMyShifts($user->id);

        $activeShiftTransactions = null;
        if ($activeShift) {
            $activeShiftTransactions = $activeShift->transactions()->with('items')->latest()->paginate(25);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'activeShift' => $activeShift,
                'activeShiftTransactions' => $activeShiftTransactions,
                'shifts'      => $shifts,
            ]);
        }

        return inertia('Shift/Index', [
            'activeShift' => $activeShift,
            'activeShiftTransactions' => $activeShiftTransactions,
            'shifts'      => $shifts,
        ]);
    }

    /**
     * Open a new shift.
     */
    public function open(Request $request)
    {
        $request->validate([
            'opening_balance' => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        $shift = $this->shiftService->openShift(
            $user->id,
            $user->location_id,
            (float) $request->opening_balance
        );

        if ($request->wantsJson()) {
            return response()->json($shift);
        }

        return back()->with('status', 'Shift berhasil dibuka. Selamat bekerja!');
    }

    /**
     * Close the active shift.
     */
    public function close(Request $request, $id)
    {
        $request->validate([
            'actual_balance' => 'required|numeric|min:0',
        ]);

        $shift = $this->shiftService->closeShift(
            $id,
            (float) $request->actual_balance
        );

        if ($request->wantsJson()) {
            return response()->json($shift);
        }

        return back()->with('status', 'Shift berhasil ditutup.');
    }

    /**
     * View detail of a closed shift.
     */
    public function show($id)
    {
        $shift = $this->shiftService->findShift($id);

        return inertia('Shift/Show', [
            'shift' => $shift,
        ]);
    }
}
