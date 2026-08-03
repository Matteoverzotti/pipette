<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FeedbackController extends Controller
{
    private const MESSAGES = [
        'pros.min' => 'Dacă scrii plusuri, folosește cel puțin :min caractere.',
        'cons.min' => 'Dacă scrii minusuri, folosește cel puțin :min caractere.',
        'tips.min' => 'Dacă scrii sfaturi, folosește cel puțin :min caractere.',
    ];

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'pros' => ['nullable', 'string', 'min:10', 'max:4000'],
            'cons' => ['nullable', 'string', 'min:10', 'max:4000'],
            'tips' => ['nullable', 'string', 'min:10', 'max:4000'],
        ], self::MESSAGES);

        $this->ensureFeedbackHasContent($validated);

        Course::findOrFail($validated['course_id']);

        Feedback::updateOrCreate(
            ['course_id' => $validated['course_id'], 'user_id' => $request->user()->id],
            [
                'pros' => $validated['pros'] ?? null,
                'cons' => $validated['cons'] ?? null,
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
            'pros' => ['nullable', 'string', 'min:10', 'max:4000'],
            'cons' => ['nullable', 'string', 'min:10', 'max:4000'],
            'tips' => ['nullable', 'string', 'min:10', 'max:4000'],
        ], self::MESSAGES);

        $this->ensureFeedbackHasContent($validated);

        $feedback->update([
            'pros' => $validated['pros'] ?? null,
            'cons' => $validated['cons'] ?? null,
            'tips' => $validated['tips'] ?? null,
        ]);

        return back()->with('success', 'Feedbackul a fost actualizat.');
    }

    public function destroy(Request $request, Feedback $feedback): RedirectResponse
    {
        abort_unless($feedback->user_id === $request->user()->id, 403);

        $feedback->delete();

        return back()->with('success', 'Feedbackul a fost șters.');
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function ensureFeedbackHasContent(array $validated): void
    {
        $hasContent = collect(['pros', 'cons', 'tips'])
            ->contains(fn (string $field): bool => filled($validated[$field] ?? null));

        if (! $hasContent) {
            throw ValidationException::withMessages([
                'pros' => 'Scrie ceva în cel puțin una dintre secțiuni.',
            ]);
        }
    }
}
