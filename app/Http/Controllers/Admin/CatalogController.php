<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Faculty;
use App\Models\Professor;
use App\Models\StudyProgram;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Catalog', [
            'faculties' => Faculty::withCount('courses')->orderBy('name')->get(),
            'professors' => Professor::withCount('courses')->orderBy('name')->get(),
            'studyPrograms' => StudyProgram::with(['faculty:id,name'])
                ->withCount('courses')
                ->orderBy('name')
                ->get(),
            'courses' => Course::with(['faculty:id,name', 'professors:id,name,title', 'studyPrograms:id,faculty_id,name'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function storeFaculty(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:faculties,name'],
        ]);

        Faculty::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']).'-'.Str::lower(Str::random(6)),
        ]);

        return back()->with('success', 'Facultatea a fost adăugată.');
    }

    public function updateFaculty(Request $request, Faculty $faculty): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('faculties', 'name')->ignore($faculty)],
        ]);

        $faculty->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']).'-'.$faculty->id,
        ]);

        return back()->with('success', 'Facultatea a fost actualizată.');
    }

    public function destroyFaculty(Faculty $faculty): RedirectResponse
    {
        $faculty->delete();

        return back()->with('success', 'Facultatea a fost ștearsă.');
    }

    public function storeProfessor(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:professors,name'],
            'title' => ['nullable', 'string', 'max:100'],
        ]);

        Professor::create($validated);

        return back()->with('success', 'Profesorul a fost adăugat.');
    }

    public function updateProfessor(Request $request, Professor $professor): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('professors', 'name')->ignore($professor)],
            'title' => ['nullable', 'string', 'max:100'],
        ]);

        $professor->update($validated);

        return back()->with('success', 'Profesorul a fost actualizat.');
    }

    public function destroyProfessor(Professor $professor): RedirectResponse
    {
        $professor->delete();

        return back()->with('success', 'Profesorul a fost șters.');
    }

    public function storeStudyProgram(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'faculty_id' => ['required', 'integer', 'exists:faculties,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('study_programs', 'name')->where('faculty_id', $request->integer('faculty_id')),
            ],
        ]);

        StudyProgram::create([
            'faculty_id' => $validated['faculty_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']).'-'.Str::lower(Str::random(6)),
        ]);

        return back()->with('success', 'Domeniul de licență a fost adăugat.');
    }

    public function updateStudyProgram(Request $request, StudyProgram $studyProgram): RedirectResponse
    {
        $validated = $request->validate([
            'faculty_id' => ['required', 'integer', 'exists:faculties,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('study_programs', 'name')
                    ->where('faculty_id', $request->integer('faculty_id'))
                    ->ignore($studyProgram),
            ],
        ]);

        $studyProgram->update([
            'faculty_id' => $validated['faculty_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']).'-'.$studyProgram->id,
        ]);

        return back()->with('success', 'Domeniul de licență a fost actualizat.');
    }

    public function destroyStudyProgram(StudyProgram $studyProgram): RedirectResponse
    {
        $studyProgram->delete();

        return back()->with('success', 'Domeniul de licență a fost șters.');
    }

    public function storeCourse(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'faculty_id' => ['required', 'integer', 'exists:faculties,id'],
            'name' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'between:1,3'],
            'semester' => ['required', 'integer', 'between:1,2'],
            'description' => ['nullable', 'string', 'max:3000'],
            'study_program_ids' => ['required', 'array', 'min:1'],
            'study_program_ids.*' => [
                'integer',
                Rule::exists('study_programs', 'id')->where('faculty_id', $request->integer('faculty_id')),
            ],
            'professor_ids' => ['array'],
            'professor_ids.*' => ['integer', 'exists:professors,id'],
            'new_professors' => ['array'],
            'new_professors.*.name' => ['required', 'string', 'max:255'],
            'new_professors.*.title' => ['nullable', 'string', 'max:100'],
        ]);

        $course = Course::create([
            'faculty_id' => $validated['faculty_id'],
            'name' => $validated['name'],
            'year' => $validated['year'],
            'semester' => $validated['semester'],
            'description' => $validated['description'] ?? null,
            'slug' => Str::slug($validated['name']).'-'.Str::lower(Str::random(6)),
        ]);

        $course->professors()->sync($this->professorIdsForCourse($validated));
        $course->studyPrograms()->sync($this->studyProgramIdsForCourse($validated));

        return back()->with('success', 'Cursul a fost adăugat.');
    }

    public function updateCourse(Request $request, Course $course): RedirectResponse
    {
        $validated = $request->validate([
            'faculty_id' => ['required', 'integer', 'exists:faculties,id'],
            'name' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'between:1,3'],
            'semester' => ['required', 'integer', 'between:1,2'],
            'description' => ['nullable', 'string', 'max:3000'],
            'study_program_ids' => ['required', 'array', 'min:1'],
            'study_program_ids.*' => [
                'integer',
                Rule::exists('study_programs', 'id')->where('faculty_id', $request->integer('faculty_id')),
            ],
            'professor_ids' => ['array'],
            'professor_ids.*' => ['integer', 'exists:professors,id'],
            'new_professors' => ['array'],
            'new_professors.*.name' => ['required', 'string', 'max:255'],
            'new_professors.*.title' => ['nullable', 'string', 'max:100'],
        ]);

        $course->update([
            'faculty_id' => $validated['faculty_id'],
            'name' => $validated['name'],
            'year' => $validated['year'],
            'semester' => $validated['semester'],
            'description' => $validated['description'] ?? null,
            'slug' => Str::slug($validated['name']).'-'.$course->id,
        ]);

        $course->professors()->sync($this->professorIdsForCourse($validated));
        $course->studyPrograms()->sync($this->studyProgramIdsForCourse($validated));

        return back()->with('success', 'Cursul a fost actualizat.');
    }

    public function destroyCourse(Course $course): RedirectResponse
    {
        $course->delete();

        return back()->with('success', 'Cursul a fost șters.');
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<int, int>
     */
    private function professorIdsForCourse(array $validated): array
    {
        $professorIds = collect($validated['professor_ids'] ?? []);

        foreach ($validated['new_professors'] ?? [] as $professorData) {
            $name = trim($professorData['name']);
            $title = trim($professorData['title'] ?? '');

            if ($name === '') {
                continue;
            }

            $professor = Professor::firstOrCreate(
                ['name' => $name],
                ['title' => $title !== '' ? $title : null],
            );

            if ($title !== '' && blank($professor->title)) {
                $professor->update(['title' => $title]);
            }

            $professorIds->push($professor->id);
        }

        return $professorIds
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<int, int>
     */
    private function studyProgramIdsForCourse(array $validated): array
    {
        return collect($validated['study_program_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }
}
