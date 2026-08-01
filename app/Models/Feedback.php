<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Feedback extends Model
{
    use SoftDeletes;

    protected $table = 'feedback';

    protected $fillable = [
        'course_id',
        'user_id',
        'pros',
        'cons',
        'tips',
        'hidden_at',
        'hidden_by',
        'hidden_reason',
    ];

    protected $appends = ['score'];

    protected function casts(): array
    {
        return [
            'hidden_at' => 'datetime',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(FeedbackVote::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(FeedbackReport::class);
    }

    public function getScoreAttribute(): int
    {
        return (int) ($this->votes_sum_value ?? $this->votes()->sum('value'));
    }

    public function isVisible(): bool
    {
        return $this->hidden_at === null && $this->deleted_at === null;
    }
}
