<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

/**
 * Notification: HPP Baseline Changed (S5-B14 / FR-310).
 *
 * Sent to all Owner users when an inbound causes the hpp_baseline
 * to change for one or more products. Includes delta information.
 *
 * Implements ShouldQueue so notification DB write does not block
 * the inbound receipt HTTP response.
 */
class HppBaselineChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries   = 3;
    public int $backoff = 5;

    protected array $deltas;

    /**
     * @param array $deltas [{product_id, product_name, old_baseline, new_baseline, delta}]
     */
    public function __construct(array $deltas)
    {
        $this->deltas = $deltas;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $productNames = collect($this->deltas)->pluck('product_name')->join(', ');

        return [
            'type'     => 'hpp_baseline_changed',
            'message'  => "HPP Baseline berubah untuk: {$productNames}. Periksa Pricing Engine untuk menyesuaikan margin.",
            'products' => $this->deltas,
            'count'    => count($this->deltas),
        ];
    }
}
