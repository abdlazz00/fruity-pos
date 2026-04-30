<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Database\Eloquent\Builder;

class LocationScope
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();
            
            // Apply global scope only for non-owner roles that have a location_id
            if ($user->role !== \App\Enums\Role::OWNER && $user->location_id) {
                $locationId = $user->location_id;
                
                $applyScope = function (Builder $builder) use ($locationId) {
                    $builder->where('location_id', $locationId);
                };

                // Apply to relevant multi-tenant models
                \App\Models\PurchaseOrder::addGlobalScope('location', $applyScope);
                \App\Models\Inbound::addGlobalScope('location', $applyScope);
                \App\Models\Inventory::addGlobalScope('location', $applyScope);
                \App\Models\User::addGlobalScope('location', $applyScope);
            }
        }
        
        return $next($request);
    }
}
