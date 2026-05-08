<?php

namespace App\Http\Controllers;

use App\Services\WasteService;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WasteController extends Controller
{
    protected $wasteService;

    public function __construct(WasteService $wasteService)
    {
        $this->wasteService = $wasteService;
    }

    /**
     * List waste requests.
     * - Stockist: sees own location's requests.
     * - Owner: sees all pending requests for approval.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $status = $request->query('status');
        $locationId = $request->query('location_id');

        if ($user->role === 'stockist') {
            $locationId = $user->location_id; // Stockist only sees own location
        }

        $wastes = $this->wasteService->getByLocation($locationId, $status);
        $locations = \App\Models\Location::where('is_active', true)->get();

        return Inertia::render('Inventory/WasteIndex', [
            'wastes'  => $wastes,
            'locations' => $locations,
            'filters' => [
                'status' => $status,
                'location_id' => $locationId,
            ],
        ]);
    }

    /**
     * Show waste submission form (Stockist).
     */
    public function create(Request $request)
    {
        $user = $request->user();

        $products = Inventory::where('location_id', $user->location_id)
            ->where('quantity', '>', 0)
            ->with('product')
            ->get()
            ->map(fn($inv) => [
                'product_id' => $inv->product_id,
                'name'       => $inv->product->name,
                'sku'        => $inv->product->sku ?? '-',
                'stock'      => $inv->quantity,
            ]);

        return Inertia::render('Inventory/WasteForm', [
            'products' => $products,
        ]);
    }

    /**
     * Store new waste request (Stockist submits).
     */
    public function store(Request $request)
    {
        $request->validate([
            'items'                => 'required|array|min:1',
            'items.*.product_id'   => 'required|exists:products,id',
            'items.*.quantity'     => 'required|numeric|min:0.01',
            'items.*.reason'       => 'required|in:rotten,damaged,expired,failed_qc',
            'items.*.photo'        => 'required|image|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max (S8-B10)
        ]);

        $user = $request->user();

        $waste = $this->wasteService->submit(
            $request->all(),
            $user->id,
            $user->location_id
        );

        return redirect()->route('waste.index')
            ->with('status', "Pengajuan waste {$waste->request_number} berhasil dikirim.");
    }

    /**
     * Show waste detail (for Owner review).
     */
    public function show(int $id)
    {
        $waste = $this->wasteService->findById($id);

        return Inertia::render('Inventory/WasteShow', [
            'waste' => $waste,
        ]);
    }

    /**
     * Approve waste request (Owner only).
     */
    public function approve(Request $request, int $id)
    {
        $waste = $this->wasteService->approve($id, $request->user()->id);

        return back()->with('status', "Waste {$waste->request_number} disetujui. Stok telah dikurangi.");
    }

    /**
     * Reject waste request (Owner only).
     */
    public function reject(Request $request, int $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $waste = $this->wasteService->reject(
            $id,
            $request->user()->id,
            $request->input('rejection_reason')
        );

        return back()->with('status', "Waste {$waste->request_number} ditolak.");
    }
}
