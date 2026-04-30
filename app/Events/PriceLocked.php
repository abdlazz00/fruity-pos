<?php

namespace App\Events;

use App\Models\ProductPrice;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event dispatched when a product price is locked (S5-B10).
 *
 * Implements ShouldBroadcast so that POS terminals receive
 * real-time price updates via Laravel Echo / WebSockets.
 */
class PriceLocked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ProductPrice $productPrice;

    public function __construct(ProductPrice $productPrice)
    {
        $this->productPrice = $productPrice->load('product');
    }

    /**
     * Broadcast on a public channel that all POS terminals listen to.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('pricing'),
        ];
    }

    /**
     * Data sent to the frontend via broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'product_id'    => $this->productPrice->product_id,
            'product_name'  => $this->productPrice->product?->name,
            'selling_price' => (float) $this->productPrice->selling_price,
            'status'        => $this->productPrice->status,
            'locked_at'     => $this->productPrice->locked_at?->toDateTimeString(),
        ];
    }
}
