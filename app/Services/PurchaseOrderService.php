<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Repositories\Contracts\PurchaseOrderRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseOrderService
{
    protected $repository;
    protected $auditService;

    public function __construct(
        PurchaseOrderRepositoryInterface $repository,
        AuditService $auditService
    ) {
        $this->repository = $repository;
        $this->auditService = $auditService;
    }

    /**
     * List POs with optional location/status filter.
     */
    public function getPaginatedPurchaseOrders($locationId = null, $status = null)
    {
        return $this->repository->paginate(10, $locationId, $status);
    }

    /**
     * Find a single PO by ID.
     */
    public function findPurchaseOrder($id)
    {
        return $this->repository->find($id);
    }

    /**
     * Create a new PO (always starts as 'draft').
     * Auto-generates PO number: PO-{STORE_CODE}-YYYYMMDD-XXXX
     *
     * @param array $data       PO header fields (supplier_id, location_id, order_date, notes)
     * @param array $items      Array of item rows [{product_id, product_unit_id, quantity_ordered, estimated_price}]
     * @param int   $userId     ID of the user creating the PO
     */
    public function createPurchaseOrder(array $data, array $items, int $userId)
    {
        return DB::transaction(function () use ($data, $items, $userId) {
            $poNumber = PurchaseOrder::generatePoNumber($data['location_id']);

            $po = $this->repository->create([
                'po_number'   => $poNumber,
                'supplier_id' => $data['supplier_id'],
                'location_id' => $data['location_id'],
                'created_by'  => $userId,
                'order_date'  => $data['order_date'] ?? now()->toDateString(),
                'status'      => 'draft',
                'notes'       => $data['notes'] ?? null,
            ]);

            if (!empty($items)) {
                $this->repository->syncItems($po->id, $items);
            }

            $this->auditService->logAction('create', $po, $data);

            return $po->load(['supplier', 'location', 'creator', 'items.product', 'items.productUnit']);
        });
    }

    /**
     * Update a draft PO. Confirmed POs cannot be edited (FR-203).
     */
    public function updatePurchaseOrder($id, array $data, array $items = [])
    {
        return DB::transaction(function () use ($id, $data, $items) {
            $po = $this->repository->find($id);

            if (!$po->isEditable()) {
                throw ValidationException::withMessages([
                    'status' => 'Purchase Order yang sudah dikonfirmasi tidak dapat diedit.',
                ]);
            }

            $updateData = array_filter([
                'supplier_id' => $data['supplier_id'] ?? null,
                'order_date'  => $data['order_date'] ?? null,
                'notes'       => $data['notes'] ?? null,
            ], fn($v) => $v !== null);

            $po = $this->repository->update($id, $updateData);

            if (!empty($items)) {
                $this->repository->syncItems($po->id, $items);
            }

            $this->auditService->logAction('update', $po, $data);

            return $po->load(['supplier', 'location', 'creator', 'items.product', 'items.productUnit']);
        });
    }

    /**
     * Confirm a draft PO → status becomes 'confirmed'.
     * Once confirmed, items are locked and the PO is ready for inbound receipt.
     */
    public function confirmPurchaseOrder($id)
    {
        return DB::transaction(function () use ($id) {
            $po = $this->repository->find($id);

            if (!$po->isDraft()) {
                throw ValidationException::withMessages([
                    'status' => 'Hanya PO berstatus draft yang dapat dikonfirmasi.',
                ]);
            }

            // Validate: PO must have at least 1 item
            if ($po->items->isEmpty()) {
                throw ValidationException::withMessages([
                    'items' => 'PO harus memiliki minimal 1 item produk sebelum dikonfirmasi.',
                ]);
            }

            $po = $this->repository->update($id, ['status' => 'confirmed']);

            $this->auditService->logAction('confirm', $po, ['status' => 'confirmed']);

            return $po;
        });
    }

    /**
     * Cancel a draft PO → status becomes 'cancelled'.
     */
    public function cancelPurchaseOrder($id)
    {
        return DB::transaction(function () use ($id) {
            $po = $this->repository->find($id);

            if (!$po->isDraft()) {
                throw ValidationException::withMessages([
                    'status' => 'Hanya PO berstatus draft yang dapat dibatalkan.',
                ]);
            }

            $po = $this->repository->update($id, ['status' => 'cancelled']);

            $this->auditService->logAction('cancel', $po, ['status' => 'cancelled']);

            return $po;
        });
    }

    /**
     * Delete a draft PO entirely.
     */
    public function deletePurchaseOrder($id)
    {
        $po = $this->repository->find($id);

        if (!$po->isDraft()) {
            throw ValidationException::withMessages([
                'status' => 'Hanya PO berstatus draft yang dapat dihapus.',
            ]);
        }

        $this->repository->delete($id);
        $this->auditService->logAction('delete', $po, []);
    }
}
