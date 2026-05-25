<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    // ─────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────

    private function defaultStart(): string
    {
        return Carbon::today()->startOfMonth()->format('Y-m-d');
    }

    private function defaultEnd(): string
    {
        return Carbon::today()->format('Y-m-d');
    }

    private function activeLocations()
    {
        return Cache::remember('active_locations', 600, fn() =>
            Location::where('is_active', true)->get(['id', 'name', 'code'])
        );
    }

    // ─────────────────────────────────────────────
    //  FR-902: Profit & Loss
    // ─────────────────────────────────────────────

    public function profitLoss(Request $request)
    {
        $startDate  = $request->query('start_date', $this->defaultStart());
        $endDate    = $request->query('end_date', $this->defaultEnd());
        $locationId = $request->query('location_id') ? (int) $request->query('location_id') : null;

        $data = $this->reportService->profitLoss($startDate, $endDate, $locationId);

        return Inertia::render('Reports/ProfitLoss', [
            'report'    => $data,
            'locations' => $this->activeLocations(),
            'filters'   => compact('startDate', 'endDate', 'locationId'),
        ]);
    }

    // ─────────────────────────────────────────────
    //  FR-903: Sales by Channel
    // ─────────────────────────────────────────────

    public function sales(Request $request)
    {
        $startDate  = $request->query('start_date', $this->defaultStart());
        $endDate    = $request->query('end_date', $this->defaultEnd());
        $locationId = $request->query('location_id') ? (int) $request->query('location_id') : null;

        $data = $this->reportService->salesByChannel($startDate, $endDate, $locationId);

        return Inertia::render('Reports/Sales', [
            'report'    => $data,
            'locations' => $this->activeLocations(),
            'filters'   => compact('startDate', 'endDate', 'locationId'),
        ]);
    }

    // ─────────────────────────────────────────────
    //  FR-904: Inventory
    // ─────────────────────────────────────────────

    public function inventory(Request $request)
    {
        $locationId  = $request->query('location_id') ? (int) $request->query('location_id') : null;
        $lowStockOnly = $request->boolean('low_stock_only', false);

        $data = $this->reportService->inventoryReport($locationId, $lowStockOnly);

        return Inertia::render('Reports/Inventory', [
            'report'    => $data,
            'locations' => $this->activeLocations(),
            'filters'   => compact('locationId', 'lowStockOnly'),
        ]);
    }

    // ─────────────────────────────────────────────
    //  FR-905: Waste
    // ─────────────────────────────────────────────

    public function waste(Request $request)
    {
        $startDate  = $request->query('start_date', $this->defaultStart());
        $endDate    = $request->query('end_date', $this->defaultEnd());
        $locationId = $request->query('location_id') ? (int) $request->query('location_id') : null;

        $data = $this->reportService->wasteReport($startDate, $endDate, $locationId);

        return Inertia::render('Reports/Waste', [
            'report'    => $data,
            'locations' => $this->activeLocations(),
            'filters'   => compact('startDate', 'endDate', 'locationId'),
        ]);
    }

    // ─────────────────────────────────────────────
    //  FR-906 / FR-907: Shift
    // ─────────────────────────────────────────────

    public function shifts(Request $request)
    {
        $user       = $request->user();
        $startDate  = $request->query('start_date', $this->defaultStart());
        $endDate    = $request->query('end_date', $this->defaultEnd());
        $locationId = $request->query('location_id') ? (int) $request->query('location_id') : null;

        // FR-907: non-owner users see only their own shifts
        $userId = null;
        if ($user->role->value !== 'owner') {
            $userId     = $user->id;
            $locationId = $user->location_id; // scope to their location
        }

        $data = $this->reportService->shiftReport($startDate, $endDate, $locationId, $userId);

        return Inertia::render('Reports/Shifts', [
            'report'    => $data,
            'locations' => $this->activeLocations(),
            'filters'   => compact('startDate', 'endDate', 'locationId'),
        ]);
    }

    // ─────────────────────────────────────────────
    //  FR-1205: Discount
    // ─────────────────────────────────────────────

    public function discounts(Request $request)
    {
        $startDate  = $request->query('start_date', $this->defaultStart());
        $endDate    = $request->query('end_date', $this->defaultEnd());
        $locationId = $request->query('location_id') ? (int) $request->query('location_id') : null;

        $data = $this->reportService->discountReport($startDate, $endDate, $locationId);

        return Inertia::render('Reports/Discounts', [
            'report'    => $data,
            'locations' => $this->activeLocations(),
            'filters'   => compact('startDate', 'endDate', 'locationId'),
        ]);
    }

    // ─────────────────────────────────────────────
    //  FR-1218: Shipping Costs
    // ─────────────────────────────────────────────

    public function shippingCosts(Request $request)
    {
        $startDate  = $request->query('start_date', $this->defaultStart());
        $endDate    = $request->query('end_date', $this->defaultEnd());
        $locationId = $request->query('location_id') ? (int) $request->query('location_id') : null;

        $data = $this->reportService->shippingCostReport($startDate, $endDate, $locationId);

        return Inertia::render('Reports/ShippingCosts', [
            'report'    => $data,
            'locations' => $this->activeLocations(),
            'filters'   => compact('startDate', 'endDate', 'locationId'),
        ]);
    }

    // ─────────────────────────────────────────────
    //  FR-1111: HPP Comparison
    // ─────────────────────────────────────────────

    public function hppComparison(Request $request)
    {
        $locationId = $request->query('location_id') ? (int) $request->query('location_id') : null;

        $data = $this->reportService->hppComparisonReport($locationId);

        return Inertia::render('Reports/HppComparison', [
            'report'    => $data,
            'locations' => $this->activeLocations(),
            'filters'   => compact('locationId'),
        ]);
    }
}
