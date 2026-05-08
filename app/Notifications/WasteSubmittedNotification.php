<?php

namespace App\Notifications;

use App\Models\WasteRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WasteSubmittedNotification extends Notification
{
    use Queueable;

    public WasteRequest $wasteRequest;

    public function __construct(WasteRequest $wasteRequest)
    {
        $this->wasteRequest = $wasteRequest;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $itemCount = $this->wasteRequest->items->count();
        return [
            'type'           => 'waste_submitted',
            'waste_id'       => $this->wasteRequest->id,
            'request_number' => $this->wasteRequest->request_number,
            'location'       => $this->wasteRequest->location->name ?? '-',
            'requester'      => $this->wasteRequest->requester->name ?? '-',
            'item_count'     => $itemCount,
            'message'        => "Pengajuan waste {$this->wasteRequest->request_number} ({$itemCount} item) dari {$this->wasteRequest->location->name} menunggu approval Anda.",
        ];
    }
}
