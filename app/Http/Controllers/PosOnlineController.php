<?php

namespace App\Http\Controllers;

use App\Services\TransactionService;
use App\Services\ShiftService;
use Illuminate\Http\Request;

class PosOnlineController extends Controller
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
     * POS Online — admin order form (S6-F: POS Admin).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $activeShift = $this->shiftService->getActiveShift($user->id);

        if (!$activeShift) {
            return redirect()->route('shift.index')
                ->with('status', 'Silakan buka shift terlebih dahulu.');
        }

        $catalog = $this->transactionService->getCatalog($user->location_id);

        if ($request->wantsJson()) {
            return response()->json([
                'shift'   => $activeShift,
                'catalog' => $catalog,
            ]);
        }

        return inertia('Pos/Online', [
            'shift'   => $activeShift,
            'catalog' => $catalog,
        ]);
    }

    /**
     * Process a POS Online sale.
     */
    public function store(Request $request)
    {
        $request->validate([
            'shift_id'             => 'required|exists:shifts,id',
            'items'                => 'required|array|min:1',
            'items.*.product_id'   => 'required|exists:products,id',
            'items.*.qty'          => 'required|numeric|min:0.01',
            'customer_name'        => 'nullable|string|max:100',
            'customer_phone'       => 'nullable|string|max:20',
            'customer_address'     => 'nullable|string',
            'platform'             => 'nullable|string|max:30',
            'courier'              => 'nullable|string|max:50',
            'shipping_method'      => 'nullable|string|max:50',
            'shipping_cost'        => 'nullable|numeric|min:0',
            'discount_amount'      => 'nullable|numeric|min:0',
            'discount_note'        => 'nullable|string|max:255',
            'payment_method'       => 'required|in:cash,transfer,ewallet',
            'payment_amount'       => 'required|numeric|min:0',
        ]);

        $transaction = $this->transactionService->createOnlineTransaction(
            $request->all(),
            $request->user()->id
        );

        if ($request->wantsJson()) {
            return response()->json($transaction);
        }

        return back()->with('status', "Pesanan {$transaction->transaction_number} berhasil disimpan!");
    }
}
