<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\ProductPrice;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\Contracts\InventoryRepositoryInterface;
use App\Repositories\Contracts\ShiftRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    protected $transactionRepo;
    protected $inventoryRepo;
    protected $shiftRepo;
    protected $auditService;

    public function __construct(
        TransactionRepositoryInterface $transactionRepo,
        InventoryRepositoryInterface $inventoryRepo,
        ShiftRepositoryInterface $shiftRepo,
        AuditService $auditService
    ) {
        $this->transactionRepo = $transactionRepo;
        $this->inventoryRepo = $inventoryRepo;
        $this->shiftRepo = $shiftRepo;
        $this->auditService = $auditService;
    }

    // ─────────────────────────────────────────────
    // S6-B: Process a POS Transaction (Offline)
    // ─────────────────────────────────────────────

    /**
     * Create a POS Offline transaction.
     *
     * @param array $data  {shift_id, items: [{product_id, qty}], discount_amount?, discount_note?, payment_method, payment_amount}
     * @return Transaction
     */
    public function createOfflineTransaction(array $data, int $userId): Transaction
    {
        return DB::transaction(function () use ($data, $userId) {
            $shift = $this->shiftRepo->find($data['shift_id']);

            if ($shift->isClosed()) {
                throw ValidationException::withMessages([
                    'shift' => 'Shift sudah ditutup. Tidak dapat membuat transaksi baru.',
                ]);
            }

            if ($shift->user_id !== $userId) {
                throw ValidationException::withMessages([
                    'shift' => 'Shift ini bukan milik Anda.',
                ]);
            }

            $locationId = $shift->location_id;
            $location = $shift->location;

            // 1. Resolve items: get locked prices, validate stock
            $resolvedItems = $this->resolveItems($data['items'], $locationId);

            // 2. Calculate totals
            $subtotal = collect($resolvedItems)->sum('subtotal');
            $discountAmount = (float) ($data['discount_amount'] ?? 0);
            $total = $subtotal - $discountAmount;

            if ($total < 0) {
                $total = 0;
            }

            // 3. Validate payment
            $paymentMethod = $data['payment_method'] ?? 'cash';
            $paymentAmount = (float) ($data['payment_amount'] ?? 0);

            if ($paymentAmount < $total) {
                throw ValidationException::withMessages([
                    'payment_amount' => 'Jumlah pembayaran kurang. Total: Rp ' . number_format($total, 0, ',', '.'),
                ]);
            }

            $changeAmount = $paymentMethod === 'cash' ? ($paymentAmount - $total) : 0;

            // 4. Generate transaction number
            $transactionNumber = Transaction::generateNumber($location->code);

            // 5. Create transaction (with optional offline_uuid for sync)
            $transaction = $this->transactionRepo->create([
                'transaction_number' => $transactionNumber,
                'shift_id'           => $shift->id,
                'location_id'        => $locationId,
                'user_id'            => $userId,
                'type'               => 'offline',
                'subtotal'           => round($subtotal, 2),
                'discount_amount'    => round($discountAmount, 2),
                'discount_note'      => $data['discount_note'] ?? null,
                'total'              => round($total, 2),
                'payment_method'     => $paymentMethod,
                'payment_amount'     => round($paymentAmount, 2),
                'change_amount'      => round($changeAmount, 2),
                'status'             => 'completed',
                'offline_uuid'       => $data['offline_uuid'] ?? null,
            ]);

            // 6. Save items + deduct inventory
            foreach ($resolvedItems as $item) {
                $transaction->items()->create([
                    'product_id'   => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'unit_price'   => $item['unit_price'],
                    'hpp_at_sale'  => $item['hpp_at_sale'],
                    'qty'          => $item['qty'],
                    'subtotal'     => $item['subtotal'],
                ]);

                // Deduct stock
                $this->inventoryRepo->deductStock(
                    $item['product_id'],
                    $locationId,
                    $item['qty']
                );
            }

            $this->auditService->logAction('pos_offline_sale', $transaction, [
                'items_count' => count($resolvedItems),
                'total'       => $total,
            ]);

            return $transaction->load('items');
        });
    }

    // ─────────────────────────────────────────────
    // S6-B: Process a POS Online Transaction
    // ─────────────────────────────────────────────

    /**
     * Create a POS Online transaction (with customer & shipping info).
     */
    public function createOnlineTransaction(array $data, int $userId): Transaction
    {
        return DB::transaction(function () use ($data, $userId) {
            $shift = $this->shiftRepo->find($data['shift_id']);

            if ($shift->isClosed()) {
                throw ValidationException::withMessages([
                    'shift' => 'Shift sudah ditutup.',
                ]);
            }

            $locationId = $shift->location_id;
            $location = $shift->location;

            $resolvedItems = $this->resolveItems($data['items'], $locationId);

            $subtotal = collect($resolvedItems)->sum('subtotal');
            $discountAmount = (float) ($data['discount_amount'] ?? 0);
            $shippingCost = (float) ($data['shipping_cost'] ?? 0);
            $total = $subtotal - $discountAmount + $shippingCost;

            if ($total < 0) {
                $total = 0;
            }

            $paymentMethod = $data['payment_method'] ?? 'transfer';
            $paymentAmount = (float) ($data['payment_amount'] ?? $total);

            $transactionNumber = Transaction::generateNumber($location->code);

            $transaction = $this->transactionRepo->create([
                'transaction_number' => $transactionNumber,
                'shift_id'           => $shift->id,
                'location_id'        => $locationId,
                'user_id'            => $userId,
                'type'               => 'online',
                'customer_name'      => $data['customer_name'] ?? null,
                'customer_phone'     => $data['customer_phone'] ?? null,
                'customer_address'   => $data['customer_address'] ?? null,
                'platform'           => $data['platform'] ?? null,
                'courier'            => $data['courier'] ?? null,
                'shipping_method'    => $data['shipping_method'] ?? null,
                'shipping_cost'      => round($shippingCost, 2),
                'subtotal'           => round($subtotal, 2),
                'discount_amount'    => round($discountAmount, 2),
                'discount_note'      => $data['discount_note'] ?? null,
                'total'              => round($total, 2),
                'payment_method'     => $paymentMethod,
                'payment_amount'     => round($paymentAmount, 2),
                'change_amount'      => 0,
                'status'             => 'completed',
            ]);

            foreach ($resolvedItems as $item) {
                $transaction->items()->create([
                    'product_id'   => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'unit_price'   => $item['unit_price'],
                    'hpp_at_sale'  => $item['hpp_at_sale'],
                    'qty'          => $item['qty'],
                    'subtotal'     => $item['subtotal'],
                ]);

                $this->inventoryRepo->deductStock(
                    $item['product_id'],
                    $locationId,
                    $item['qty']
                );
            }

            $this->auditService->logAction('pos_online_sale', $transaction, [
                'items_count' => count($resolvedItems),
                'total'       => $total,
                'platform'    => $data['platform'] ?? '-',
            ]);

            return $transaction->load('items');
        });
    }

    // ─────────────────────────────────────────────
    // Shared: Resolve cart items
    // ─────────────────────────────────────────────

    /**
     * Resolve cart items:
     * - Validate each product has a locked price
     * - Validate stock availability at the location
     * - Apply tier pricing if applicable
     * - Return array of resolved items with snapshot data
     */
    protected function resolveItems(array $items, int $locationId): array
    {
        $resolved = [];

        foreach ($items as $item) {
            $productId = $item['product_id'];
            $qty = (float) $item['qty'];

            if ($qty <= 0) {
                throw ValidationException::withMessages([
                    'items' => "Qty harus lebih dari 0 untuk product_id={$productId}.",
                ]);
            }

            // Get locked price
            $price = ProductPrice::where('product_id', $productId)
                ->where('status', 'locked')
                ->with(['product', 'tiers'])
                ->first();

            if (!$price) {
                throw ValidationException::withMessages([
                    'items' => "Produk \"{$productId}\" belum memiliki harga yang di-lock.",
                ]);
            }

            // Check stock
            $inventory = $this->inventoryRepo->getByProductAndLocation($productId, $locationId);
            if (!$inventory || (float) $inventory->quantity < $qty) {
                $available = $inventory ? $inventory->quantity : 0;
                throw ValidationException::withMessages([
                    'items' => "Stok \"{$price->product->name}\" tidak mencukupi. Tersedia: {$available}, diminta: {$qty}.",
                ]);
            }

            // Determine unit price (check tier pricing)
            $unitPrice = (float) $price->selling_price;
            if ($price->tiers && $price->tiers->count() > 0) {
                // Find the best matching tier (highest min_qty that fits)
                $applicableTier = $price->tiers
                    ->where('min_qty', '<=', $qty)
                    ->sortByDesc('min_qty')
                    ->first();

                if ($applicableTier) {
                    $unitPrice = (float) $applicableTier->selling_price;
                }
            }

            // Snapshot HPP (avg_cost) saat jual untuk laporan P&L (Sprint 9)
            $hppAtSale = $inventory ? (float) $inventory->avg_cost : 0;

            $resolved[] = [
                'product_id'   => $productId,
                'product_name' => $price->product->name,
                'unit_price'   => $unitPrice,
                'hpp_at_sale'  => $hppAtSale,
                'qty'          => $qty,
                'subtotal'     => round($unitPrice * $qty, 2),
            ];
        }

        return $resolved;
    }

    // ─────────────────────────────────────────────
    // Read
    // ─────────────────────────────────────────────

    public function findTransaction(int $id)
    {
        return $this->transactionRepo->find($id);
    }

    public function getTransactionsByShift(int $shiftId)
    {
        return $this->transactionRepo->getByShift($shiftId);
    }

    /**
     * Get catalog of products available for POS at a specific location.
     * Only products with locked prices AND stock > 0 at this location.
     */
    public function getCatalog(int $locationId): array
    {
        $lockedPrices = ProductPrice::where('status', 'locked')
            ->with(['product.category', 'tiers'])
            ->get();

        $catalog = [];

        foreach ($lockedPrices as $price) {
            $inventory = $this->inventoryRepo->getByProductAndLocation(
                $price->product_id,
                $locationId
            );

            $stock = $inventory ? (float) $inventory->quantity : 0;

            $catalog[] = [
                'product_id'    => $price->product_id,
                'name'          => $price->product->name,
                'sku'           => $price->product->sku,
                'category'      => $price->product->category->name ?? '-',
                'image_path'    => $price->product->image_path,
                'selling_price' => (float) $price->selling_price,
                'stock'         => $stock,
                'in_stock'      => $stock > 0,
                'tiers'         => $price->tiers->map(fn($t) => [
                    'label'         => $t->label,
                    'min_qty'       => $t->min_qty,
                    'selling_price' => (float) $t->selling_price,
                ]),
            ];
        }

        return $catalog;
    }
}
