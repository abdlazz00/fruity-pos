<?php

namespace App\Events;

use App\Models\Inbound;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InboundCreated
{
    use Dispatchable, SerializesModels;

    public Inbound $inbound;

    /**
     * Create a new event instance.
     */
    public function __construct(Inbound $inbound)
    {
        $this->inbound = $inbound;
    }
}
