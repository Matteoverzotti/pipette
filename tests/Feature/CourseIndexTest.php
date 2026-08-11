<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Faculty;
use App\Models\StudyProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CourseIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_query_is_ignored_and_not_exposed_to_the_frontend(): void
    {
        $user = User::factory()->create(['email' => 'student@s.unibuc.ro']);
        $faculty = Faculty::create(['name' => 'FMI', 'slug' => 'fmi']);

        Course::create([
            'faculty_id' => $faculty->id,
            'name' => 'Analiză matematică',
            'slug' => 'analiza-matematica',
            'year' => 1,
            'semester' => 1,
        ]);

        Course::create([
            'faculty_id' => $faculty->id,
            'name' => 'Sisteme distribuite',
            'slug' => 'sisteme-distribuite',
            'year' => 3,
            'semester' => 1,
        ]);

        $this->actingAs($user)
            ->get('/courses?search=negasit')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Courses/Index')
                ->has('courses', 2)
                ->missing('filters.search')
                ->etc()
            );
    }

    public function test_faculty_year_and_semester_filters_still_constrain_courses(): void
    {
        $user = User::factory()->create(['email' => 'student@s.unibuc.ro']);
        $fmi = Faculty::create(['name' => 'FMI', 'slug' => 'fmi']);
        $philosophy = Faculty::create(['name' => 'Filosofie', 'slug' => 'filosofie']);

        Course::create([
            'faculty_id' => $fmi->id,
            'name' => 'Sisteme distribuite',
            'slug' => 'sisteme-distribuite',
            'year' => 3,
            'semester' => 1,
        ]);

        Course::create([
            'faculty_id' => $fmi->id,
            'name' => 'Programare funcțională',
            'slug' => 'programare-functionala',
            'year' => 2,
            'semester' => 1,
        ]);

        Course::create([
            'faculty_id' => $philosophy->id,
            'name' => 'Etica aplicată',
            'slug' => 'etica-aplicata',
            'year' => 3,
            'semester' => 1,
        ]);

        $this->actingAs($user)
            ->get("/courses?faculty_id={$fmi->id}&year=3&semester=1")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Courses/Index')
                ->has('courses', 1)
                ->where('courses.0.name', 'Sisteme distribuite')
                ->where('filters.faculty_id', (string) $fmi->id)
                ->where('filters.year', '3')
                ->where('filters.semester', '1')
                ->etc()
            );
    }

    public function test_study_program_filter_constrains_courses(): void
    {
        $user = User::factory()->create(['email' => 'student@s.unibuc.ro']);
        $faculty = Faculty::create(['name' => 'FMI', 'slug' => 'fmi']);
        $informatics = StudyProgram::create([
            'faculty_id' => $faculty->id,
            'name' => 'Informatică',
            'slug' => 'informatica',
        ]);
        $mathematics = StudyProgram::create([
            'faculty_id' => $faculty->id,
            'name' => 'Matematică',
            'slug' => 'matematica',
        ]);

        $distributed = Course::create([
            'faculty_id' => $faculty->id,
            'name' => 'Sisteme distribuite',
            'slug' => 'sisteme-distribuite',
            'year' => 3,
            'semester' => 1,
        ]);
        $distributed->studyPrograms()->sync([$informatics->id]);

        $analysis = Course::create([
            'faculty_id' => $faculty->id,
            'name' => 'Analiză matematică',
            'slug' => 'analiza-matematica',
            'year' => 1,
            'semester' => 1,
        ]);
        $analysis->studyPrograms()->sync([$mathematics->id]);

        $this->actingAs($user)
            ->get("/courses?study_program_id={$informatics->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Courses/Index')
                ->has('courses', 1)
                ->where('courses.0.name', 'Sisteme distribuite')
                ->where('courses.0.study_programs.0.name', 'Informatică')
                ->where('filters.study_program_id', (string) $informatics->id)
                ->etc()
            );
    }
}
