<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\FeedbackVote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VoteController extends Controller
{
    public function store(Request $request, Feedback $feedback): RedirectResponse
    {
        abort_unless($feedback->isVisible(), 404);

        $validated = $request->validate([
            'vote' => ['required', Rule::in(['helpful', 'not_helpful'])],
        ]);

        FeedbackVote::updateOrCreate(
            ['feedback_id' => $feedback->id, 'user_id' => $request->user()->id],
            ['value' => $validated['vote'] === 'helpful' ? 1 : -1],
        );

        return back();
    }
}
