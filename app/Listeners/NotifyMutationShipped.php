<?php

namespace App\Listeners;

use App\Events\MutationShipped;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use App\Notifications\MutationShippedNotification;

class NotifyMutationShipped
{
    /**
     * Notify the destination location's stockist(s) that a mutation is en route.
     */
    public function handle(MutationShipped $event): void
    {
        $mutation = $event->mutation->load('fromLocation', 'toLocation');

        // Notify stockists at the destination location
        $stockists = User::where('location_id', $mutation->to_location_id)
            ->where('role', 'stockist')
            ->where('is_active', true)
            ->get();

        if ($stockists->isNotEmpty()) {
            Notification::send($stockists, new MutationShippedNotification($mutation));
        }

        Log::info("Notification sent for mutation {$mutation->mutation_number} shipped to location {$mutation->to_location_id}");
    }
}
