<?php

namespace App\Services;

use App\Models\WasteRequest;
use App\Models\WasteRequestItem;
use App\Repositories\Contracts\WasteRepositoryInterface;
use App\Repositories\Contracts\InventoryRepositoryInterface;
use App\Events\WasteSubmitted;
use App\Events\WasteApproved;
use App\Events\StockDeducted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class WasteService
{
    protected $wasteRepo;
    protected $inventoryRepo;

    public function __construct(
        WasteRepositoryInterface $wasteRepo,
        InventoryRepositoryInterface $inventoryRepo
    ) {
        $this->wasteRepo     = $wasteRepo;
        $this->inventoryRepo = $inventoryRepo;
    }

    /**
     * Get waste requests for a specific location.
     */
    public function getByLocation(?int $locationId, ?string $status = null)
    {
        return $this->wasteRepo->getByLocation($locationId, $status);
    }

    /**
     * Get all pending waste requests (Owner view).
     */
    public function getAllPending()
    {
        return $this->wasteRepo->getAllPending();
    }

    /**
     * Find waste request by ID.
     */
    public function findById(int $id)
    {
        return $this->wasteRepo->findById($id);
    }

    /**
     * Submit a new waste request (S8-B09: submit).
     *
     * FR-701: Stockist ajukan: item, qty, alasan, foto WAJIB.
     * FR-702: Pending TIDAK potong stok.
     */
    public function submit(array $data, int $userId, int $locationId): WasteRequest
    {
        // Upload all photos BEFORE opening the DB transaction.
        // Prevents holding DB lock open during disk/network I/O.
        $uploadedPaths = [];
        foreach ($data['items'] as $i => $item) {
            if (!empty($item['photo'])) {
                $uploadedPaths[$i] = $item['photo']->store('waste-photos', 'public');
            }
        }

        return DB::transaction(function () use ($data, $userId, $locationId, $uploadedPaths) {
            $waste = $this->wasteRepo->create([
                'request_number' => WasteRequest::generateRequestNumber($locationId),
                'location_id'    => $locationId,
                'requested_by'   => $userId,
                'status'         => 'pending',
            ]);

            // Bulk-load inventories before the loop to avoid N+1
            $productIds   = collect($data['items'])->pluck('product_id')->toArray();
            $inventoryMap = $this->inventoryRepo instanceof \App\Repositories\InventoryRepository
                ? \App\Models\Inventory::where('location_id', $locationId)
                    ->whereIn('product_id', $productIds)
                    ->get()
                    ->keyBy('product_id')
                : collect();

            foreach ($data['items'] as $i => $item) {
                // Calculate HPP value: qty × avg_cost at this location
                $inventory = $inventoryMap->get($item['product_id'])
                    ?? $this->inventoryRepo->getByProductAndLocation($item['product_id'], $locationId);
                $avgCost  = $inventory ? (float) $inventory->avg_cost : 0;
                $hppValue = (float) $item['quantity'] * $avgCost;

                WasteRequestItem::create([
                    'waste_request_id' => $waste->id,
                    'product_id'       => $item['product_id'],
                    'quantity'         => $item['quantity'],
                    'reason'           => $item['reason'],
                    'photo_path'       => $uploadedPaths[$i] ?? null,
                    'hpp_value'        => $hppValue,
                ]);
            }

            event(new WasteSubmitted($waste->load('items.product', 'location', 'requester')));

            Log::info("Waste request {$waste->request_number} submitted by user {$userId}");

            return $waste->load('items.product');
        });
    }

    /**
     * Approve a waste request (S8-B09: approve).
     *
     * FR-704: Approve → stok dipotong, value = qty × avg_cost.
     */
    public function approve(int $wasteId, int $ownerId): WasteRequest
    {
        return DB::transaction(function () use ($wasteId, $ownerId) {
            $waste = $this->wasteRepo->findById($wasteId);

            if (!$waste->isPending()) {
                throw new \RuntimeException("Waste request hanya bisa di-approve dari status 'pending'. Status saat ini: {$waste->status}");
            }

            // Deduct stock for each waste item (FR-704)
            foreach ($waste->items as $item) {
                $this->inventoryRepo->deductStock(
                    $item->product_id,
                    $waste->location_id,
                    (float) $item->quantity
                );
            }

            $waste = $this->wasteRepo->update($wasteId, [
                'status'      => 'approved',
                'approved_by' => $ownerId,
                'approved_at' => now(),
            ]);

            event(new WasteApproved($waste->load('items.product', 'location')));

            // Sprint 9: Fire StockDeducted for reorder point checks (FR-1211)
            event(new StockDeducted(
                $waste->items->pluck('product_id')->unique()->values()->toArray(),
                $waste->location_id
            ));

            Log::info("Waste request {$waste->request_number} approved by Owner {$ownerId}");

            return $waste;
        });
    }

    /**
     * Reject a waste request (S8-B09: reject).
     *
     * FR-705: Reject → stok tetap, alasan dicatat.
     */
    public function reject(int $wasteId, int $ownerId, string $reason): WasteRequest
    {
        $waste = $this->wasteRepo->findById($wasteId);

        if (!$waste->isPending()) {
            throw new \RuntimeException("Waste request hanya bisa di-reject dari status 'pending'. Status saat ini: {$waste->status}");
        }

        $waste = $this->wasteRepo->update($wasteId, [
            'status'           => 'rejected',
            'approved_by'      => $ownerId,
            'rejection_reason' => $reason,
            'approved_at'      => now(),
        ]);

        Log::info("Waste request {$waste->request_number} rejected by Owner {$ownerId}: {$reason}");

        return $waste;
    }
}
