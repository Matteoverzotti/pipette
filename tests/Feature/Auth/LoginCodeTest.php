<?php

namespace Tests\Feature\Auth;

use App\Mail\LoginCodeMail;
use App\Models\LoginCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class LoginCodeTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_rejects_non_unibuc_domains(): void
    {
        Mail::fake();

        $this->post('/login/code', ['email' => 'student@example.com'])
            ->assertSessionHasErrors('email');

        Mail::assertNothingSent();
    }

    public function test_it_sends_and_verifies_a_login_code(): void
    {
        Mail::fake();

        $this->post('/login/code', ['email' => 'student@s.unibuc.ro'])
            ->assertSessionHas('status');

        $code = null;
        Mail::assertSent(LoginCodeMail::class, function (LoginCodeMail $mail) use (&$code) {
            $code = $mail->code;

            return $mail->hasTo('student@s.unibuc.ro') && preg_match('/^\d{6}$/', $mail->code) === 1;
        });

        $this->post('/login/verify', ['email' => 'student@s.unibuc.ro', 'code' => $code])
            ->assertRedirect('/courses');

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'student@s.unibuc.ro',
            'is_admin' => false,
        ]);
    }

    public function test_it_rejects_expired_or_wrong_codes(): void
    {
        LoginCode::create([
            'email' => 'student@unibuc.ro',
            'code_hash' => Hash::make('123456'),
            'expires_at' => now()->subMinute(),
        ]);

        $this->post('/login/verify', ['email' => 'student@unibuc.ro', 'code' => '123456'])
            ->assertSessionHasErrors('code');

        LoginCode::create([
            'email' => 'student@unibuc.ro',
            'code_hash' => Hash::make('654321'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->post('/login/verify', ['email' => 'student@unibuc.ro', 'code' => '000000'])
            ->assertSessionHasErrors('code');
    }

    public function test_it_rate_limits_code_resends(): void
    {
        Mail::fake();

        foreach (range(1, 3) as $_) {
            $this->post('/login/code', ['email' => 'limited@s.unibuc.ro']);
        }

        $this->post('/login/code', ['email' => 'limited@s.unibuc.ro'])
            ->assertSessionHasErrors('email');
    }

    public function test_it_assigns_admin_role_from_allowlist(): void
    {
        Mail::fake();

        $this->post('/login/code', ['email' => 'admin@unibuc.ro']);

        $code = null;
        Mail::assertSent(LoginCodeMail::class, function (LoginCodeMail $mail) use (&$code) {
            $code = $mail->code;

            return true;
        });

        $this->post('/login/verify', ['email' => 'admin@unibuc.ro', 'code' => $code]);

        $this->assertTrue(User::where('email', 'admin@unibuc.ro')->firstOrFail()->is_admin);
    }
}
