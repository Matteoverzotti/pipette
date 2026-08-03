<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModerationEvent;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function ban(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is_admin, 422, 'Administratorii nu pot fi blocați din acest ecran.');

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $user->update([
            'banned_at' => now(),
            'banned_by' => $request->user()->id,
            'ban_reason' => $validated['reason'],
        ]);

        ModerationEvent::create([
            'admin_user_id' => $request->user()->id,
            'target_user_id' => $user->id,
            'action' => 'ban_user',
            'reason' => $validated['reason'],
        ]);

        return back()->with('success', 'Utilizatorul a fost blocat de la contribuții.');
    }

    public function unban(Request $request, User $user): RedirectResponse
    {
        $user->update([
            'banned_at' => null,
            'banned_by' => null,
            'ban_reason' => null,
        ]);

        ModerationEvent::create([
            'admin_user_id' => $request->user()->id,
            'target_user_id' => $user->id,
            'action' => 'unban_user',
        ]);

        return back()->with('success', 'Utilizatorul poate contribui din nou.');
    }
}
