<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\WasteRequest;
use App\Models\WasteRequestItem;
use App\Models\StockMutation;
use App\Models\StockMutationItem;
use App\Models\Inbound;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Location;
use App\Models\Shift;
use App\Models\ReorderPoint;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    // ─────────────────────────────────────────────────────────
    // S9-B09: Profit & Loss (FR-902, SRS v1.2 Bab 5.4)
    //
    //   Revenue − Diskon − COGS = Laba Kotor
    //   Laba Kotor − Ongkir − Waste − Mutasi Loss = Laba Operasional
    // ─────────────────────────────────────────────────────────

    /**
     * Generate Profit & Loss report for a given period.
     */
    public function profitLoss(string $startDate, string $endDate, ?int $locationId = null): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->endOfDay();

        // ── Revenue & Discounts ──
        $txQuery = Transaction::where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$start, $end]);
        if ($locationId) {
            $txQuery->where('transactions.location_id', $locationId);
        }

        $txAgg = $txQuery->selectRaw('
            COALESCE(SUM(transactions.total), 0)            as revenue,
            COALESCE(SUM(transactions.discount_amount), 0)  as discount,
            COALESCE(SUM(transactions.shipping_cost), 0)    as shipping_cost,
            COUNT(transactions.id)                           as total_transactions
        ')->first();

        $revenue      = (float) $txAgg->revenue;
        $discount     = (float) $txAgg->discount;
        $shippingCost = (float) $txAgg->shipping_cost;

        // ── COGS ──
        $cogs = (float) TransactionItem::whereHas('transaction', function ($q) use ($start, $end, $locationId) {
            $q->where('transactions.status', 'completed')
              ->whereBetween('transactions.created_at', [$start, $end]);
            if ($locationId) {
                $q->where('transactions.location_id', $locationId);
            }
        })->selectRaw('COALESCE(SUM(hpp_at_sale * qty), 0) as cogs')->value('cogs');

        // ── Waste Value (approved in period) ──
        $wasteValue = (float) WasteRequestItem::whereHas('wasteRequest', function ($q) use ($start, $end, $locationId) {
            $q->where('waste_requests.status', 'approved')
              ->whereBetween('waste_requests.approved_at', [$start, $end]);
            if ($locationId) {
                $q->where('waste_requests.location_id', $locationId);
            }
        })->sum('hpp_value');

        // ── Mutation Loss (completed in period) ──
        $mutationLoss = 0;
        $mutQuery = StockMutation::where('stock_mutations.status', 'completed')
            ->whereBetween('stock_mutations.received_at', [$start, $end]);
        if ($locationId) {
            $mutQuery->where(function ($q) use ($locationId) {
                $q->where('stock_mutations.from_location_id', $locationId)
                  ->orWhere('stock_mutations.to_location_id', $locationId);
            });
        }
        $mutationIds = $mutQuery->pluck('id');
        if ($mutationIds->isNotEmpty()) {
            $mutationLoss = (float) StockMutationItem::whereIn('stock_mutation_id', $mutationIds)
                ->where('loss_quantity', '>', 0)
                ->selectRaw('COALESCE(SUM(loss_quantity), 0) as total_loss')
                ->value('total_loss');
            // Note: Loss qty is in units; for P&L we might want value.
            // Since mutation loss value isn't tracked in HPP, we report qty only.
        }

        $grossProfit = $revenue - $cogs;
        $netProfit   = $grossProfit - $shippingCost - $wasteValue;

        return [
            'period' => [
                'start' => $startDate,
                'end'   => $endDate,
            ],
            'revenue'            => round($revenue, 2),
            'discount'           => round($discount, 2),
            'cogs'               => round($cogs, 2),
            'gross_profit'       => round($grossProfit, 2),
            'shipping_cost'      => round($shippingCost, 2),
            'waste_value'        => round($wasteValue, 2),
            'mutation_loss_qty'  => round($mutationLoss, 2),
            'net_profit'         => round($netProfit, 2),
            'total_transactions' => (int) $txAgg->total_transactions,
            'margin_percentage'  => $revenue > 0 ? round(($netProfit / $revenue) * 100, 2) : 0,
        ];
    }

    // ─────────────────────────────────────────────────────────
    // S9-B10: Sales by Channel (FR-903)
    // ─────────────────────────────────────────────────────────

    /**
     * Breakdown sales: offline per toko vs online per platform.
     */
    public function salesByChannel(string $startDate, string $endDate, ?int $locationId = null): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->endOfDay();

        $query = Transaction::where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->join('locations', 'transactions.location_id', '=', 'locations.id');

        if ($locationId) {
            $query->where('transactions.location_id', $locationId);
        }

        $data = $query->select(
                'transactions.type',
                'transactions.platform',
                'locations.id as location_id',
                'locations.name as location_name',
                DB::raw('COUNT(transactions.id) as total_transactions'),
                DB::raw('COALESCE(SUM(transactions.total), 0) as revenue'),
                DB::raw('COALESCE(SUM(transactions.discount_amount), 0) as total_discount')
            )
            ->groupBy('transactions.type', 'transactions.platform', 'locations.id', 'locations.name')
            ->orderBy('transactions.type')
            ->orderByDesc('revenue')
            ->get();

        // Aggregate summaries
        $offlineTotal = $data->where('type', 'offline')->sum('revenue');
        $onlineTotal  = $data->where('type', 'online')->sum('revenue');

        return [
            'period' => ['start' => $startDate, 'end' => $endDate],
            'details'       => $data->toArray(),
            'summary' => [
                'offline' => [
                    'revenue'      => round((float) $offlineTotal, 2),
                    'transactions' => $data->where('type', 'offline')->sum('total_transactions'),
                ],
                'online' => [
                    'revenue'      => round((float) $onlineTotal, 2),
                    'transactions' => $data->where('type', 'online')->sum('total_transactions'),
                ],
            ],
        ];
    }

    // ─────────────────────────────────────────────────────────
    // S9-B11: Inventory Report (FR-904)
    // ─────────────────────────────────────────────────────────

    /**
     * Real-time stock per toko + avg_cost, with optional low-stock filter.
     */
    public function inventoryReport(?int $locationId = null, bool $lowStockOnly = false): array
    {
        $query = Inventory::join('products', 'inventories.product_id', '=', 'products.id')
            ->join('locations', 'inventories.location_id', '=', 'locations.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->where('products.is_active', true);

        if ($locationId) {
            $query->where('inventories.location_id', $locationId);
        }

        $data = $query->select(
                'inventories.id',
                'products.id as product_id',
                'products.name as product_name',
                'products.sku',
                'products.base_uom',
                'categories.name as category_name',
                'locations.id as location_id',
                'locations.name as location_name',
                'inventories.quantity',
                'inventories.avg_cost',
                DB::raw('(inventories.quantity * inventories.avg_cost) as stock_value')
            )
            ->orderBy('locations.name')
            ->orderBy('products.name')
            ->get();

        // Optionally filter low-stock items
        if ($lowStockOnly) {
            $reorderPoints = ReorderPoint::where('is_active', true)->get()
                ->keyBy(fn($rp) => $rp->product_id . '-' . $rp->location_id);

            $data = $data->filter(function ($item) use ($reorderPoints) {
                $key = $item->product_id . '-' . $item->location_id;
                $rp  = $reorderPoints->get($key);
                return $rp && (float) $item->quantity <= (float) $rp->min_quantity;
            })->values();
        }

        // Summary
        $totalStockValue = $data->sum('stock_value');

        return [
            'items'            => $data->toArray(),
            'total_items'      => $data->count(),
            'total_stock_value' => round((float) $totalStockValue, 2),
        ];
    }

    // ─────────────────────────────────────────────────────────
    // S9-B12: Waste Report (FR-905)
    // ─────────────────────────────────────────────────────────

    /**
     * Waste trend per item per bulan.
     */
    public function wasteReport(string $startDate, string $endDate, ?int $locationId = null): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->endOfDay();

        $query = WasteRequestItem::join('waste_requests', 'waste_request_items.waste_request_id', '=', 'waste_requests.id')
            ->join('products', 'waste_request_items.product_id', '=', 'products.id')
            ->join('locations', 'waste_requests.location_id', '=', 'locations.id')
            ->where('waste_requests.status', 'approved')
            ->whereBetween('waste_requests.approved_at', [$start, $end]);

        if ($locationId) {
            $query->where('waste_requests.location_id', $locationId);
        }

        // Detail per product
        $byProduct = (clone $query)->select(
                'products.id as product_id',
                'products.name as product_name',
                DB::raw('SUM(waste_request_items.quantity) as total_qty'),
                DB::raw('SUM(waste_request_items.hpp_value) as total_value')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_value')
            ->get();

        // Monthly trend
        $monthlyTrend = (clone $query)->select(
                DB::raw("DATE_FORMAT(waste_requests.approved_at, '%Y-%m') as month"),
                DB::raw('SUM(waste_request_items.quantity) as total_qty'),
                DB::raw('SUM(waste_request_items.hpp_value) as total_value')
            )
            ->groupBy(DB::raw("DATE_FORMAT(waste_requests.approved_at, '%Y-%m')"))
            ->orderBy('month')
            ->get();

        // By location
        $byLocation = (clone $query)->select(
                'locations.id as location_id',
                'locations.name as location_name',
                DB::raw('SUM(waste_request_items.quantity) as total_qty'),
                DB::raw('SUM(waste_request_items.hpp_value) as total_value')
            )
            ->groupBy('locations.id', 'locations.name')
            ->orderByDesc('total_value')
            ->get();

        return [
            'period'        => ['start' => $startDate, 'end' => $endDate],
            'by_product'    => $byProduct->toArray(),
            'monthly_trend' => $monthlyTrend->toArray(),
            'by_location'   => $byLocation->toArray(),
            'total_value'   => round((float) $byProduct->sum('total_value'), 2),
            'total_qty'     => round((float) $byProduct->sum('total_qty'), 2),
        ];
    }

    // ─────────────────────────────────────────────────────────
    // S9-B13: Shift Report (FR-906, FR-907)
    // ─────────────────────────────────────────────────────────

    /**
     * Shift per kasir: transaksi, penjualan, selisih kas.
     * FR-907: Kasir/Admin hanya lihat shift sendiri.
     */
    public function shiftReport(string $startDate, string $endDate, ?int $locationId = null, ?int $userId = null): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->endOfDay();

        $query = Shift::join('users', 'shifts.user_id', '=', 'users.id')
            ->join('locations', 'shifts.location_id', '=', 'locations.id')
            ->whereBetween('shifts.opened_at', [$start, $end]);

        if ($locationId) {
            $query->where('shifts.location_id', $locationId);
        }

        // FR-907: scope to user's own shifts when not owner
        if ($userId) {
            $query->where('shifts.user_id', $userId);
        }

        $shifts = $query->select(
                'shifts.id',
                'users.name as cashier_name',
                'locations.name as location_name',
                'shifts.opened_at',
                'shifts.closed_at',
                'shifts.status',
                'shifts.opening_balance',
                'shifts.expected_balance',
                'shifts.actual_balance',
                'shifts.difference'
            )
            ->orderByDesc('shifts.opened_at')
            ->get();

        // Enrich with transaction count per shift
        $shiftIds = $shifts->pluck('id');
        $txCounts = Transaction::whereIn('shift_id', $shiftIds)
            ->where('transactions.status', 'completed')
            ->select('shift_id', DB::raw('COUNT(*) as tx_count'), DB::raw('COALESCE(SUM(total), 0) as tx_total'))
            ->groupBy('shift_id')
            ->get()
            ->keyBy('shift_id');

        $enriched = $shifts->map(function ($shift) use ($txCounts) {
            $txData = $txCounts->get($shift->id);
            return array_merge($shift->toArray(), [
                'total_transactions' => $txData ? (int) $txData->tx_count : 0,
                'total_sales'        => $txData ? round((float) $txData->tx_total, 2) : 0,
            ]);
        });

        return [
            'period'       => ['start' => $startDate, 'end' => $endDate],
            'shifts'       => $enriched->toArray(),
            'total_shifts' => $enriched->count(),
            'summary' => [
                'total_sales'        => round((float) $enriched->sum('total_sales'), 2),
                'total_transactions' => $enriched->sum('total_transactions'),
                'total_difference'   => round((float) $shifts->sum('difference'), 2),
            ],
        ];
    }

    // ─────────────────────────────────────────────────────────
    // S9-B14: Discount Report (FR-1205)
    // ─────────────────────────────────────────────────────────

    /**
     * Transactions that have a discount > 0.
     */
    public function discountReport(string $startDate, string $endDate, ?int $locationId = null): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->endOfDay();

        $query = Transaction::where('transactions.status', 'completed')
            ->where('transactions.discount_amount', '>', 0)
            ->whereBetween('transactions.created_at', [$start, $end])
            ->join('locations', 'transactions.location_id', '=', 'locations.id')
            ->join('users', 'transactions.user_id', '=', 'users.id');

        if ($locationId) {
            $query->where('transactions.location_id', $locationId);
        }

        $transactions = $query->select(
                'transactions.id',
                'transactions.transaction_number',
                'transactions.type',
                'transactions.subtotal',
                'transactions.discount_amount',
                'transactions.discount_note',
                'transactions.total',
                'transactions.created_at',
                'locations.name as location_name',
                'users.name as cashier_name'
            )
            ->orderByDesc('transactions.discount_amount')
            ->get();

        return [
            'period'         => ['start' => $startDate, 'end' => $endDate],
            'transactions'   => $transactions->toArray(),
            'total_discount' => round((float) $transactions->sum('discount_amount'), 2),
            'count'          => $transactions->count(),
        ];
    }

    // ─────────────────────────────────────────────────────────
    // S9-B15: Shipping Cost Report (FR-1218)
    // ─────────────────────────────────────────────────────────

    /**
     * Shipping cost from transactions (online) + inbounds per toko per periode.
     */
    public function shippingCostReport(string $startDate, string $endDate, ?int $locationId = null): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->endOfDay();

        // ── Transaction shipping cost (online orders) ──
        $txQuery = Transaction::where('transactions.status', 'completed')
            ->where('transactions.shipping_cost', '>', 0)
            ->whereBetween('transactions.created_at', [$start, $end])
            ->join('locations', 'transactions.location_id', '=', 'locations.id');

        if ($locationId) {
            $txQuery->where('transactions.location_id', $locationId);
        }

        $txShipping = $txQuery->select(
                'locations.id as location_id',
                'locations.name as location_name',
                DB::raw('COUNT(transactions.id) as order_count'),
                DB::raw('COALESCE(SUM(transactions.shipping_cost), 0) as total_shipping')
            )
            ->groupBy('locations.id', 'locations.name')
            ->orderByDesc('total_shipping')
            ->get();

        // ── Inbound shipping cost (procurement) ──
        $inbQuery = Inbound::whereBetween('inbounds.received_date', [$start, $end])
            ->where('inbounds.shipping_cost', '>', 0)
            ->join('locations', 'inbounds.location_id', '=', 'locations.id');

        if ($locationId) {
            $inbQuery->where('inbounds.location_id', $locationId);
        }

        $inbShipping = $inbQuery->select(
                'locations.id as location_id',
                'locations.name as location_name',
                DB::raw('COUNT(inbounds.id) as inbound_count'),
                DB::raw('COALESCE(SUM(inbounds.shipping_cost), 0) as total_shipping')
            )
            ->groupBy('locations.id', 'locations.name')
            ->orderByDesc('total_shipping')
            ->get();

        return [
            'period' => ['start' => $startDate, 'end' => $endDate],
            'transaction_shipping' => [
                'details' => $txShipping->toArray(),
                'total'   => round((float) $txShipping->sum('total_shipping'), 2),
            ],
            'inbound_shipping' => [
                'details' => $inbShipping->toArray(),
                'total'   => round((float) $inbShipping->sum('total_shipping'), 2),
            ],
            'grand_total' => round(
                (float) $txShipping->sum('total_shipping') + (float) $inbShipping->sum('total_shipping'), 2
            ),
        ];
    }

    // ─────────────────────────────────────────────────────────
    // S9-B16: HPP Comparison Report (FR-1111)
    // ─────────────────────────────────────────────────────────

    /**
     * avg_cost per toko per produk — compare WAC across locations.
     */
    public function hppComparisonReport(?int $locationId = null): array
    {
        $query = Inventory::join('products', 'inventories.product_id', '=', 'products.id')
            ->join('locations', 'inventories.location_id', '=', 'locations.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->where('products.is_active', true)
            ->where('inventories.quantity', '>', 0);

        if ($locationId) {
            $query->where('inventories.location_id', $locationId);
        }

        $data = $query->select(
                'products.id as product_id',
                'products.name as product_name',
                'products.sku',
                'categories.name as category_name',
                'locations.id as location_id',
                'locations.name as location_name',
                'inventories.avg_cost',
                'inventories.quantity'
            )
            ->orderBy('products.name')
            ->orderBy('locations.name')
            ->get();

        // Group by product and compute min/max/spread
        $grouped = $data->groupBy('product_id')->map(function ($items) {
            $first    = $items->first();
            $avgCosts = $items->pluck('avg_cost')->map(fn($v) => (float) $v);

            return [
                'product_id'   => $first->product_id,
                'product_name' => $first->product_name,
                'sku'          => $first->sku,
                'category'     => $first->category_name,
                'locations'    => $items->map(fn($i) => [
                    'location_id'   => $i->location_id,
                    'location_name' => $i->location_name,
                    'avg_cost'      => round((float) $i->avg_cost, 2),
                    'quantity'      => round((float) $i->quantity, 2),
                ])->values()->toArray(),
                'min_cost'     => round($avgCosts->min(), 2),
                'max_cost'     => round($avgCosts->max(), 2),
                'spread'       => round($avgCosts->max() - $avgCosts->min(), 2),
            ];
        })->values();

        return [
            'products'    => $grouped->toArray(),
            'total_items' => $grouped->count(),
        ];
    }
}
