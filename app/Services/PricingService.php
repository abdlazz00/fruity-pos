<?php

namespace App\Services;

use App\Events\PriceLocked;
use App\Models\Inventory;
use App\Models\PriceTier;
use App\Models\ProductPrice;
use App\Models\User;
use App\Notifications\HppBaselineChangedNotification;
use App\Repositories\Contracts\ProductPriceRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PricingService
{
    protected $priceRepo;
    protected $auditService;

    public function __construct(
        ProductPriceRepositoryInterface $priceRepo,
        AuditService $auditService
    ) {
        $this->priceRepo = $priceRepo;
        $this->auditService = $auditService;
    }

    // ─────────────────────────────────────────────
    // List & Read
    // ─────────────────────────────────────────────

    public function getPaginatedPrices($status = null)
    {
        return $this->priceRepo->paginate(15, $status);
    }

    public function findPrice($id)
    {
        return $this->priceRepo->find($id);
    }

    public function findByProduct($productId)
    {
        return $this->priceRepo->findByProduct($productId);
    }

    /**
     * Get avg_cost breakdown per location for a specific product (S5-B09).
     */
    public function getAvgCostPerLocation($productId)
    {
        return $this->priceRepo->getAvgCostPerLocation($productId);
    }

    // ─────────────────────────────────────────────
    // S5-B03: Calculate HPP Baseline
    // ─────────────────────────────────────────────

    /**
     * Calculate hpp_baseline = MAX(avg_cost) across all locations for a product.
     *
     * The highest avg_cost is chosen so that the selling price covers
     * the most-expensive branch's cost, preventing negative margins.
     */
    public function calculateBaseline(int $productId): float
    {
        $maxAvgCost = Inventory::where('product_id', $productId)
            ->max('avg_cost');

        return round((float) ($maxAvgCost ?? 0), 2);
    }

    /**
     * Recalculate baseline for a product and persist it.
     * Returns the old and new baseline for delta comparison.
     */
    public function recalculateAndSaveBaseline(int $productId): array
    {
        $newBaseline = $this->calculateBaseline($productId);

        $price = $this->priceRepo->findByProduct($productId);
        $oldBaseline = $price ? (float) $price->hpp_baseline : 0;

        if ($price) {
            // Recalculate selling price if margin is already set
            $sellingPrice = $this->calculateSellingPrice(
                $newBaseline,
                (float) $price->margin_percentage,
                (int) $price->rounding_to
            );

            $price->update([
                'hpp_baseline'  => $newBaseline,
                'selling_price' => $sellingPrice,
            ]);
        } elseif ($newBaseline > 0) {
            // Create a new pending price record if it doesn't exist
            $this->priceRepo->createOrUpdate($productId, [
                'hpp_baseline'      => $newBaseline,
                'margin_percentage' => 0,
                'selling_price'     => $newBaseline,
                'rounding_to'       => 0,
                'status'            => 'pending',
            ]);
        }

        return [
            'old_baseline' => $oldBaseline,
            'new_baseline' => $newBaseline,
            'delta'        => round($newBaseline - $oldBaseline, 2),
        ];
    }

    // ─────────────────────────────────────────────
    // S5-B04: Margin, Rounding, Selling Price
    // ─────────────────────────────────────────────

    /**
     * Calculate selling price from baseline + margin + rounding.
     */
    public function calculateSellingPrice(float $baseline, float $marginPercent, int $roundingTo = 0): float
    {
        if ($baseline <= 0) {
            return 0;
        }

        $rawPrice = $baseline + ($baseline * $marginPercent / 100);

        if ($roundingTo > 0) {
            $rawPrice = $this->roundHPP($rawPrice, $roundingTo);
        }

        return round($rawPrice, 2);
    }

    /**
     * Round price UP to nearest `$roundTo` (e.g. 500, 1000).
     */
    public function roundHPP(float $price, int $roundTo): float
    {
        if ($roundTo <= 0) {
            return $price;
        }

        return ceil($price / $roundTo) * $roundTo;
    }

    /**
     * Set margin for a product and recalculate selling price (FR-302).
     */
    public function setMargin(int $productId, float $marginPercent, int $roundingTo = 0): ProductPrice
    {
        $baseline = $this->calculateBaseline($productId);

        if ($baseline <= 0) {
            throw ValidationException::withMessages([
                'product_id' => 'Produk ini belum memiliki data HPP. Lakukan Inbound terlebih dahulu.',
            ]);
        }

        $sellingPrice = $this->calculateSellingPrice($baseline, $marginPercent, $roundingTo);

        $price = $this->priceRepo->createOrUpdate($productId, [
            'hpp_baseline'      => $baseline,
            'margin_percentage' => $marginPercent,
            'selling_price'     => $sellingPrice,
            'rounding_to'       => $roundingTo,
        ]);

        $this->auditService->logAction('set_margin', $price, [
            'margin'        => $marginPercent,
            'rounding'      => $roundingTo,
            'selling_price' => $sellingPrice,
        ]);

        return $price->fresh(['product', 'tiers']);
    }

    // ─────────────────────────────────────────────
    // S5-B05: Lock / Unlock Price
    // ─────────────────────────────────────────────

    /**
     * Lock a product price (FR-306). Once locked, it becomes visible in POS.
     */
    public function lockPrice(int $priceId, int $userId): ProductPrice
    {
        $price = $this->priceRepo->find($priceId);

        if ((float) $price->selling_price <= 0) {
            throw ValidationException::withMessages([
                'price' => 'Harga jual harus lebih dari 0 sebelum bisa di-lock.',
            ]);
        }

        $lockedPrice = $this->priceRepo->updateStatus($priceId, 'locked', $userId);

        // Dispatch PriceLocked event → broadcast to POS terminals (S5-B10)
        event(new PriceLocked($lockedPrice));

        $this->auditService->logAction('lock_price', $lockedPrice, [
            'selling_price' => $lockedPrice->selling_price,
        ]);

        return $lockedPrice;
    }

    /**
     * Unlock a product price (FR-306). Product will be hidden from POS.
     */
    public function unlockPrice(int $priceId, int $userId): ProductPrice
    {
        $unlockedPrice = $this->priceRepo->updateStatus($priceId, 'pending', $userId);

        $this->auditService->logAction('unlock_price', $unlockedPrice);

        return $unlockedPrice;
    }

    // ─────────────────────────────────────────────
    // S5-B06: Multi-Tier Pricing
    // ─────────────────────────────────────────────

    /**
     * Sync price tiers for a product price (FR-305).
     *
     * @param int   $priceId
     * @param array $tiers  Array of [{label, min_qty, selling_price}]
     */
    public function syncTiers(int $priceId, array $tiers): void
    {
        $price = $this->priceRepo->find($priceId);

        // Delete existing tiers and recreate
        $price->tiers()->delete();

        foreach ($tiers as $tier) {
            $price->tiers()->create([
                'label'         => $tier['label'],
                'min_qty'       => (int) $tier['min_qty'],
                'selling_price' => (float) $tier['selling_price'],
            ]);
        }

        $this->auditService->logAction('sync_tiers', $price, ['tiers_count' => count($tiers)]);
    }

    // ─────────────────────────────────────────────
    // S5-B12: POS Query — only locked products
    // ─────────────────────────────────────────────

    /**
     * Get product IDs that are available for POS (locked price).
     */
    public function getLockedProductIds(): array
    {
        return $this->priceRepo->getLockedProductIds();
    }

    // ─────────────────────────────────────────────
    // S5-B13: Auto-recalc on InboundCreated
    // ─────────────────────────────────────────────

    /**
     * Recalculate baseline for affected products after inbound.
     * Sends notification to Owner if delta is significant (S5-B14 / FR-310).
     */
    public function onInboundReceived(array $productIds): void
    {
        $deltas = [];

        foreach ($productIds as $productId) {
            $result = $this->recalculateAndSaveBaseline($productId);

            if (abs($result['delta']) > 0) {
                $product = \App\Models\Product::find($productId);
                $deltas[] = [
                    'product_id'   => $productId,
                    'product_name' => $product?->name ?? '-',
                    'old_baseline' => $result['old_baseline'],
                    'new_baseline' => $result['new_baseline'],
                    'delta'        => $result['delta'],
                ];
            }
        }

        // Notify owners about baseline changes (FR-310)
        if (!empty($deltas)) {
            $owners = User::where('role', 'owner')->where('is_active', true)->get();
            foreach ($owners as $owner) {
                $owner->notify(new HppBaselineChangedNotification($deltas));
            }
        }
    }
}
