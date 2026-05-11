<?php

namespace App\Services;

use App\Models\ReorderPoint;
use App\Models\Inventory;
use App\Models\User;
use App\Notifications\LowStockNotification;
use App\Repositories\Contracts\ReorderPointRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReorderPointService
{
    protected $reorderPointRepo;

    public function __construct(ReorderPointRepositoryInterface $reorderPointRepo)
    {
        $this->reorderPointRepo = $reorderPointRepo;
    }

    /**
     * Get reorder points for a location (paginated).
     */
    public function getByLocation(?int $locationId)
    {
        return $this->reorderPointRepo->getByLocation($locationId);
    }

    /**
     * Find a reorder point by ID.
     */
    public function findById(int $id)
    {
        return $this->reorderPointRepo->findById($id);
    }

    // ─────────────────────────────────────────────
    // S9-B03: set — Create or update a reorder point
    // ─────────────────────────────────────────────

    /**
     * Set a reorder point for a product at a location.
     *
     * FR-1207: Stockist set min stok untuk TOKO-NYA.
     * FR-1208: Owner set/override untuk TOKO MANAPUN.
     * FR-1209: Threshold dalam base_uom.
     * FR-1210: UNIQUE per product per location (upsert).
     *
     * @param array $data {product_id, location_id, min_quantity}
     * @param int   $userId  The user performing the action
     * @return ReorderPoint
     */
    public function set(array $data, int $userId): ReorderPoint
    {
        return DB::transaction(function () use ($data, $userId) {
            $existing = $this->reorderPointRepo->findByProductAndLocation(
                $data['product_id'],
                $data['location_id']
            );

            if ($existing) {
                // Update existing threshold
                $reorderPoint = $this->reorderPointRepo->update($existing->id, [
                    'min_quantity' => $data['min_quantity'],
                    'updated_by'  => $userId,
                ]);

                Log::info("Reorder point updated: product_id={$data['product_id']}, location_id={$data['location_id']}, min_qty={$data['min_quantity']} by user {$userId}");
            } else {
                // Create new threshold
                $reorderPoint = $this->reorderPointRepo->create([
                    'product_id'   => $data['product_id'],
                    'location_id'  => $data['location_id'],
                    'min_quantity'  => $data['min_quantity'],
                    'is_active'    => true,
                    'created_by'   => $userId,
                    'updated_by'   => $userId,
                ]);

                Log::info("Reorder point created: product_id={$data['product_id']}, location_id={$data['location_id']}, min_qty={$data['min_quantity']} by user {$userId}");
            }

            return $reorderPoint;
        });
    }

    // ─────────────────────────────────────────────
    // S9-B03: update — Update min quantity
    // ─────────────────────────────────────────────

    /**
     * Update the minimum quantity of an existing reorder point.
     *
     * @param int   $id      The reorder point ID
     * @param float $minQty  New minimum quantity
     * @param int   $userId  The user performing the action
     * @return ReorderPoint
     */
    public function update(int $id, float $minQty, int $userId): ReorderPoint
    {
        $reorderPoint = $this->reorderPointRepo->update($id, [
            'min_quantity' => $minQty,
            'updated_by'  => $userId,
        ]);

        Log::info("Reorder point #{$id} updated: min_qty={$minQty} by user {$userId}");

        return $reorderPoint;
    }

    // ─────────────────────────────────────────────
    // S9-B03: toggle — Activate/deactivate (FR-1215)
    // ─────────────────────────────────────────────

    /**
     * Toggle the active/inactive status of a reorder point.
     *
     * FR-1215: Toggle aktif/nonaktif threshold.
     *
     * @param int $id      The reorder point ID
     * @param int $userId  The user performing the action
     * @return ReorderPoint
     */
    public function toggle(int $id, int $userId): ReorderPoint
    {
        $reorderPoint = $this->reorderPointRepo->findById($id);

        $newStatus = !$reorderPoint->is_active;

        $reorderPoint = $this->reorderPointRepo->update($id, [
            'is_active'  => $newStatus,
            'updated_by' => $userId,
        ]);

        $statusLabel = $newStatus ? 'diaktifkan' : 'dinonaktifkan';
        Log::info("Reorder point #{$id} {$statusLabel} by user {$userId}");

        return $reorderPoint;
    }

    // ─────────────────────────────────────────────
    // S9-B03: delete
    // ─────────────────────────────────────────────

    /**
     * Delete a reorder point.
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        return $this->reorderPointRepo->delete($id);
    }

    // ─────────────────────────────────────────────
    // S9-B03 / S9-B05: checkThreshold — Core logic
    // ─────────────────────────────────────────────

    /**
     * Check if any of the given products at the specified location
     * have fallen below their reorder point threshold.
     *
     * FR-1211: Cek REAL-TIME setiap stok berkurang.
     * FR-1212: Notif ke Stockist toko jika stok < min.
     * FR-1213: Alert di dashboard Owner.
     * FR-1214: Cooldown 1 jam per produk per toko.
     *
     * @param array<int> $productIds
     * @param int        $locationId
     */
    public function checkThreshold(array $productIds, int $locationId): void
    {
        if (empty($productIds)) {
            return;
        }

        // Get all active reorder points for these products at this location
        $reorderPoints = $this->reorderPointRepo->getActiveByProductIds($productIds, $locationId);

        if ($reorderPoints->isEmpty()) {
            return;
        }

        foreach ($reorderPoints as $rp) {
            // Check cooldown (FR-1214): skip if notified within the last hour
            if (!$rp->isCooldownExpired()) {
                continue;
            }

            // Get current stock level
            $inventory = Inventory::where('product_id', $rp->product_id)
                ->where('location_id', $rp->location_id)
                ->first();

            $currentStock = $inventory ? (float) $inventory->quantity : 0;
            $threshold    = (float) $rp->min_quantity;

            // Only trigger if stock is below threshold
            if ($currentStock >= $threshold) {
                continue;
            }

            Log::warning("Low stock alert: {$rp->product->name} at location {$locationId}. Current: {$currentStock}, Min: {$threshold}");

            // Send notifications
            $this->sendLowStockNotifications($rp, $currentStock);

            // Update cooldown timestamp (FR-1214)
            $rp->update(['last_notified_at' => now()]);
        }
    }

    // ─────────────────────────────────────────────
    // Notification dispatch (FR-1212, FR-1213)
    // ─────────────────────────────────────────────

    /**
     * Send low stock notifications to the Stockist of the location
     * and all Owners.
     *
     * FR-1212: Notif ke Stockist toko jika stok < min.
     * FR-1213: Alert di dashboard Owner.
     */
    protected function sendLowStockNotifications(ReorderPoint $reorderPoint, float $currentStock): void
    {
        $notification = new LowStockNotification($reorderPoint, $currentStock);

        // FR-1212: Notify Stockists of the specific location
        $stockists = User::where('location_id', $reorderPoint->location_id)
            ->where('role', 'stockist')
            ->where('is_active', true)
            ->get();

        foreach ($stockists as $stockist) {
            $stockist->notify($notification);
        }

        // FR-1213: Notify all active Owners
        $owners = User::where('role', 'owner')
            ->where('is_active', true)
            ->get();

        foreach ($owners as $owner) {
            $owner->notify($notification);
        }

        // Broadcast realtime websocket event
        event(new \App\Events\LowStockAlert([
            'product_name' => $reorderPoint->product->name,
            'location_name' => $reorderPoint->location->name,
            'current_stock' => $currentStock,
            'min_qty' => $reorderPoint->min_quantity,
        ], $reorderPoint->location_id));
    }

    // ─────────────────────────────────────────────
    // Dashboard helper: get all current low stock alerts
    // ─────────────────────────────────────────────

    /**
     * Get all active reorder points where current stock is below threshold.
     * Used by Dashboard (FR-1213) and the ReorderPoint index page.
     *
     * @param int|null $locationId  Filter by location (null = all)
     * @return \Illuminate\Support\Collection
     */
    public function getLowStockAlerts(?int $locationId = null)
    {
        return $this->reorderPointRepo->getLowStockAlerts($locationId);
    }
}
