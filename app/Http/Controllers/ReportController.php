<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\FeedbackReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    public function store(Request $request, Feedback $feedback): RedirectResponse
    {
        abort_unless($feedback->isVisible(), 404);

        $validated = $request->validate([
            'reason' => ['required', Rule::in(['abuziv', 'spam', 'date_personale', 'irelevant', 'altceva'])],
            'details' => ['nullable', 'string', 'max:1000'],
        ]);

        FeedbackReport::updateOrCreate(
            ['feedback_id' => $feedback->id, 'user_id' => $request->user()->id],
            [
                'reason' => $validated['reason'],
                'details' => $validated['details'] ?? null,
                'resolved_at' => null,
                'resolved_by' => null,
            ],
        );

        return back()->with('success', 'Raportarea a ajuns la administratori.');
    }
}
