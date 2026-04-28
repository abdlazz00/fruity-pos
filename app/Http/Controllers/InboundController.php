<?php

namespace App\Http\Controllers;

use App\Services\InboundService;
use App\Http\Requests\InboundRequest;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;

class InboundController extends Controller
{
    protected $inboundService;

    public function __construct(InboundService $inboundService)
    {
        $this->inboundService = $inboundService;
    }

    /**
     * Display paginated list of Inbound receipts.
     * LocationScope: stockist sees own store's inbounds only.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $locationId = $user->location_id;

        $inbounds = $this->inboundService->getPaginatedInbounds($locationId);

        if ($request->wantsJson()) {
            return response()->json($inbounds);
        }

        return inertia('Inbound/Index', [
            'inbounds' => $inbounds,
        ]);
    }

    /**
     * Show form to create a new Inbound receipt.
     * Only confirmed/partially_received POs are available.
     */
    public function create(Request $request)
    {
        $user = $request->user();
        $locationId = $user->location_id;

        // Get receivable POs for this store
        $query = PurchaseOrder::with(['supplier', 'items.product', 'items.productUnit', 'inbounds.items'])
            ->whereIn('status', ['confirmed', 'partially_received']);

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        $purchaseOrders = $query->latest()->get();

        return inertia('Inbound/Form', [
            'inbound'        => null,
            'purchaseOrders' => $purchaseOrders,
        ]);
    }

    /**
     * Store a new inbound receipt — triggers HPP calc + WAC update + notification.
     */
    public function store(InboundRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        $this->inboundService->processReceipt(
            $validated,
            $validated['items'],
            $user->id
        );

        return redirect()
            ->route('inbounds.index')
            ->with('status', 'Penerimaan barang berhasil diproses.');
    }

    /**
     * Show detail of an inbound receipt.
     */
    public function show($id)
    {
        $inbound = $this->inboundService->findInbound($id);

        return inertia('Inbound/Show', [
            'inbound' => $inbound,
        ]);
    }
}
