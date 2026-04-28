<?php

namespace App\Http\Controllers;

use App\Services\PurchaseOrderService;
use App\Http\Requests\PurchaseOrderRequest;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Location;
use Illuminate\Http\Request;

class PurchaseOrderController extends Controller
{
    protected $poService;

    public function __construct(PurchaseOrderService $poService)
    {
        $this->poService = $poService;
    }

    /**
     * Display paginated list of Purchase Orders.
     * LocationScope: stockist sees own store's POs only.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $locationId = $user->location_id; // null for owner = sees all

        $status = $request->query('status');
        $purchaseOrders = $this->poService->getPaginatedPurchaseOrders($locationId, $status);

        if ($request->wantsJson()) {
            return response()->json($purchaseOrders);
        }

        return inertia('PurchaseOrder/Index', [
            'purchaseOrders' => $purchaseOrders,
            'locations'      => Location::where('is_active', true)->get(),
        ]);
    }

    /**
     * Show form to create a new PO.
     */
    public function create(Request $request)
    {
        $user = $request->user();

        return inertia('PurchaseOrder/Form', [
            'purchaseOrder' => null,
            'suppliers'     => Supplier::where('is_active', true)->get(),
            'products'      => Product::with('units')->where('is_active', true)->get(),
            'locations'     => Location::where('is_active', true)->get(),
            'userLocationId' => $user->location_id,
        ]);
    }

    /**
     * Store a new PO (status = draft).
     */
    public function store(PurchaseOrderRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        $this->poService->createPurchaseOrder(
            $validated,
            $validated['items'],
            $user->id
        );

        return redirect()
            ->route('purchase-orders.index')
            ->with('status', 'Purchase Order berhasil dibuat.');
    }

    /**
     * Show detail of a PO.
     */
    public function show($id)
    {
        $po = $this->poService->findPurchaseOrder($id);

        return inertia('PurchaseOrder/Show', [
            'purchaseOrder' => $po,
        ]);
    }

    /**
     * Show form to edit a draft PO.
     */
    public function edit(Request $request, $id)
    {
        $po = $this->poService->findPurchaseOrder($id);
        $user = $request->user();

        return inertia('PurchaseOrder/Form', [
            'purchaseOrder' => $po,
            'suppliers'     => Supplier::where('is_active', true)->get(),
            'products'      => Product::with('units')->where('is_active', true)->get(),
            'locations'     => Location::where('is_active', true)->get(),
            'userLocationId' => $user->location_id,
        ]);
    }

    /**
     * Update a draft PO.
     */
    public function update(PurchaseOrderRequest $request, $id)
    {
        $validated = $request->validated();

        $this->poService->updatePurchaseOrder(
            $id,
            $validated,
            $validated['items']
        );

        return redirect()
            ->route('purchase-orders.index')
            ->with('status', 'Purchase Order berhasil diperbarui.');
    }

    /**
     * Confirm a draft PO → locked for inbound.
     */
    public function confirm($id)
    {
        $this->poService->confirmPurchaseOrder($id);

        return back()->with('status', 'Purchase Order berhasil dikonfirmasi.');
    }

    /**
     * Cancel a draft PO.
     */
    public function cancel($id)
    {
        $this->poService->cancelPurchaseOrder($id);

        return back()->with('status', 'Purchase Order berhasil dibatalkan.');
    }

    /**
     * Delete a draft PO.
     */
    public function destroy($id)
    {
        $this->poService->deletePurchaseOrder($id);

        return redirect()
            ->route('purchase-orders.index')
            ->with('status', 'Purchase Order berhasil dihapus.');
    }
}
