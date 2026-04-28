<?php

namespace App\Services;

use App\Models\Inbound;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Events\InboundCreated;
use App\Repositories\Contracts\InboundRepositoryInterface;
use App\Repositories\Contracts\PurchaseOrderRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InboundService
{
    protected $inboundRepo;
    protected $poRepo;
    protected $auditService;

    public function __construct(
        InboundRepositoryInterface $inboundRepo,
        PurchaseOrderRepositoryInterface $poRepo,
        AuditService $auditService
    ) {
        $this->inboundRepo = $inboundRepo;
        $this->poRepo = $poRepo;
        $this->auditService = $auditService;
    }

    /**
     * List inbound receipts with optional location filter.
     */
    public function getPaginatedInbounds($locationId = null)
    {
        return $this->inboundRepo->paginate(10, $locationId);
    }

    /**
     * Find a single inbound by ID.
     */
    public function findInbound($id)
    {
        return $this->inboundRepo->find($id);
    }

    /**
     * Process a new inbound receipt (core method — S4-B11).
     *
     * Steps:
     *  1. Validate PO is in receivable status (confirmed / partially_received)
     *  2. Validate qty does not exceed PO ordered qty (FR-208)
     *  3. Generate inbound number
     *  4. Calculate HPP Mentah per item: total_buy_price / (qty × content) (FR-205)
     *  5. Create inbound + items
     *  6. Update PO status (partially_received or completed)
     *  7. Dispatch InboundCreated event → triggers WAC recalc + notification
     *
     * @param array $data    Header fields: purchase_order_id, received_date, shipping_cost, notes
     * @param array $items   Array of [{product_id, product_unit_id, quantity_received, total_buy_price, content_per_unit}]
     * @param int   $userId  Receiver user ID
     * @return Inbound
     */
    public function processReceipt(array $data, array $items, int $userId)
    {
        return DB::transaction(function () use ($data, $items, $userId) {
            $po = $this->poRepo->find($data['purchase_order_id']);

            // 1. Validate PO status
            if (!in_array($po->status, ['confirmed', 'partially_received'])) {
                throw ValidationException::withMessages([
                    'purchase_order_id' => 'PO harus berstatus "confirmed" atau "partially_received" untuk menerima barang.',
                ]);
            }

            // 2. Validate qty does not exceed PO (FR-208)
            $this->validateQuantities($po, $items);

            // 3. Generate inbound number
            $locationId = $po->location_id;
            $inboundNumber = Inbound::generateInboundNumber($locationId);

            // 4. Create inbound header
            $inbound = $this->inboundRepo->create([
                'inbound_number'    => $inboundNumber,
                'purchase_order_id' => $po->id,
                'received_by'       => $userId,
                'location_id'       => $locationId,
                'received_date'     => $data['received_date'] ?? now()->toDateString(),
                'shipping_cost'     => $data['shipping_cost'] ?? 0,
                'notes'             => $data['notes'] ?? null,
            ]);

            // 5. Create inbound items with HPP calculation (FR-205)
            $inboundItems = [];
            foreach ($items as $item) {
                $qtyReceived   = (float) $item['quantity_received'];
                $totalBuyPrice = (float) $item['total_buy_price'];
                $contentPerUnit = (int) $item['content_per_unit'];

                // HPP Mentah = total_buy_price / (qty × content)
                $hppRaw = ($qtyReceived * $contentPerUnit) > 0
                    ? $totalBuyPrice / ($qtyReceived * $contentPerUnit)
                    : 0;

                $inboundItems[] = $inbound->items()->create([
                    'product_id'         => $item['product_id'],
                    'product_unit_id'    => $item['product_unit_id'],
                    'quantity_received'  => $qtyReceived,
                    'total_buy_price'    => $totalBuyPrice,
                    'content_per_unit'   => $contentPerUnit,
                    'hpp_raw_calculated' => round($hppRaw, 2),
                ]);
            }

            // 6. Update PO status
            $this->updatePoStatus($po);

            // 7. Dispatch event → WAC recalc + notification
            $inbound->load('items.product', 'items.productUnit');
            event(new InboundCreated($inbound));

            $this->auditService->logAction('create_inbound', $inbound, [
                'po_number'      => $po->po_number,
                'inbound_number' => $inboundNumber,
                'items_count'    => count($items),
            ]);

            return $inbound;
        });
    }

    /**
     * Validate that received quantities don't exceed PO ordered quantities (FR-208).
     */
    protected function validateQuantities(PurchaseOrder $po, array $items): void
    {
        // Get total already received per product for this PO
        $alreadyReceived = [];
        foreach ($po->inbounds as $inbound) {
            foreach ($inbound->items as $existingItem) {
                $key = $existingItem->product_id . '-' . $existingItem->product_unit_id;
                $alreadyReceived[$key] = ($alreadyReceived[$key] ?? 0) + (float) $existingItem->quantity_received;
            }
        }

        // Check each incoming item
        foreach ($items as $item) {
            $poItem = $po->items->first(function ($i) use ($item) {
                return $i->product_id == $item['product_id']
                    && $i->product_unit_id == $item['product_unit_id'];
            });

            if (!$poItem) {
                throw ValidationException::withMessages([
                    'items' => "Produk ID {$item['product_id']} tidak ditemukan di PO ini.",
                ]);
            }

            $key = $item['product_id'] . '-' . $item['product_unit_id'];
            $totalReceived = ($alreadyReceived[$key] ?? 0) + (float) $item['quantity_received'];

            if ($totalReceived > (float) $poItem->quantity_ordered) {
                $productName = $poItem->product->name ?? "ID {$item['product_id']}";
                throw ValidationException::withMessages([
                    'items' => "Jumlah penerimaan untuk \"{$productName}\" ({$totalReceived}) melebihi jumlah pesanan ({$poItem->quantity_ordered}).",
                ]);
            }
        }
    }

    /**
     * Update PO status based on fulfillment.
     * - All items fully received → 'completed'
     * - Some items partially received → 'partially_received'
     */
    protected function updatePoStatus(PurchaseOrder $po): void
    {
        $po->load('items', 'inbounds.items');

        $allFullyReceived = true;

        foreach ($po->items as $poItem) {
            $totalReceived = 0;
            foreach ($po->inbounds as $inbound) {
                foreach ($inbound->items as $inboundItem) {
                    if ($inboundItem->product_id == $poItem->product_id
                        && $inboundItem->product_unit_id == $poItem->product_unit_id) {
                        $totalReceived += (float) $inboundItem->quantity_received;
                    }
                }
            }

            if ($totalReceived < (float) $poItem->quantity_ordered) {
                $allFullyReceived = false;
                break;
            }
        }

        $newStatus = $allFullyReceived ? 'completed' : 'partially_received';
        $po->update(['status' => $newStatus]);
    }
}
