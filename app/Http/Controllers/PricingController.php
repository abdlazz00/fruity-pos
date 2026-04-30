<?php

namespace App\Http\Controllers;

use App\Services\PricingService;
use App\Http\Requests\PricingRequest;
use App\Models\Product;
use App\Models\Location;
use Illuminate\Http\Request;

class PricingController extends Controller
{
    protected $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Display the Pricing Engine dashboard (S5-B08 / FR-301).
     * Shows all active products with their pricing status.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $prices = $this->pricingService->getPaginatedPrices($status);

        // Products that don't have a price record yet
        $pricedProductIds = \App\Models\ProductPrice::pluck('product_id')->toArray();
        $unpricedProducts = Product::where('is_active', true)
            ->whereNotIn('id', $pricedProductIds)
            ->with('category')
            ->get();

        if ($request->wantsJson()) {
            return response()->json([
                'prices'           => $prices,
                'unpricedProducts' => $unpricedProducts,
            ]);
        }

        return inertia('Pricing/Index', [
            'prices'           => $prices,
            'unpricedProducts' => $unpricedProducts,
            'locations'        => Location::where('is_active', true)->get(),
        ]);
    }

    /**
     * Show detail of a product's pricing + HPP breakdown per location (FR-303).
     */
    public function show($id)
    {
        $price = $this->pricingService->findPrice($id);
        $avgCostBreakdown = $this->pricingService->getAvgCostPerLocation($price->product_id);

        return inertia('Pricing/Show', [
            'price'            => $price,
            'avgCostBreakdown' => $avgCostBreakdown,
        ]);
    }

    /**
     * Get avg_cost per location for a specific product (API for MarginCalculator).
     */
    public function breakdown($productId)
    {
        $avgCostBreakdown = $this->pricingService->getAvgCostPerLocation($productId);
        $baseline = $this->pricingService->calculateBaseline($productId);

        return response()->json([
            'breakdown' => $avgCostBreakdown,
            'baseline'  => $baseline,
        ]);
    }

    /**
     * Set margin and calculate selling price (FR-302, FR-304).
     */
    public function store(PricingRequest $request)
    {
        $validated = $request->validated();

        $price = $this->pricingService->setMargin(
            $validated['product_id'],
            $validated['margin_percentage'],
            $validated['rounding_to'] ?? 0
        );

        if ($request->wantsJson()) {
            return response()->json($price);
        }

        return redirect()
            ->route('pricing.index')
            ->with('status', 'Harga produk berhasil diatur.');
    }

    /**
     * Update margin for an existing product price.
     */
    public function update(PricingRequest $request, $id)
    {
        $validated = $request->validated();

        $price = $this->pricingService->setMargin(
            $validated['product_id'],
            $validated['margin_percentage'],
            $validated['rounding_to'] ?? 0
        );

        if ($request->wantsJson()) {
            return response()->json($price);
        }

        return redirect()
            ->route('pricing.index')
            ->with('status', 'Harga produk berhasil diperbarui.');
    }

    /**
     * Lock a product price — makes it visible in POS (FR-306).
     */
    public function lock($id, Request $request)
    {
        $this->pricingService->lockPrice($id, $request->user()->id);

        return back()->with('status', 'Harga produk berhasil di-lock. Produk sekarang tersedia di POS.');
    }

    /**
     * Unlock a product price — hides it from POS (FR-306).
     */
    public function unlock($id, Request $request)
    {
        $this->pricingService->unlockPrice($id, $request->user()->id);

        return back()->with('status', 'Harga produk di-unlock. Produk tidak lagi tersedia di POS.');
    }

    /**
     * Sync multi-tier pricing for a product (FR-305).
     */
    public function syncTiers(Request $request, $id)
    {
        $request->validate([
            'tiers'                 => 'required|array|min:1',
            'tiers.*.label'         => 'required|string|max:50',
            'tiers.*.min_qty'       => 'required|integer|min:1',
            'tiers.*.selling_price' => 'required|numeric|min:0',
        ]);

        $this->pricingService->syncTiers($id, $request->tiers);

        return back()->with('status', 'Tier harga berhasil diperbarui.');
    }

    /**
     * API endpoint: preview calculated selling price without saving.
     */
    public function preview(Request $request)
    {
        $request->validate([
            'product_id'        => 'required|exists:products,id',
            'margin_percentage' => 'required|numeric|min:0',
            'rounding_to'       => 'nullable|integer|min:0',
        ]);

        $baseline = $this->pricingService->calculateBaseline($request->product_id);
        $sellingPrice = $this->pricingService->calculateSellingPrice(
            $baseline,
            $request->margin_percentage,
            $request->rounding_to ?? 0
        );

        return response()->json([
            'hpp_baseline'  => $baseline,
            'margin'        => $request->margin_percentage,
            'rounding_to'   => $request->rounding_to ?? 0,
            'selling_price' => $sellingPrice,
        ]);
    }
}
