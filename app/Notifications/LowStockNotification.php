<?php

namespace App\Notifications;

use App\Models\ReorderPoint;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Notification: Low Stock Alert (FR-1212, FR-1213)
 *
 * Sent to Stockists of the affected location and all Owners
 * when a product's stock falls below its configured reorder point.
 */
class LowStockNotification extends Notification
{
    use Queueable;

    public ReorderPoint $reorderPoint;
    public float $currentStock;

    public function __construct(ReorderPoint $reorderPoint, float $currentStock)
    {
        $this->reorderPoint = $reorderPoint;
        $this->currentStock = $currentStock;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $productName  = $this->reorderPoint->product->name ?? '-';
        $locationName = $this->reorderPoint->location->name ?? '-';
        $minQty       = $this->reorderPoint->min_quantity;

        return [
            'type'          => 'low_stock_alert',
            'product_id'    => $this->reorderPoint->product_id,
            'product_name'  => $productName,
            'location_id'   => $this->reorderPoint->location_id,
            'location_name' => $locationName,
            'current_stock' => $this->currentStock,
            'min_quantity'   => $minQty,
            'message'       => "Stok {$productName} di {$locationName} tinggal {$this->currentStock} (min: {$minQty}). Segera lakukan pengadaan!",
        ];
    }
}
