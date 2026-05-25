<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
     *
     * All expensive aggregation queries are cached for 5 minutes,
     * keyed by date range and location filter.
     */
    public function index(Request $request)
    {
        $startDate  = $request->query('start_date', Carbon::today()->format('Y-m-d'));
        $endDate    = $request->query('end_date',   Carbon::today()->format('Y-m-d'));
        $locationId = $request->query('location_id') ? (int) $request->query('location_id') : null;

        $ck = "dash_{$startDate}_{$endDate}_{$locationId}"; // cache key prefix

        // ── KPI Cards (cache 5 min) ──
        $kpi = Cache::remember("{$ck}_kpi", 300, fn() =>
            $this->dashboardService->getKpi($startDate, $endDate, $locationId)
        );

        // ── Revenue per Toko / bar chart (cache 5 min) ──
        $revenueByStore = Cache::remember("{$ck}_rev_store", 300, fn() =>
            $this->dashboardService->getRevenueByStore($startDate, $endDate)
        );

        // ── Revenue Trend / 7 hari terakhir (cache 5 min) ──
        $revenueTrend = Cache::remember("{$ck}_rev_trend", 300, fn() =>
            $this->dashboardService->getRevenueTrend(7, $locationId)
        );

        // ── Top 5 Produk Terlaris (cache 5 min) ──
        $topProducts = Cache::remember("{$ck}_top_products", 300, fn() =>
            $this->dashboardService->getTopProducts(5, $startDate, $endDate, $locationId)
        );

        // ── Penjualan per Channel (cache 5 min) ──
        $salesByChannel = Cache::remember("{$ck}_sales_channel", 300, fn() =>
            $this->dashboardService->getSalesByChannel($startDate, $endDate, $locationId)
        );

        // ── Transaksi Terakhir (cache 1 min — more real-time) ──
        $recentTransactions = Cache::remember("{$ck}_recent_tx", 60, fn() =>
            $this->dashboardService->getRecentTransactions(10, $locationId)
        );

        // ── Lokasi untuk filter dropdown (cache 10 min — rarely changes) ──
        $locations = Cache::remember('active_locations', 600, fn() =>
            Location::where('is_active', true)->get(['id', 'name', 'code'])
        );

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
     * Cached for 5 minutes to reduce DB load from frequent polling.
     */
    public function kpiApi(Request $request)
    {
        $startDate  = $request->query('start_date', Carbon::today()->format('Y-m-d'));
        $endDate    = $request->query('end_date',   Carbon::today()->format('Y-m-d'));
        $locationId = $request->query('location_id') ? (int) $request->query('location_id') : null;

        $ck  = "dash_{$startDate}_{$endDate}_{$locationId}";
        $kpi = Cache::remember("{$ck}_kpi", 300, fn() =>
            $this->dashboardService->getKpi($startDate, $endDate, $locationId)
        );

        return response()->json($kpi);
    }
}
