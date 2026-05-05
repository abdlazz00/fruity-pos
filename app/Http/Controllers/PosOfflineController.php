<?php

namespace App\Http\Controllers;

use App\Services\TransactionService;
use App\Services\ShiftService;
use App\Services\OfflineSyncService;
use Illuminate\Http\Request;

class PosOfflineController extends Controller
{
    protected $transactionService;
    protected $shiftService;
    protected $offlineSyncService;

    public function __construct(
        TransactionService $transactionService,
        ShiftService $shiftService,
        OfflineSyncService $offlineSyncService
    ) {
        $this->transactionService = $transactionService;
        $this->shiftService = $shiftService;
        $this->offlineSyncService = $offlineSyncService;
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
            'offline_uuid'      => 'nullable|uuid|unique:transactions,offline_uuid',
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

    /**
     * Sync batch of offline transactions from Dexie.js (S7-B07).
     *
     * Receives an array of transactions queued locally during offline mode.
     * Each transaction is processed independently; failures don't affect others.
     * Duplicate offline_uuid values are detected and skipped (S7-B08).
     *
     * POST /pos/offline/sync
     */
    public function sync(Request $request)
    {
        $request->validate([
            'transactions'                     => 'required|array|min:1|max:50',
            'transactions.*.offline_uuid'      => 'required|uuid',
            'transactions.*.shift_id'          => 'required|integer',
            'transactions.*.items'             => 'required|array|min:1',
            'transactions.*.items.*.product_id'=> 'required|integer',
            'transactions.*.items.*.qty'       => 'required|numeric|min:0.01',
            'transactions.*.payment_method'    => 'required|in:cash,transfer,ewallet',
            'transactions.*.payment_amount'    => 'required|numeric|min:0',
            'transactions.*.discount_amount'   => 'nullable|numeric|min:0',
            'transactions.*.discount_note'     => 'nullable|string|max:255',
        ]);

        $result = $this->offlineSyncService->syncBatch(
            $request->input('transactions'),
            $request->user()->id
        );

        return response()->json($result);
    }
}

