<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\FeedbackReport;
use App\Models\ModerationEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModerationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Moderation', [
            'reports' => FeedbackReport::with([
                'user:id,email,banned_at',
                'feedback' => fn ($query) => $query->withTrashed()->with(['course:id,name', 'user:id,email,banned_at']),
            ])
                ->whereNull('resolved_at')
                ->latest()
                ->get(),
            'feedback' => Feedback::withTrashed()
                ->with(['course:id,name', 'user:id,email,banned_at'])
                ->withCount('reports')
                ->withSum('votes', 'value')
                ->latest()
                ->limit(50)
                ->get(),
        ]);
    }

    public function hide(Request $request, Feedback $feedback): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $feedback->update([
            'hidden_at' => now(),
            'hidden_by' => $request->user()->id,
            'hidden_reason' => $validated['reason'],
        ]);

        $this->log($request, $feedback, 'hide_feedback', $validated['reason']);
        $this->resolveReports($request, $feedback);

        return back()->with('success', 'Feedbackul a fost ascuns.');
    }

    public function restore(Request $request, int $feedback): RedirectResponse
    {
        $feedback = Feedback::withTrashed()->findOrFail($feedback);

        $feedback->restore();
        $feedback->update([
            'hidden_at' => null,
            'hidden_by' => null,
            'hidden_reason' => null,
        ]);

        $this->log($request, $feedback, 'restore_feedback');

        return back()->with('success', 'Feedbackul a fost restaurat.');
    }

    public function destroy(Request $request, Feedback $feedback): RedirectResponse
    {
        $feedback->delete();
        $this->log($request, $feedback, 'delete_feedback');
        $this->resolveReports($request, $feedback);

        return back()->with('success', 'Feedbackul a fost sters.');
    }

    private function resolveReports(Request $request, Feedback $feedback): void
    {
        $feedback->reports()->whereNull('resolved_at')->update([
            'resolved_at' => now(),
            'resolved_by' => $request->user()->id,
        ]);
    }

    private function log(Request $request, Feedback $feedback, string $action, ?string $reason = null): void
    {
        ModerationEvent::create([
            'admin_user_id' => $request->user()->id,
            'target_user_id' => $feedback->user_id,
            'feedback_id' => $feedback->id,
            'action' => $action,
            'reason' => $reason,
        ]);
    }
}
