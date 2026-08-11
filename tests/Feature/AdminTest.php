<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Faculty;
use App\Models\Feedback;
use App\Models\Professor;
use App\Models\StudyProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_catalog(): void
    {
        $admin = User::factory()->create(['email' => 'admin@s.unibuc.ro', 'is_admin' => true]);

        $this->actingAs($admin)->post('/admin/faculties', ['name' => 'Filosofie'])
            ->assertSessionHas('success');
        $faculty = Faculty::where('name', 'Filosofie')->firstOrFail();

        $this->actingAs($admin)->post('/admin/study-programs', [
            'faculty_id' => $faculty->id,
            'name' => 'Filosofie',
        ])->assertSessionHas('success');
        $studyProgram = StudyProgram::where('name', 'Filosofie')->firstOrFail();

        $this->actingAs($admin)->post('/admin/professors', ['name' => 'Dr. Test', 'title' => 'lect. univ.'])
            ->assertSessionHas('success');
        $professorId = Professor::where('name', 'Dr. Test')->value('id');

        $this->actingAs($admin)->post('/admin/courses', [
            'faculty_id' => $faculty->id,
            'name' => 'Etica aplicata',
            'year' => 1,
            'semester' => 2,
            'description' => 'Curs opțional.',
            'study_program_ids' => [$studyProgram->id],
            'professor_ids' => [$professorId],
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('courses', ['name' => 'Etica aplicata']);
        $this->assertDatabaseHas('course_professor', ['professor_id' => $professorId]);
        $this->assertDatabaseHas('course_study_program', ['study_program_id' => $studyProgram->id]);

        $course = Course::where('name', 'Etica aplicata')->firstOrFail();

        $this->actingAs($admin)->post('/admin/study-programs', [
            'faculty_id' => $faculty->id,
            'name' => 'Studii europene',
        ])->assertSessionHas('success');
        $secondStudyProgram = StudyProgram::where('name', 'Studii europene')->firstOrFail();

        $this->actingAs($admin)->put("/admin/courses/{$course->id}", [
            'faculty_id' => $faculty->id,
            'name' => 'Etica aplicata si integritate',
            'year' => 2,
            'semester' => 1,
            'description' => 'Curs actualizat.',
            'study_program_ids' => [$studyProgram->id, $secondStudyProgram->id],
            'professor_ids' => [],
            'new_professors' => [
                ['name' => 'Dr. Nou', 'title' => 'prof. univ.'],
            ],
        ])->assertSessionHas('success');

        $newProfessorId = Professor::where('name', 'Dr. Nou')->value('id');

        $this->assertDatabaseHas('courses', ['id' => $course->id, 'name' => 'Etica aplicata si integritate']);
        $this->assertDatabaseHas('professors', ['name' => 'Dr. Nou', 'title' => 'prof. univ.']);
        $this->assertDatabaseHas('course_professor', ['course_id' => $course->id, 'professor_id' => $newProfessorId]);
        $this->assertDatabaseMissing('course_professor', ['course_id' => $course->id, 'professor_id' => $professorId]);
        $this->assertDatabaseHas('course_study_program', ['course_id' => $course->id, 'study_program_id' => $studyProgram->id]);
        $this->assertDatabaseHas('course_study_program', ['course_id' => $course->id, 'study_program_id' => $secondStudyProgram->id]);
    }

    public function test_course_study_programs_are_required_and_must_belong_to_selected_faculty(): void
    {
        $admin = User::factory()->create(['email' => 'admin@s.unibuc.ro', 'is_admin' => true]);
        $fmi = Faculty::create(['name' => 'FMI', 'slug' => 'fmi']);
        $philosophy = Faculty::create(['name' => 'Filosofie', 'slug' => 'filosofie']);
        $philosophyProgram = StudyProgram::create([
            'faculty_id' => $philosophy->id,
            'name' => 'Filosofie',
            'slug' => 'filosofie-program',
        ]);

        $this->actingAs($admin)->post('/admin/courses', [
            'faculty_id' => $fmi->id,
            'name' => 'Algoritmi',
            'year' => 1,
            'semester' => 1,
            'study_program_ids' => [],
        ])->assertSessionHasErrors('study_program_ids');

        $this->actingAs($admin)->post('/admin/courses', [
            'faculty_id' => $fmi->id,
            'name' => 'Structuri de date',
            'year' => 1,
            'semester' => 2,
            'study_program_ids' => [$philosophyProgram->id],
        ])->assertSessionHasErrors('study_program_ids.0');

        $this->assertDatabaseMissing('courses', ['name' => 'Algoritmi']);
        $this->assertDatabaseMissing('courses', ['name' => 'Structuri de date']);
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
        $admin = User::factory()->create(['email' => 'admin@s.unibuc.ro', 'is_admin' => true]);
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
