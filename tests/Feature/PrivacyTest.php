<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrivacyTest extends TestCase
{
    use RefreshDatabase;

    public function test_privacy_page_is_public(): void
    {
        $this->get('/privacy')->assertOk();
    }

    public function test_privacy_page_is_available_to_authenticated_users(): void
    {
        $user = User::factory()->create([
            'email' => 'student@s.unibuc.ro',
        ]);

        $this->actingAs($user)->get('/privacy')->assertOk();
    }
}
