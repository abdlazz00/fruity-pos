<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Inertia\Inertia;
use App\Http\Middleware\RoleMiddleware;

Route::get('/', function () {
    return redirect('/login');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password', [AuthController::class, 'sendOtp'])->name('password.email');

    Route::get('/verify-otp', [AuthController::class, 'showVerifyOtp'])->name('password.verify');
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->name('password.verify.post');

    Route::get('/reset-password-form', [AuthController::class, 'showResetPassword'])->name('password.reset.form');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->middleware(RoleMiddleware::class . ':owner')->name('dashboard');

    Route::get('/master/products', function () {
        return Inertia::render('Placeholder', ['title' => 'Master Products']);
    })->middleware(RoleMiddleware::class . ':owner,stockist')->name('master.products');

    Route::get('/pos/offline', function () {
        return Inertia::render('Placeholder', ['title' => 'POS Offline']);
    })->middleware(RoleMiddleware::class . ':kasir')->name('pos.offline');

    Route::get('/pos/online', function () {
        return Inertia::render('Placeholder', ['title' => 'POS Online']);
    })->middleware(RoleMiddleware::class . ':admin')->name('pos.online');

});
