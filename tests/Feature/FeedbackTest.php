<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Faculty;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_has_one_editable_feedback_per_course(): void
    {
        $user = User::factory()->create(['email' => 'student@s.unibuc.ro']);
        $course = $this->course();

        $this->actingAs($user)->post('/feedback', [
            'course_id' => $course->id,
            'pros' => 'Profesorii explică foarte clar materia.',
            'cons' => 'Temele pot deveni aglomerate spre final.',
            'tips' => 'Incepe proiectul devreme.',
        ]);

        $this->actingAs($user)->post('/feedback', [
            'course_id' => $course->id,
            'pros' => 'Seminarele ajută mult dacă mergi constant.',
            'cons' => 'Este nevoie de lucru saptamanal.',
            'tips' => 'Pastreaza notitele organizate.',
        ]);

        $this->assertDatabaseCount('feedback', 1);
        $this->assertDatabaseHas('feedback', [
            'course_id' => $course->id,
            'user_id' => $user->id,
            'pros' => 'Seminarele ajută mult dacă mergi constant.',
        ]);
    }

    public function test_feedback_can_use_any_one_text_section(): void
    {
        $user = User::factory()->create(['email' => 'student@s.unibuc.ro']);
        $course = $this->course();

        $this->actingAs($user)->post('/feedback', [
            'course_id' => $course->id,
            'pros' => '',
            'cons' => '',
            'tips' => 'Mergi la laboratoare și începe proiectul din prima săptămână.',
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('feedback', [
            'course_id' => $course->id,
            'user_id' => $user->id,
            'pros' => null,
            'cons' => null,
            'tips' => 'Mergi la laboratoare și începe proiectul din prima săptămână.',
        ]);
    }

    public function test_feedback_requires_at_least_one_text_section(): void
    {
        $user = User::factory()->create(['email' => 'student@s.unibuc.ro']);
        $course = $this->course();

        $this->actingAs($user)->post('/feedback', [
            'course_id' => $course->id,
            'pros' => '',
            'cons' => '',
            'tips' => '',
        ])->assertSessionHasErrors('pros');

        $this->assertDatabaseMissing('feedback', [
            'course_id' => $course->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_feedback_is_anonymous_to_students_but_visible_to_admins(): void
    {
        $course = $this->course();
        $author = User::factory()->create(['email' => 'author@s.unibuc.ro']);
        $student = User::factory()->create(['email' => 'reader@s.unibuc.ro']);
        $admin = User::factory()->create(['email' => 'admin@s.unibuc.ro', 'is_admin' => true]);

        Feedback::create([
            'course_id' => $course->id,
            'user_id' => $author->id,
            'pros' => 'Cursul are exemple bune și ritm clar.',
            'cons' => 'Examenul cere atentie la detalii.',
            'tips' => 'Citeste bibliografia din timp.',
        ]);

        $this->actingAs($student)->get("/courses/{$course->id}")
            ->assertOk()
            ->assertDontSee('author@s.unibuc.ro');

        $this->actingAs($admin)->get("/courses/{$course->id}")
            ->assertOk()
            ->assertSee('author@s.unibuc.ro');
    }

    public function test_banned_users_cannot_contribute(): void
    {
        $user = User::factory()->create([
            'email' => 'banned@s.unibuc.ro',
            'banned_at' => now(),
        ]);
        $course = $this->course();

        $this->actingAs($user)->post('/feedback', [
            'course_id' => $course->id,
            'pros' => 'Acest text ar trebui blocat.',
            'cons' => 'Acest text ar trebui blocat.',
        ])->assertSessionHasErrors('account');

        $this->assertDatabaseCount('feedback', 0);
    }

    private function course(): Course
    {
        $faculty = Faculty::create(['name' => 'Matematică și Informatică', 'slug' => 'fmi']);

        return Course::create([
            'faculty_id' => $faculty->id,
            'name' => 'Sisteme distribuite',
            'slug' => 'sisteme-distribuite',
            'year' => 3,
            'semester' => 1,
        ]);
    }
}
