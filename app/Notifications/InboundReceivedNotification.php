<?php

namespace App\Notifications;

use App\Models\Inbound;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InboundReceivedNotification extends Notification
{
    use Queueable;

    protected Inbound $inbound;
    protected array $hppSummary;

    /**
     * @param Inbound $inbound     The inbound receipt
     * @param array   $hppSummary  Summary of HPP changes [{product_name, hpp_raw, old_avg, new_avg}]
     */
    public function __construct(Inbound $inbound, array $hppSummary = [])
    {
        $this->inbound = $inbound;
        $this->hppSummary = $hppSummary;
    }

    /**
     * Store notification in database.
     */
    public function via($notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification for database storage.
     */
    public function toArray($notifiable): array
    {
        $inbound = $this->inbound->load(['purchaseOrder.supplier', 'location', 'receiver']);

        return [
            'type'            => 'inbound_received',
            'inbound_id'      => $inbound->id,
            'inbound_number'  => $inbound->inbound_number,
            'po_number'       => $inbound->purchaseOrder?->po_number,
            'supplier_name'   => $inbound->purchaseOrder?->supplier?->name,
            'location_name'   => $inbound->location?->name,
            'received_by'     => $inbound->receiver?->name,
            'received_date'   => $inbound->received_date->format('d/m/Y'),
            'shipping_cost'   => $inbound->shipping_cost,
            'total_items'     => $inbound->items->count(),
            'hpp_summary'     => $this->hppSummary,
            'message'         => "Barang masuk {$inbound->inbound_number} dari {$inbound->purchaseOrder?->supplier?->name} telah diterima di {$inbound->location?->name}.",
        ];
    }
}
