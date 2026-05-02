<?php

namespace App\Http\Controllers;

use App\Services\TransactionService;
use App\Services\ShiftService;
use Illuminate\Http\Request;

class PosOfflineController extends Controller
{
    protected $transactionService;
    protected $shiftService;

    public function __construct(
        TransactionService $transactionService,
        ShiftService $shiftService
    ) {
        $this->transactionService = $transactionService;
        $this->shiftService = $shiftService;
    }

    /**
     * POS Offline — main cashier page (S6-F: POS Kasir).
     * Shows catalog + cart interface.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $activeShift = $this->shiftService->getActiveShift($user->id);

        // If no active shift, redirect to shift page
        if (!$activeShift) {
            return redirect()->route('shift.index')
                ->with('status', 'Silakan buka shift terlebih dahulu sebelum menggunakan POS.');
        }

        $catalog = $this->transactionService->getCatalog($user->location_id);
        $transactions = $this->transactionService->getTransactionsByShift($activeShift->id);

        if ($request->wantsJson()) {
            return response()->json([
                'shift'        => $activeShift,
                'catalog'      => $catalog,
                'transactions' => $transactions,
            ]);
        }

        return inertia('Pos/Offline', [
            'shift'        => $activeShift,
            'catalog'      => $catalog,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Process a POS Offline sale.
     */
    public function store(Request $request)
    {
        $request->validate([
            'shift_id'          => 'required|exists:shifts,id',
            'items'             => 'required|array|min:1',
            'items.*.product_id'=> 'required|exists:products,id',
            'items.*.qty'       => 'required|numeric|min:0.01',
            'discount_amount'   => 'nullable|numeric|min:0',
            'discount_note'     => 'nullable|string|max:255',
            'payment_method'    => 'required|in:cash,transfer,ewallet',
            'payment_amount'    => 'required|numeric|min:0',
        ]);

        $transaction = $this->transactionService->createOfflineTransaction(
            $request->all(),
            $request->user()->id
        );

        if ($request->wantsJson()) {
            return response()->json($transaction);
        }

        return back()->with('status', "Transaksi {$transaction->transaction_number} berhasil!");
    }
}
