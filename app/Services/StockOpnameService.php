<?php

namespace App\Services;

use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use App\Models\Inventory;
use App\Repositories\Contracts\OpnameRepositoryInterface;
use App\Repositories\Contracts\InventoryRepositoryInterface;
use App\Events\StockDeducted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockOpnameService
{
    protected $opnameRepo;
    protected $inventoryRepo;

    public function __construct(
        OpnameRepositoryInterface $opnameRepo,
        InventoryRepositoryInterface $inventoryRepo
    ) {
        $this->opnameRepo    = $opnameRepo;
        $this->inventoryRepo = $inventoryRepo;
    }

    /**
     * Get opname sessions for a location.
     */
    public function getByLocation(?int $locationId, ?string $status = null)
    {
        return $this->opnameRepo->getByLocation($locationId, $status);
    }

    /**
     * Find opname by ID.
     */
    public function findById(int $id)
    {
        return $this->opnameRepo->findById($id);
    }

    /**
     * Start a new opname session (S8-B13: startSession, S8-B14: snapshot).
     *
     * FR-801: Mulai sesi → snapshot stok + avg_cost saat ini.
     * Creates opname header + items with system_quantity from current inventory.
     */
    public function startSession(int $locationId, int $userId): StockOpname
    {
        return DB::transaction(function () use ($locationId, $userId) {
            // Check no active opname session for this location
            $activeOpname = StockOpname::where('location_id', $locationId)
                ->where('status', 'in_progress')
                ->first();

            if ($activeOpname) {
                throw new \RuntimeException(
                    "Sudah ada sesi opname aktif ({$activeOpname->opname_number}) untuk toko ini. Selesaikan terlebih dahulu."
                );
            }

            $opname = $this->opnameRepo->create([
                'opname_number' => StockOpname::generateOpnameNumber($locationId),
                'location_id'   => $locationId,
                'conducted_by'  => $userId,
                'opname_date'   => now()->toDateString(),
                'status'        => 'in_progress',
            ]);

            // Snapshot all inventory for this location (S8-B14)
            $inventories = Inventory::where('location_id', $locationId)
                ->where('quantity', '>', 0)
                ->with('product')
                ->get();

            foreach ($inventories as $inv) {
                StockOpnameItem::create([
                    'stock_opname_id'   => $opname->id,
                    'product_id'        => $inv->product_id,
                    'system_quantity'   => $inv->quantity,
                    'physical_quantity' => null, // Will be filled during counting
                    'difference'        => null,
                ]);
            }

            Log::info("Opname session {$opname->opname_number} started by user {$userId} at location {$locationId}");

            return $opname->load('items.product');
        });
    }

    /**
     * Input physical counts for opname items (S8-B13: inputCounts).
     *
     * FR-802: Input jumlah fisik per item.
     * FR-803: Hitung selisih dan nilai penyusutan.
     */
    public function inputCounts(int $opnameId, array $counts, int $locationId): StockOpname
    {
        return DB::transaction(function () use ($opnameId, $counts, $locationId) {
            $opname = $this->opnameRepo->findById($opnameId);

            if (!$opname->isInProgress()) {
                throw new \RuntimeException("Opname hanya bisa diisi saat status 'in_progress'. Status saat ini: {$opname->status}");
            }

            foreach ($counts as $count) {
                $item = $opname->items->where('id', $count['item_id'])->first();
                if (!$item) continue;

                $physicalQty = (float) $count['physical_quantity'];
                $difference  = $physicalQty - (float) $item->system_quantity;

                // Calculate shrinkage value: |difference| × avg_cost (FR-803)
                $inventory = $this->inventoryRepo->getByProductAndLocation(
                    $item->product_id,
                    $locationId
                );
                $avgCost = $inventory ? (float) $inventory->avg_cost : 0;
                $shrinkageValue = abs($difference) * $avgCost;

                $item->update([
                    'physical_quantity' => $physicalQty,
                    'difference'        => $difference,
                    'shrinkage_value'   => $difference < 0 ? $shrinkageValue : 0, // Only count losses
                ]);
            }

            return $opname->load('items.product');
        });
    }

    /**
     * Submit opname for Owner approval (S8-B13: submit).
     *
     * FR-804: Laporan selisih ke Owner.
     */
    public function submit(int $opnameId): StockOpname
    {
        $opname = $this->opnameRepo->findById($opnameId);

        if (!$opname->isInProgress()) {
            throw new \RuntimeException("Opname hanya bisa di-submit dari status 'in_progress'. Status saat ini: {$opname->status}");
        }

        // Calculate total shrinkage value
        $totalShrinkage = $opname->items->sum('shrinkage_value');

        $opname = $this->opnameRepo->update($opnameId, [
            'status'                => 'submitted',
            'total_shrinkage_value' => $totalShrinkage,
        ]);

        Log::info("Opname {$opname->opname_number} submitted for approval. Total shrinkage: {$totalShrinkage}");

        return $opname;
    }

    /**
     * Approve opname and adjust inventory (S8-B13: approve, S8-B16).
     *
     * FR-805: Owner approve → stok adjust. avg_cost TETAP.
     * FR-806: Audit trail: siapa hitung, siapa approve.
     */
    public function approve(int $opnameId, int $ownerId): StockOpname
    {
        return DB::transaction(function () use ($opnameId, $ownerId) {
            $opname = $this->opnameRepo->findById($opnameId);

            if (!$opname->isSubmitted()) {
                throw new \RuntimeException("Opname hanya bisa di-approve dari status 'submitted'. Status saat ini: {$opname->status}");
            }

            // Adjust inventory quantities (S8-B16)
            // avg_cost TIDAK berubah — hanya qty yang di-adjust (FR-805)
            foreach ($opname->items as $item) {
                if ((float) $item->difference != 0) {
                    $inventory = $this->inventoryRepo->getByProductAndLocation(
                        $item->product_id,
                        $opname->location_id
                    );

                    if ($inventory) {
                        // Set quantity to the physical count directly
                        $inventory->update([
                            'quantity' => (float) $item->physical_quantity,
                        ]);
                    }
                }
            }

            $opname = $this->opnameRepo->update($opnameId, [
                'status'      => 'approved',
                'approved_by' => $ownerId,
                'approved_at' => now(),
            ]);

            Log::info("Opname {$opname->opname_number} approved by Owner {$ownerId}. Stock adjusted.");

            // Sprint 9: Fire StockDeducted for items whose stock decreased (FR-1211)
            $deductedProductIds = $opname->items
                ->filter(fn($item) => (float) $item->difference < 0)
                ->pluck('product_id')
                ->unique()
                ->values()
                ->toArray();

            if (!empty($deductedProductIds)) {
                event(new StockDeducted($deductedProductIds, $opname->location_id));
            }

            return $opname;
        });
    }
}
