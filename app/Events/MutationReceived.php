<?php

namespace App\Events;

use App\Models\StockMutation;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MutationReceived
{
    use Dispatchable, SerializesModels;

    public StockMutation $mutation;

    public function __construct(StockMutation $mutation)
    {
        $this->mutation = $mutation;
    }
}
