<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Owner Dashboard – aggregated view (FR-901).
     *
     * Filters: date range (start_date, end_date), location_id.
     * Default: today.
     */
    public function index(Request $request)
    {
        $startDate  = $request->query('start_date', Carbon::today()->format('Y-m-d'));
        $endDate    = $request->query('end_date',   Carbon::today()->format('Y-m-d'));
        $locationId = $request->query('location_id') ? (int) $request->query('location_id') : null;

        // ── KPI Cards ──
        $kpi = $this->dashboardService->getKpi($startDate, $endDate, $locationId);

        // ── Revenue per Toko (bar chart) ──
        $revenueByStore = $this->dashboardService->getRevenueByStore($startDate, $endDate);

        // ── Revenue Trend (7 hari terakhir) ──
        $revenueTrend = $this->dashboardService->getRevenueTrend(7, $locationId);

        // ── Top 5 Produk Terlaris ──
        $topProducts = $this->dashboardService->getTopProducts(5, $startDate, $endDate, $locationId);

        // ── Penjualan per Channel ──
        $salesByChannel = $this->dashboardService->getSalesByChannel($startDate, $endDate, $locationId);

        // ── Transaksi Terakhir ──
        $recentTransactions = $this->dashboardService->getRecentTransactions(10, $locationId);

        // ── Lokasi untuk filter dropdown ──
        $locations = Location::where('is_active', true)->get(['id', 'name', 'code']);

        return Inertia::render('Dashboard', [
            'kpi'                => $kpi,
            'revenueByStore'     => $revenueByStore,
            'revenueTrend'       => $revenueTrend,
            'topProducts'        => $topProducts,
            'salesByChannel'     => $salesByChannel,
            'recentTransactions' => $recentTransactions,
            'locations'          => $locations,
            'filters'            => [
                'start_date'  => $startDate,
                'end_date'    => $endDate,
                'location_id' => $locationId,
            ],
        ]);
    }

    /**
     * API: Get KPI data (for AJAX refresh / realtime polling).
     */
    public function kpiApi(Request $request)
    {
        $startDate  = $request->query('start_date', Carbon::today()->format('Y-m-d'));
        $endDate    = $request->query('end_date',   Carbon::today()->format('Y-m-d'));
        $locationId = $request->query('location_id') ? (int) $request->query('location_id') : null;

        $kpi = $this->dashboardService->getKpi($startDate, $endDate, $locationId);

        return response()->json($kpi);
    }
}
