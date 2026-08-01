<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCanContribute
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->isBanned()) {
            return back()->withErrors([
                'account' => 'Contul tau poate citi feedback, dar nu mai poate contribui.',
            ]);
        }

        return $next($request);
    }
}
