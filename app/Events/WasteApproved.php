<?php

namespace App\Events;

use App\Models\WasteRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WasteApproved
{
    use Dispatchable, SerializesModels;

    public WasteRequest $wasteRequest;

    public function __construct(WasteRequest $wasteRequest)
    {
        $this->wasteRequest = $wasteRequest;
    }
}
