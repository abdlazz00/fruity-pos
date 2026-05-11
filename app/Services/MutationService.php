<?php

namespace App\Services;

use App\Models\StockMutation;
use App\Models\StockMutationItem;
use App\Repositories\Contracts\MutationRepositoryInterface;
use App\Repositories\Contracts\InventoryRepositoryInterface;
use App\Events\MutationShipped;
use App\Events\MutationReceived;
use App\Events\StockDeducted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MutationService
{
    protected $mutationRepo;
    protected $inventoryRepo;

    public function __construct(
        MutationRepositoryInterface $mutationRepo,
        InventoryRepositoryInterface $inventoryRepo
    ) {
        $this->mutationRepo  = $mutationRepo;
        $this->inventoryRepo = $inventoryRepo;
    }

    /**
     * Get mutations for a location (bidirectional — from & to).
     */
    public function getByLocation(?int $locationId, ?string $status = null)
    {
        return $this->mutationRepo->getByLocation($locationId, $status);
    }

    /**
     * Find mutation by ID with all relationships loaded.
     */
    public function findById(int $id)
    {
        return $this->mutationRepo->findById($id);
    }

    /**
     * Create a new stock mutation (S8-B05: create).
     * Status starts at 'preparing'.
     *
     * FR-601: Mutasi dari TOKO SENDIRI ke toko lain.
     */
    public function create(array $data, int $userId): StockMutation
    {
        return DB::transaction(function () use ($data, $userId) {
            $mutation = $this->mutationRepo->create([
                'mutation_number'  => StockMutation::generateMutationNumber($data['from_location_id']),
                'from_location_id' => $data['from_location_id'],
                'to_location_id'   => $data['to_location_id'],
                'created_by'       => $userId,
                'status'           => 'preparing',
                'notes'            => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                StockMutationItem::create([
                    'stock_mutation_id' => $mutation->id,
                    'product_id'        => $item['product_id'],
                    'quantity_sent'     => $item['quantity_sent'],
                ]);
            }

            Log::info("Mutation {$mutation->mutation_number} created by user {$userId}");

            return $mutation->load('items.product');
        });
    }

    /**
     * Ship mutation (S8-B05: ship).
     *
     * FR-603: Shipped → stok asal dikurangi, avg_cost asal TIDAK berubah.
     */
    public function ship(int $mutationId, int $userId): StockMutation
    {
        return DB::transaction(function () use ($mutationId, $userId) {
            $mutation = $this->mutationRepo->findById($mutationId);

            if (!$mutation->isPreparing()) {
                throw new \RuntimeException("Mutasi hanya bisa dikirim dari status 'preparing'. Status saat ini: {$mutation->status}");
            }

            // Deduct stock from source location (FR-603)
            foreach ($mutation->items as $item) {
                $this->inventoryRepo->deductStock(
                    $item->product_id,
                    $mutation->from_location_id,
                    (float) $item->quantity_sent
                );
            }

            $mutation = $this->mutationRepo->update($mutationId, [
                'status'    => 'shipped',
                'shipped_at' => now(),
            ]);

            event(new MutationShipped($mutation));

            // Sprint 9: Fire StockDeducted for reorder point checks at source location (FR-1211)
            event(new StockDeducted(
                $mutation->items->pluck('product_id')->unique()->values()->toArray(),
                $mutation->from_location_id
            ));

            Log::info("Mutation {$mutation->mutation_number} shipped");

            return $mutation;
        });
    }

    /**
     * Receive mutation (S8-B05: receive).
     *
     * FR-604: Received → stok tujuan bertambah, WAC recalc di tujuan.
     * FR-605: Selisih qty = Mutasi Loss, dilaporkan.
     */
    public function receive(int $mutationId, array $receivedItems, int $userId): StockMutation
    {
        return DB::transaction(function () use ($mutationId, $receivedItems, $userId) {
            $mutation = $this->mutationRepo->findById($mutationId);

            if (!$mutation->isShipped()) {
                throw new \RuntimeException("Mutasi hanya bisa diterima dari status 'shipped'. Status saat ini: {$mutation->status}");
            }

            // Update each item with received qty and calculate loss
            foreach ($receivedItems as $receivedItem) {
                $mutItem = $mutation->items->where('id', $receivedItem['item_id'])->first();
                if (!$mutItem) continue;

                $qtyReceived  = (float) $receivedItem['quantity_received'];
                $lossQuantity = max(0, (float) $mutItem->quantity_sent - $qtyReceived);

                $mutItem->update([
                    'quantity_received' => $qtyReceived,
                    'loss_quantity'     => $lossQuantity,
                ]);

                // Add stock to destination location with WAC recalc (FR-604, S8-B06)
                // Use avg_cost from SOURCE location as the "cost" for WAC recalc at destination
                $sourceInventory = $this->inventoryRepo->getByProductAndLocation(
                    $mutItem->product_id,
                    $mutation->from_location_id
                );
                $transferCost = $sourceInventory ? (float) $sourceInventory->avg_cost : 0;

                $this->inventoryRepo->updateOrCreateStock(
                    $mutItem->product_id,
                    $mutation->to_location_id,
                    $qtyReceived,
                    $transferCost
                );
            }

            $mutation = $this->mutationRepo->update($mutationId, [
                'status'      => 'received',
                'received_by' => $userId,
                'received_at' => now(),
            ]);

            event(new MutationReceived($mutation));

            Log::info("Mutation {$mutation->mutation_number} received by user {$userId}");

            return $mutation;
        });
    }

    /**
     * Complete mutation (S8-B05: complete).
     * Final acknowledgment after receiving.
     */
    public function complete(int $mutationId): StockMutation
    {
        $mutation = $this->mutationRepo->findById($mutationId);

        if (!$mutation->isReceived()) {
            throw new \RuntimeException("Mutasi hanya bisa di-complete dari status 'received'. Status saat ini: {$mutation->status}");
        }

        return $this->mutationRepo->update($mutationId, [
            'status' => 'completed',
        ]);
    }
}
