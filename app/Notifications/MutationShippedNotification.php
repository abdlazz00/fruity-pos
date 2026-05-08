<?php

namespace App\Notifications;

use App\Models\StockMutation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MutationShippedNotification extends Notification
{
    use Queueable;

    public StockMutation $mutation;

    public function __construct(StockMutation $mutation)
    {
        $this->mutation = $mutation;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type'            => 'mutation_shipped',
            'mutation_id'     => $this->mutation->id,
            'mutation_number' => $this->mutation->mutation_number,
            'from_location'   => $this->mutation->fromLocation->name ?? '-',
            'message'         => "Mutasi {$this->mutation->mutation_number} telah dikirim dari {$this->mutation->fromLocation->name}. Silakan cek dan konfirmasi penerimaan.",
        ];
    }
}
