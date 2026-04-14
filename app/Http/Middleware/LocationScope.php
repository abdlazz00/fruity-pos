<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LocationScope
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // TODO: In subsequent sprints, register Eloquent global scope here 
        // to filter by auth()->user()->location_id for non-owner roles.
        
        return $next($request);
    }
}
