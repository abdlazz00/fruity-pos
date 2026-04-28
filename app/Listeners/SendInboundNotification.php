<?php

namespace App\Listeners;

use App\Events\InboundCreated;
use App\Models\User;
use App\Models\Inventory;
use App\Notifications\InboundReceivedNotification;

class SendInboundNotification
{
    /**
     * Handle the InboundCreated event.
     *
     * Sends a database notification to all Owner users with HPP delta info.
     */
    public function handle(InboundCreated $event): void
    {
        $inbound = $event->inbound->load(['items.product', 'location']);
        $locationId = $inbound->location_id;

        // Build HPP summary for notification
        $hppSummary = [];
        foreach ($inbound->items as $item) {
            $inventory = Inventory::where('product_id', $item->product_id)
                ->where('location_id', $locationId)
                ->first();

            $hppSummary[] = [
                'product_name' => $item->product?->name ?? '-',
                'hpp_raw'      => (float) $item->hpp_raw_calculated,
                'new_avg_cost' => $inventory ? (float) $inventory->avg_cost : (float) $item->hpp_raw_calculated,
                'new_qty'      => $inventory ? (float) $inventory->quantity : 0,
            ];
        }

        // Notify all Owners (FR-210)
        $owners = User::where('role', 'owner')->where('is_active', true)->get();

        foreach ($owners as $owner) {
            $owner->notify(new InboundReceivedNotification($inbound, $hppSummary));
        }
    }
}
