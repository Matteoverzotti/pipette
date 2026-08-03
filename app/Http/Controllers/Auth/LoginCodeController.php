<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\LoginCodeMail;
use App\Models\LoginCode;
use App\Models\User;
use App\Support\UniBucIdentity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginCodeController extends Controller
{
    public function show(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect('/courses');
        }

        return Inertia::render('Auth/Login');
    }

    public function send(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = UniBucIdentity::normalizeEmail($validated['email']);

        if (! UniBucIdentity::hasAllowedDomain($email)) {
            throw ValidationException::withMessages([
                'email' => 'Folosește o adresă instituțională UniBuc.',
            ]);
        }

        $key = 'login-code:'.$email.'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 3)) {
            throw ValidationException::withMessages([
                'email' => 'Ai cerut prea multe coduri. Încearcă din nou mai târziu.',
            ]);
        }

        RateLimiter::hit($key, 300);

        $code = (string) random_int(100000, 999999);
        $minutes = (int) config('unibuc.login_code_minutes', 10);

        LoginCode::where('email', $email)->whereNull('consumed_at')->update([
            'consumed_at' => now(),
        ]);

        LoginCode::create([
            'email' => $email,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes($minutes),
            'sent_ip' => $request->ip(),
        ]);

        Mail::to($email)->send(new LoginCodeMail($code, $minutes));

        return back()->with([
            'status' => 'Ți-am trimis un cod pe email.',
            'pendingEmail' => $email,
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'code' => ['required', 'digits:6'],
        ]);

        $email = UniBucIdentity::normalizeEmail($validated['email']);
        $key = 'verify-code:'.$email.'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw ValidationException::withMessages([
                'code' => 'Prea multe încercări. Cere un cod nou mai târziu.',
            ]);
        }

        $loginCode = LoginCode::active()
            ->where('email', $email)
            ->latest()
            ->first();

        if (! $loginCode || ! Hash::check($validated['code'], $loginCode->code_hash)) {
            RateLimiter::hit($key, 300);

            if ($loginCode) {
                $loginCode->increment('attempts');
            }

            throw ValidationException::withMessages([
                'code' => 'Codul nu este valid sau a expirat.',
            ]);
        }

        RateLimiter::clear($key);

        $loginCode->update(['consumed_at' => now()]);

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => Str::of($email)->before('@')->replace('.', ' ')->title()->toString(),
                'email_verified_at' => now(),
                'is_admin' => UniBucIdentity::isAdminEmail($email),
            ],
        );

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/courses')->with('success', 'Bine ai venit.');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
