<?php

namespace App\Listeners;

use App\Events\WasteSubmitted;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use App\Notifications\WasteSubmittedNotification;

class NotifyWasteSubmitted
{
    /**
     * Notify Owner about the waste request for approval (FR-703).
     */
    public function handle(WasteSubmitted $event): void
    {
        $waste = $event->wasteRequest;

        // Notify all active owners
        $owners = User::where('role', 'owner')
            ->where('is_active', true)
            ->get();

        if ($owners->isNotEmpty()) {
            Notification::send($owners, new WasteSubmittedNotification($waste));
        }

        Log::info("Waste notification sent to Owner for request {$waste->request_number}");
    }
}
