<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\WasteRequest;
use App\Models\WasteRequestItem;
use App\Models\Location;
use App\Models\Inventory;
use App\Models\ReorderPoint;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService
{
    // ─────────────────────────────────────────────
    // S9-B07: KPI Harian / Periodik
    // ─────────────────────────────────────────────

    /**
     * Get all KPI metrics for Owner Dashboard (FR-901).
     *
     * Metrics:
     *  - revenue       : Total penjualan (sum transactions.total)
     *  - cogs          : HPP (sum items.hpp_at_sale × items.qty)
     *  - gross_profit  : Revenue − COGS
     *  - discount      : Total diskon
     *  - shipping_cost : Total ongkir
     *  - net_profit    : Gross Profit − Shipping − Waste Value
     *  - total_transactions : Jumlah transaksi
     *  - avg_transaction    : Rata-rata per transaksi
     *  - waste_pending      : Jumlah waste request pending
     *  - waste_value        : Total HPP waste yang approved (periode ini)
     *  - low_stock_count    : Jumlah produk di bawah batas reorder
     */
    public function getKpi(?string $startDate = null, ?string $endDate = null, ?int $locationId = null): array
    {
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::today()->startOfDay();
        $end   = $endDate   ? Carbon::parse($endDate)->endOfDay()     : Carbon::today()->endOfDay();

        // ── Revenue & Transaction Metrics ──
        $txQuery = Transaction::where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$start, $end]);

        if ($locationId) {
            $txQuery->where('transactions.location_id', $locationId);
        }

        $txAggregates = $txQuery->selectRaw('
            COUNT(*)                     as total_transactions,
            COALESCE(SUM(total), 0)      as revenue,
            COALESCE(SUM(discount_amount), 0) as discount,
            COALESCE(SUM(shipping_cost), 0)   as shipping_cost
        ')->first();

        $revenue           = (float) $txAggregates->revenue;
        $totalTransactions = (int)   $txAggregates->total_transactions;
        $discount          = (float) $txAggregates->discount;
        $shippingCost      = (float) $txAggregates->shipping_cost;
        $avgTransaction    = $totalTransactions > 0 ? round($revenue / $totalTransactions, 2) : 0;

        // ── COGS (Cost of Goods Sold) ──
        $cogsQuery = TransactionItem::whereHas('transaction', function ($q) use ($start, $end, $locationId) {
            $q->where('transactions.status', 'completed')
              ->whereBetween('transactions.created_at', [$start, $end]);
            if ($locationId) {
                $q->where('transactions.location_id', $locationId);
            }
        });

        $cogs = (float) $cogsQuery->selectRaw('COALESCE(SUM(hpp_at_sale * qty), 0) as cogs')->value('cogs');

        $grossProfit = $revenue - $cogs;

        // ── Waste Metrics ──
        $wastePending = WasteRequest::where('waste_requests.status', 'pending')
            ->when($locationId, fn($q) => $q->where('waste_requests.location_id', $locationId))
            ->count();

        $wasteValue = (float) WasteRequestItem::whereHas('wasteRequest', function ($q) use ($start, $end, $locationId) {
            $q->where('waste_requests.status', 'approved')
              ->whereBetween('waste_requests.approved_at', [$start, $end]);
            if ($locationId) {
                $q->where('waste_requests.location_id', $locationId);
            }
        })->sum('hpp_value');

        // ── Net Profit (SRS 5.4 formula) ──
        // Laba Operasional = Laba Kotor − Ongkir − Waste Value
        $netProfit = $grossProfit - $shippingCost - $wasteValue;

        // ── Low Stock Count ──
        $lowStockCount = $this->getLowStockCount($locationId);

        return [
            'revenue'            => round($revenue, 2),
            'cogs'               => round($cogs, 2),
            'gross_profit'       => round($grossProfit, 2),
            'discount'           => round($discount, 2),
            'shipping_cost'      => round($shippingCost, 2),
            'waste_value'        => round($wasteValue, 2),
            'net_profit'         => round($netProfit, 2),
            'total_transactions' => $totalTransactions,
            'avg_transaction'    => round($avgTransaction, 2),
            'waste_pending'      => $wastePending,
            'low_stock_count'    => $lowStockCount,
        ];
    }

    // ─────────────────────────────────────────────
    // Revenue Per Toko (Bar Chart Data)
    // ─────────────────────────────────────────────

    /**
     * Get revenue breakdown per store for chart (FR-901).
     */
    public function getRevenueByStore(?string $startDate = null, ?string $endDate = null): array
    {
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::today()->startOfDay();
        $end   = $endDate   ? Carbon::parse($endDate)->endOfDay()     : Carbon::today()->endOfDay();

        $data = Transaction::where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->join('locations', 'transactions.location_id', '=', 'locations.id')
            ->select(
                'locations.id as location_id',
                'locations.name as location_name',
                DB::raw('COALESCE(SUM(transactions.total), 0) as revenue'),
                DB::raw('COUNT(transactions.id) as total_transactions')
            )
            ->groupBy('locations.id', 'locations.name')
            ->orderByDesc('revenue')
            ->get();

        return $data->toArray();
    }

    // ─────────────────────────────────────────────
    // Revenue Trend (7 Hari Terakhir)
    // ─────────────────────────────────────────────

    /**
     * Get daily revenue trend for the last N days.
     */
    public function getRevenueTrend(int $days = 7, ?int $locationId = null): array
    {
        $start = Carbon::today()->subDays($days - 1)->startOfDay();
        $end   = Carbon::today()->endOfDay();

        $query = Transaction::where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$start, $end]);

        if ($locationId) {
            $query->where('transactions.location_id', $locationId);
        }

        $dailyData = $query->select(
                DB::raw('DATE(transactions.created_at) as date'),
                DB::raw('COALESCE(SUM(transactions.total), 0) as revenue'),
                DB::raw('COUNT(*) as transactions')
            )
            ->groupBy(DB::raw('DATE(transactions.created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Fill in missing dates with zero
        $result = [];
        for ($i = 0; $i < $days; $i++) {
            $date = Carbon::today()->subDays($days - 1 - $i)->format('Y-m-d');
            $dayData = $dailyData->get($date);

            $result[] = [
                'date'         => $date,
                'label'        => Carbon::parse($date)->translatedFormat('D, d M'),
                'revenue'      => $dayData ? (float) $dayData->revenue : 0,
                'transactions' => $dayData ? (int) $dayData->transactions : 0,
            ];
        }

        return $result;
    }

    // ─────────────────────────────────────────────
    // Top Selling Products
    // ─────────────────────────────────────────────

    /**
     * Get top selling products by qty or revenue.
     */
    public function getTopProducts(int $limit = 5, ?string $startDate = null, ?string $endDate = null, ?int $locationId = null): array
    {
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::today()->startOfDay();
        $end   = $endDate   ? Carbon::parse($endDate)->endOfDay()     : Carbon::today()->endOfDay();

        $query = TransactionItem::whereHas('transaction', function ($q) use ($start, $end, $locationId) {
            $q->where('transactions.status', 'completed')
              ->whereBetween('transactions.created_at', [$start, $end]);
            if ($locationId) {
                $q->where('transactions.location_id', $locationId);
            }
        });

        $products = $query->select(
                'product_id',
                'product_name',
                DB::raw('SUM(qty) as total_qty'),
                DB::raw('SUM(subtotal) as total_revenue')
            )
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get();

        return $products->toArray();
    }

    // ─────────────────────────────────────────────
    // Penjualan per Channel (Offline vs Online)
    // ─────────────────────────────────────────────

    /**
     * Get sales breakdown per type (offline/online) for pie chart.
     */
    public function getSalesByChannel(?string $startDate = null, ?string $endDate = null, ?int $locationId = null): array
    {
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::today()->startOfDay();
        $end   = $endDate   ? Carbon::parse($endDate)->endOfDay()     : Carbon::today()->endOfDay();

        $query = Transaction::where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$start, $end]);

        if ($locationId) {
            $query->where('transactions.location_id', $locationId);
        }

        $data = $query->select(
                'type',
                DB::raw('COUNT(*) as total_transactions'),
                DB::raw('COALESCE(SUM(total), 0) as revenue')
            )
            ->groupBy('type')
            ->get();

        return $data->toArray();
    }

    // ─────────────────────────────────────────────
    // Recent Transactions
    // ─────────────────────────────────────────────

    /**
     * Get the latest transactions for the activity feed.
     */
    public function getRecentTransactions(int $limit = 10, ?int $locationId = null): array
    {
        $query = Transaction::where('transactions.status', 'completed')
            ->with(['location:id,name', 'user:id,name'])
            ->orderByDesc('transactions.created_at')
            ->limit($limit);

        if ($locationId) {
            $query->where('transactions.location_id', $locationId);
        }

        return $query->get()->map(function ($tx) {
            return [
                'id'                 => $tx->id,
                'transaction_number' => $tx->transaction_number,
                'type'               => $tx->type,
                'total'              => (float) $tx->total,
                'payment_method'     => $tx->payment_method,
                'location_name'      => $tx->location->name ?? '-',
                'cashier_name'       => $tx->user->name ?? '-',
                'created_at'         => $tx->created_at->format('Y-m-d H:i:s'),
            ];
        })->toArray();
    }

    // ─────────────────────────────────────────────
    // Helper: Low Stock Count
    // ─────────────────────────────────────────────

    private function getLowStockCount(?int $locationId = null): int
    {
        $query = ReorderPoint::where('is_active', true)
            ->with(['product', 'location']);

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        $reorderPoints = $query->get();

        $lowStockCount = 0;
        foreach ($reorderPoints as $rp) {
            $inventory = Inventory::where('product_id', $rp->product_id)
                ->where('location_id', $rp->location_id)
                ->first();

            $currentQty = $inventory ? (float) $inventory->quantity : 0;

            if ($currentQty <= (float) $rp->min_quantity) {
                $lowStockCount++;
            }
        }

        return $lowStockCount;
    }
}
