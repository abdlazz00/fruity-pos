<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LowStockAlert implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $alert;
    public $locationId;

    /**
     * Create a new event instance.
     */
    public function __construct($alert, $locationId)
    {
        $this->alert = $alert;
        $this->locationId = $locationId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Broadcast to a channel specific to the location, and a global owner channel
        return [
            new Channel("alerts.location.{$this->locationId}"),
            new Channel("alerts.owner"),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'low-stock';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'type' => 'low_stock',
            'product_name' => $this->alert['product_name'],
            'location_name' => $this->alert['location_name'],
            'current_stock' => $this->alert['current_stock'],
            'min_qty' => $this->alert['min_qty'],
            'time' => now()->toDateTimeString(),
        ];
    }
}
