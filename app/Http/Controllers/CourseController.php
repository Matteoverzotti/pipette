<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'faculty_id' => ['nullable', 'integer', 'exists:faculties,id'],
            'year' => ['nullable', 'integer', 'between:1,3'],
            'semester' => ['nullable', 'integer', 'between:1,2'],
        ]);

        $courses = Course::query()
            ->with(['faculty:id,name', 'professors:id,name,title'])
            ->withCount(['visibleFeedback as feedback_count'])
            ->when($filters['faculty_id'] ?? null, fn ($query, $facultyId) => $query->where('faculty_id', $facultyId))
            ->when($filters['year'] ?? null, fn ($query, $year) => $query->where('year', $year))
            ->when($filters['semester'] ?? null, fn ($query, $semester) => $query->where('semester', $semester))
            ->orderBy('name')
            ->get();

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'faculties' => Faculty::orderBy('name')->get(['id', 'name']),
            'filters' => $filters,
        ]);
    }

    public function show(Request $request, Course $course): Response
    {
        $course->load(['faculty:id,name', 'professors:id,name,title']);

        $feedback = $course->visibleFeedback()
            ->withSum('votes', 'value')
            ->with(['votes' => fn ($query) => $query->where('user_id', $request->user()->id)])
            ->when($request->user()->is_admin, fn ($query) => $query->with('user:id,email,banned_at'))
            ->orderByDesc('votes_sum_value')
            ->latest()
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'pros' => $item->pros,
                'cons' => $item->cons,
                'tips' => $item->tips,
                'score' => $item->score,
                'created_at' => $item->created_at->diffForHumans(),
                'can_edit' => $item->user_id === $request->user()->id,
                'user_vote' => $item->votes->first()?->value,
                'author' => $request->user()->is_admin ? [
                    'email' => $item->user?->email,
                    'is_banned' => $item->user?->isBanned(),
                ] : null,
            ]);

        $ownFeedback = $course->feedback()
            ->where('user_id', $request->user()->id)
            ->first();

        return Inertia::render('Courses/Show', [
            'course' => $course,
            'feedback' => $feedback,
            'ownFeedback' => $ownFeedback ? [
                'id' => $ownFeedback->id,
                'pros' => $ownFeedback->pros,
                'cons' => $ownFeedback->cons,
                'tips' => $ownFeedback->tips,
                'hidden_at' => $ownFeedback->hidden_at,
            ] : null,
        ]);
    }
}
