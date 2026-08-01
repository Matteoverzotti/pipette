<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Faculty;
use App\Models\Professor;
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
            'courses' => Course::with(['faculty:id,name', 'professors:id,name,title'])
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

        return back()->with('success', 'Facultatea a fost adaugata.');
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

        return back()->with('success', 'Facultatea a fost actualizata.');
    }

    public function destroyFaculty(Faculty $faculty): RedirectResponse
    {
        $faculty->delete();

        return back()->with('success', 'Facultatea a fost stearsa.');
    }

    public function storeProfessor(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:professors,name'],
            'title' => ['nullable', 'string', 'max:100'],
        ]);

        Professor::create($validated);

        return back()->with('success', 'Profesorul a fost adaugat.');
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

        return back()->with('success', 'Profesorul a fost sters.');
    }

    public function storeCourse(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'faculty_id' => ['required', 'integer', 'exists:faculties,id'],
            'name' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'between:1,6'],
            'semester' => ['required', 'integer', 'between:1,2'],
            'description' => ['nullable', 'string', 'max:3000'],
            'professor_ids' => ['array'],
            'professor_ids.*' => ['integer', 'exists:professors,id'],
        ]);

        $course = Course::create([
            'faculty_id' => $validated['faculty_id'],
            'name' => $validated['name'],
            'year' => $validated['year'],
            'semester' => $validated['semester'],
            'description' => $validated['description'] ?? null,
            'slug' => Str::slug($validated['name']).'-'.Str::lower(Str::random(6)),
        ]);

        $course->professors()->sync($validated['professor_ids'] ?? []);

        return back()->with('success', 'Cursul a fost adaugat.');
    }

    public function updateCourse(Request $request, Course $course): RedirectResponse
    {
        $validated = $request->validate([
            'faculty_id' => ['required', 'integer', 'exists:faculties,id'],
            'name' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'between:1,6'],
            'semester' => ['required', 'integer', 'between:1,2'],
            'description' => ['nullable', 'string', 'max:3000'],
            'professor_ids' => ['array'],
            'professor_ids.*' => ['integer', 'exists:professors,id'],
        ]);

        $course->update([
            'faculty_id' => $validated['faculty_id'],
            'name' => $validated['name'],
            'year' => $validated['year'],
            'semester' => $validated['semester'],
            'description' => $validated['description'] ?? null,
            'slug' => Str::slug($validated['name']).'-'.$course->id,
        ]);

        $course->professors()->sync($validated['professor_ids'] ?? []);

        return back()->with('success', 'Cursul a fost actualizat.');
    }

    public function destroyCourse(Course $course): RedirectResponse
    {
        $course->delete();

        return back()->with('success', 'Cursul a fost sters.');
    }
}
