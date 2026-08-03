<?php

use App\Http\Controllers\Admin\CatalogController;
use App\Http\Controllers\Admin\ModerationController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginCodeController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\VoteController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/courses');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [LoginCodeController::class, 'show'])->name('login');
    Route::post('/login/code', [LoginCodeController::class, 'send'])->name('login.code');
    Route::post('/login/verify', [LoginCodeController::class, 'verify'])->name('login.verify');
});

Route::post('/logout', [LoginCodeController::class, 'logout'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function (): void {
    Route::get('/rules', fn () => Inertia::render('Rules'))->name('rules');
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');

    Route::middleware('contributor')->group(function (): void {
        Route::post('/feedback', [FeedbackController::class, 'store'])->name('feedback.store');
        Route::put('/feedback/{feedback}', [FeedbackController::class, 'update'])->name('feedback.update');
        Route::delete('/feedback/{feedback}', [FeedbackController::class, 'destroy'])->name('feedback.destroy');
        Route::post('/feedback/{feedback}/votes', [VoteController::class, 'store'])->name('feedback.votes.store');
        Route::post('/feedback/{feedback}/reports', [ReportController::class, 'store'])->name('feedback.reports.store');
    });

    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function (): void {
        Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');
        Route::post('/faculties', [CatalogController::class, 'storeFaculty'])->name('faculties.store');
        Route::put('/faculties/{faculty}', [CatalogController::class, 'updateFaculty'])->name('faculties.update');
        Route::delete('/faculties/{faculty}', [CatalogController::class, 'destroyFaculty'])->name('faculties.destroy');
        Route::post('/professors', [CatalogController::class, 'storeProfessor'])->name('professors.store');
        Route::put('/professors/{professor}', [CatalogController::class, 'updateProfessor'])->name('professors.update');
        Route::delete('/professors/{professor}', [CatalogController::class, 'destroyProfessor'])->name('professors.destroy');
        Route::post('/courses', [CatalogController::class, 'storeCourse'])->name('courses.store');
        Route::put('/courses/{course}', [CatalogController::class, 'updateCourse'])->name('courses.update');
        Route::delete('/courses/{course}', [CatalogController::class, 'destroyCourse'])->name('courses.destroy');

        Route::get('/moderation', [ModerationController::class, 'index'])->name('moderation.index');
        Route::patch('/feedback/{feedback}/hide', [ModerationController::class, 'hide'])->name('feedback.hide');
        Route::patch('/feedback/{feedback}/restore', [ModerationController::class, 'restore'])->name('feedback.restore');
        Route::delete('/feedback/{feedback}', [ModerationController::class, 'destroy'])->name('feedback.destroy');
        Route::patch('/users/{user}/ban', [UserController::class, 'ban'])->name('users.ban');
        Route::patch('/users/{user}/unban', [UserController::class, 'unban'])->name('users.unban');
    });
});
