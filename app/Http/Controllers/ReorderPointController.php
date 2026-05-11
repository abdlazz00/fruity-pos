<?php

namespace App\Http\Controllers;

use App\Services\ReorderPointService;
use App\Models\Product;
use App\Models\Location;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReorderPointController extends Controller
{
    protected $reorderPointService;

    public function __construct(ReorderPointService $reorderPointService)
    {
        $this->reorderPointService = $reorderPointService;
    }

    /**
     * List reorder points.
     * - Stockist: sees own location's thresholds.
     * - Owner: sees all locations (with optional location filter).
     */
    public function index(Request $request)
    {
        $user       = $request->user();
        $locationId = $request->query('location_id');

        if ($user->role->value === 'stockist') {
            $locationId = $user->location_id;
        }

        $reorderPoints = $this->reorderPointService->getByLocation($locationId);
        $lowStockAlerts = $this->reorderPointService->getLowStockAlerts($locationId);
        $locations = Location::where('is_active', true)->get();

        return Inertia::render('Inventory/ReorderPointIndex', [
            'reorderPoints'  => $reorderPoints,
            'lowStockAlerts' => $lowStockAlerts,
            'locations'      => $locations,
            'filters'        => [
                'location_id' => $locationId,
            ],
        ]);
    }

    /**
     * Show the form for creating/setting a reorder point.
     */
    public function create(Request $request)
    {
        $user       = $request->user();
        $locationId = $request->query('location_id');

        if ($user->role->value === 'stockist') {
            $locationId = $user->location_id;
        }

        // Get products with current stock at the selected location
        $products = Product::where('is_active', true)
            ->with(['category'])
            ->get()
            ->map(function ($product) use ($locationId) {
                $inventory = $locationId
                    ? Inventory::where('product_id', $product->id)
                        ->where('location_id', $locationId)
                        ->first()
                    : null;

                return [
                    'id'           => $product->id,
                    'name'         => $product->name,
                    'sku'          => $product->sku,
                    'base_uom'     => $product->base_uom,
                    'category'     => $product->category->name ?? '-',
                    'current_stock' => $inventory ? (float) $inventory->quantity : 0,
                ];
            });

        $locations = Location::where('is_active', true)->get();

        return Inertia::render('Inventory/ReorderPointForm', [
            'products'  => $products,
            'locations' => $locations,
            'filters'   => [
                'location_id' => $locationId,
            ],
        ]);
    }

    /**
     * Store (set) a reorder point (FR-1207, FR-1208).
     *
     * Upserts: if a threshold already exists for this product+location,
     * it updates the min_quantity instead of failing.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id'   => 'required|exists:products,id',
            'location_id'  => 'required|exists:locations,id',
            'min_quantity'  => 'required|numeric|min:0.01',
        ]);

        $user = $request->user();

        // FR-1207: Stockist can only set for their own location
        if ($user->role->value === 'stockist' && (int) $request->input('location_id') !== $user->location_id) {
            abort(403, 'Stockist hanya dapat mengatur reorder point untuk toko sendiri.');
        }

        $reorderPoint = $this->reorderPointService->set(
            $request->only(['product_id', 'location_id', 'min_quantity']),
            $user->id
        );

        return redirect()->route('reorder-points.index')
            ->with('status', "Reorder point untuk {$reorderPoint->product->name} berhasil disimpan.");
    }

    /**
     * Update the min_quantity of an existing reorder point.
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'min_quantity' => 'required|numeric|min:0.01',
        ]);

        $user = $request->user();

        $reorderPoint = $this->reorderPointService->update(
            $id,
            (float) $request->input('min_quantity'),
            $user->id
        );

        return back()->with('status', "Reorder point untuk {$reorderPoint->product->name} berhasil diperbarui.");
    }

    /**
     * Toggle active/inactive status of a reorder point (FR-1215).
     */
    public function toggle(Request $request, int $id)
    {
        $user = $request->user();

        $reorderPoint = $this->reorderPointService->toggle($id, $user->id);

        $statusLabel = $reorderPoint->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('status', "Reorder point untuk {$reorderPoint->product->name} berhasil {$statusLabel}.");
    }

    /**
     * Delete a reorder point.
     */
    public function destroy(int $id)
    {
        $this->reorderPointService->delete($id);

        return back()->with('status', 'Reorder point berhasil dihapus.');
    }

    /**
     * API: Get current low stock alerts (for Dashboard FR-1213).
     */
    public function lowStockAlerts(Request $request)
    {
        $locationId = $request->query('location_id');

        $alerts = $this->reorderPointService->getLowStockAlerts($locationId);

        return response()->json([
            'alerts' => $alerts,
            'count'  => $alerts->count(),
        ]);
    }
}
