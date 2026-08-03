<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'pros' => ['required', 'string', 'min:10', 'max:4000'],
            'cons' => ['required', 'string', 'min:10', 'max:4000'],
            'tips' => ['nullable', 'string', 'max:4000'],
        ]);

        Course::findOrFail($validated['course_id']);

        Feedback::updateOrCreate(
            ['course_id' => $validated['course_id'], 'user_id' => $request->user()->id],
            [
                'pros' => $validated['pros'],
                'cons' => $validated['cons'],
                'tips' => $validated['tips'] ?? null,
                'hidden_at' => null,
                'hidden_by' => null,
                'hidden_reason' => null,
            ],
        );

        return back()->with('success', 'Feedbackul tău anonim a fost salvat.');
    }

    public function update(Request $request, Feedback $feedback): RedirectResponse
    {
        abort_unless($feedback->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'pros' => ['required', 'string', 'min:10', 'max:4000'],
            'cons' => ['required', 'string', 'min:10', 'max:4000'],
            'tips' => ['nullable', 'string', 'max:4000'],
        ]);

        $feedback->update($validated);

        return back()->with('success', 'Feedbackul a fost actualizat.');
    }

    public function destroy(Request $request, Feedback $feedback): RedirectResponse
    {
        abort_unless($feedback->user_id === $request->user()->id, 403);

        $feedback->delete();

        return back()->with('success', 'Feedbackul a fost șters.');
    }
}
