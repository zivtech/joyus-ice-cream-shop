<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantScope
{
    /**
     * Handle an incoming request.
     *
     * Set the tenant_id on the request for downstream use.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->organization_id) {
            $request->merge(['tenant_id' => $request->user()->organization_id]);
            config(['app.tenant_id' => $request->user()->organization_id]);
        }

        return $next($request);
    }
}
