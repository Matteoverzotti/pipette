<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Faculty;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VotingReportingTest extends TestCase
{
    use RefreshDatabase;

    public function test_votes_are_one_per_user_and_can_change(): void
    {
        [$feedback, $voter] = $this->feedbackFixture();

        $this->actingAs($voter)->post("/feedback/{$feedback->id}/votes", ['vote' => 'helpful']);
        $this->actingAs($voter)->post("/feedback/{$feedback->id}/votes", ['vote' => 'not_helpful']);

        $this->assertDatabaseCount('feedback_votes', 1);
        $this->assertDatabaseHas('feedback_votes', [
            'feedback_id' => $feedback->id,
            'user_id' => $voter->id,
            'value' => -1,
        ]);
    }

    public function test_reports_enter_admin_queue(): void
    {
        [$feedback, $reporter] = $this->feedbackFixture();

        $this->actingAs($reporter)->post("/feedback/{$feedback->id}/reports", [
            'reason' => 'spam',
            'details' => 'Pare copiat de mai multe ori.',
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('feedback_reports', [
            'feedback_id' => $feedback->id,
            'user_id' => $reporter->id,
            'reason' => 'spam',
        ]);
    }

    public function test_banned_users_cannot_vote_or_report(): void
    {
        [$feedback] = $this->feedbackFixture();
        $banned = User::factory()->create([
            'email' => 'blocked@s.unibuc.ro',
            'banned_at' => now(),
        ]);

        $this->actingAs($banned)->post("/feedback/{$feedback->id}/votes", ['vote' => 'helpful'])
            ->assertSessionHasErrors('account');
        $this->actingAs($banned)->post("/feedback/{$feedback->id}/reports", ['reason' => 'spam'])
            ->assertSessionHasErrors('account');

        $this->assertDatabaseCount('feedback_votes', 0);
        $this->assertDatabaseCount('feedback_reports', 0);
    }

    private function feedbackFixture(): array
    {
        $faculty = Faculty::create(['name' => 'Litere', 'slug' => 'litere']);
        $course = Course::create([
            'faculty_id' => $faculty->id,
            'name' => 'Retorica',
            'slug' => 'retorica',
            'year' => 2,
            'semester' => 2,
        ]);
        $author = User::factory()->create(['email' => 'author@s.unibuc.ro']);
        $voter = User::factory()->create(['email' => 'voter@s.unibuc.ro']);
        $feedback = Feedback::create([
            'course_id' => $course->id,
            'user_id' => $author->id,
            'pros' => 'Seminarele sunt foarte utile.',
            'cons' => 'Lecturile sunt multe.',
            'tips' => 'Fa rezumate dupa fiecare curs.',
        ]);

        return [$feedback, $voter];
    }
}
