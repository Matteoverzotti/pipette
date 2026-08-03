<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Faculty;
use App\Models\Feedback;
use App\Models\Professor;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@unibuc.ro'],
            [
                'name' => 'Admin UniBuc',
                'email_verified_at' => now(),
                'is_admin' => true,
            ],
        );

        $student = User::updateOrCreate(
            ['email' => 'student@s.unibuc.ro'],
            [
                'name' => 'Student Demo',
                'email_verified_at' => now(),
            ],
        );

        $fmi = Faculty::firstOrCreate(
            ['slug' => 'fmi'],
            ['name' => 'Facultatea de Matematică și Informatică'],
        );

        $filosofie = Faculty::firstOrCreate(
            ['slug' => 'filosofie'],
            ['name' => 'Facultatea de Filosofie'],
        );

        $professors = collect([
            ['name' => 'Ioana Popescu', 'title' => 'conf. univ. dr.'],
            ['name' => 'Andrei Ionescu', 'title' => 'lect. univ. dr.'],
            ['name' => 'Mara Dumitrescu', 'title' => 'prof. univ. dr.'],
        ])->map(fn (array $data) => Professor::firstOrCreate(['name' => $data['name']], $data));

        $distributed = Course::firstOrCreate(
            ['slug' => 'sisteme-distribuite'],
            [
                'faculty_id' => $fmi->id,
                'name' => 'Sisteme distribuite',
                'year' => 3,
                'semester' => 1,
                'description' => 'Curs opțional despre arhitecturi distribuite, sincronizare și servicii scalabile.',
            ],
        );

        $ethics = Course::firstOrCreate(
            ['slug' => 'etica-aplicata'],
            [
                'faculty_id' => $filosofie->id,
                'name' => 'Etica aplicata',
                'year' => 2,
                'semester' => 2,
                'description' => 'Discuții și studii de caz despre dileme etice contemporane.',
            ],
        );

        $distributed->professors()->sync([$professors[0]->id, $professors[1]->id]);
        $ethics->professors()->sync([$professors[2]->id]);

        Feedback::firstOrCreate([
            'course_id' => $distributed->id,
            'user_id' => $student->id,
        ], [
            'pros' => 'Seminarele sunt practice și ajută mult la înțelegerea conceptelor.',
            'cons' => 'Proiectul cere lucru constant pe parcursul semestrului.',
            'tips' => 'Alege tema proiectului devreme și testează pe mai multe scenarii.',
        ]);

        $admin->feedback()->firstOrCreate([
            'course_id' => $ethics->id,
        ], [
            'pros' => 'Discuțiile sunt bine ghidate și exemplele sunt actuale.',
            'cons' => 'Trebuie citite textele inainte de seminar ca sa tii pasul.',
            'tips' => 'Notează argumentele pro și contra pentru fiecare studiu de caz.',
        ]);
    }
}
