<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Faculty;
use App\Models\Feedback;
use App\Models\Professor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_catalog(): void
    {
        $admin = User::factory()->create(['email' => 'admin@unibuc.ro', 'is_admin' => true]);

        $this->actingAs($admin)->post('/admin/faculties', ['name' => 'Filosofie'])
            ->assertSessionHas('success');
        $faculty = Faculty::where('name', 'Filosofie')->firstOrFail();

        $this->actingAs($admin)->post('/admin/professors', ['name' => 'Dr. Test', 'title' => 'lect. univ.'])
            ->assertSessionHas('success');
        $professorId = Professor::where('name', 'Dr. Test')->value('id');

        $this->actingAs($admin)->post('/admin/courses', [
            'faculty_id' => $faculty->id,
            'name' => 'Etica aplicata',
            'year' => 1,
            'semester' => 2,
            'description' => 'Curs optional.',
            'professor_ids' => [$professorId],
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('courses', ['name' => 'Etica aplicata']);
        $this->assertDatabaseHas('course_professor', ['professor_id' => $professorId]);
    }

    public function test_admin_can_moderate_feedback_and_ban_users(): void
    {
        [$admin, $feedback, $author] = $this->moderationFixture();

        $this->actingAs($admin)->patch("/admin/feedback/{$feedback->id}/hide", [
            'reason' => 'Limbaj abuziv.',
        ])->assertSessionHas('success');

        $this->assertNotNull($feedback->fresh()->hidden_at);

        $this->actingAs($admin)->patch("/admin/feedback/{$feedback->id}/restore")
            ->assertSessionHas('success');

        $this->assertNull($feedback->fresh()->hidden_at);

        $this->actingAs($admin)->patch("/admin/users/{$author->id}/ban", [
            'reason' => 'Abuz repetat.',
        ])->assertSessionHas('success');

        $this->assertNotNull($author->fresh()->banned_at);

        $this->actingAs($admin)->patch("/admin/users/{$author->id}/unban")
            ->assertSessionHas('success');

        $this->assertNull($author->fresh()->banned_at);
        $this->assertDatabaseHas('moderation_events', ['action' => 'ban_user']);
    }

    private function moderationFixture(): array
    {
        $admin = User::factory()->create(['email' => 'admin@unibuc.ro', 'is_admin' => true]);
        $author = User::factory()->create(['email' => 'student@s.unibuc.ro']);
        $faculty = Faculty::create(['name' => 'Istorie', 'slug' => 'istorie']);
        $course = Course::create([
            'faculty_id' => $faculty->id,
            'name' => 'Istorie urbana',
            'slug' => 'istorie-urbana',
            'year' => 2,
            'semester' => 1,
        ]);
        $feedback = Feedback::create([
            'course_id' => $course->id,
            'user_id' => $author->id,
            'pros' => 'Cursul are studii de caz bune.',
            'cons' => 'Bibliografia este mare.',
            'tips' => 'Pregateste seminarul din timp.',
        ]);

        return [$admin, $feedback, $author];
    }
}
