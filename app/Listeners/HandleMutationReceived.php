<?php

namespace App\Listeners;

use App\Events\MutationReceived;
use Illuminate\Support\Facades\Log;

class HandleMutationReceived
{
    /**
     * Handle mutation received: log loss quantities if any.
     * WAC recalc already handled in MutationService::receive().
     */
    public function handle(MutationReceived $event): void
    {
        $mutation = $event->mutation->load('items.product', 'fromLocation', 'toLocation');

        // Log any mutation losses for Owner reporting (FR-605)
        $totalLoss = $mutation->items->sum('loss_quantity');
        if ($totalLoss > 0) {
            Log::warning("Mutation {$mutation->mutation_number} has loss of {$totalLoss} units. " .
                "From: {$mutation->fromLocation->name} → To: {$mutation->toLocation->name}");
        }
    }
}
