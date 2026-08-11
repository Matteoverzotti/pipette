<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    protected $fillable = [
        'faculty_id',
        'name',
        'slug',
        'year',
        'semester',
        'description',
    ];

    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }

    public function professors(): BelongsToMany
    {
        return $this->belongsToMany(Professor::class)->withTimestamps();
    }

    public function studyPrograms(): BelongsToMany
    {
        return $this->belongsToMany(StudyProgram::class)->withTimestamps();
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    public function visibleFeedback(): HasMany
    {
        return $this->feedback()->whereNull('hidden_at');
    }
}
