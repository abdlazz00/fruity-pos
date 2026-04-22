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

    Route::middleware(RoleMiddleware::class . ':owner')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Dashboard');
        })->name('dashboard');

        // Stores
        Route::get('/stores', [\App\Http\Controllers\StoreController::class, 'index'])->name('stores.index');
        Route::get('/stores/create', [\App\Http\Controllers\StoreController::class, 'create'])->name('stores.create');
        Route::post('/stores', [\App\Http\Controllers\StoreController::class, 'store'])->name('stores.store');
        Route::get('/stores/{store}/edit', [\App\Http\Controllers\StoreController::class, 'edit'])->name('stores.edit');
        Route::put('/stores/{store}', [\App\Http\Controllers\StoreController::class, 'update'])->name('stores.update');
        Route::patch('/stores/{store}/toggle', [\App\Http\Controllers\StoreController::class, 'toggle'])->name('stores.toggle');

        // Users
        Route::get('/users', [\App\Http\Controllers\UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [\App\Http\Controllers\UserController::class, 'create'])->name('users.create');
        Route::post('/users', [\App\Http\Controllers\UserController::class, 'store'])->name('users.store');
        Route::get('/users/{user}/edit', [\App\Http\Controllers\UserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [\App\Http\Controllers\UserController::class, 'update'])->name('users.update');
        Route::patch('/users/{user}/toggle', [\App\Http\Controllers\UserController::class, 'toggle'])->name('users.toggle');
    });

    Route::middleware(RoleMiddleware::class . ':owner,stockist')->group(function () {
        // Categories
        Route::get('/master/categories', [\App\Http\Controllers\CategoryController::class, 'index'])->name('categories.index');
        Route::post('/master/categories', [\App\Http\Controllers\CategoryController::class, 'store'])->name('categories.store');
        Route::put('/master/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/master/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'destroy'])->name('categories.destroy');

        // UoM
        Route::get('/master/uoms', [\App\Http\Controllers\UomController::class, 'index'])->name('uoms.index');
        Route::post('/master/uoms', [\App\Http\Controllers\UomController::class, 'store'])->name('uoms.store');
        Route::put('/master/uoms/{uom}', [\App\Http\Controllers\UomController::class, 'update'])->name('uoms.update');
        Route::delete('/master/uoms/{uom}', [\App\Http\Controllers\UomController::class, 'destroy'])->name('uoms.destroy');

        // Suppliers
        Route::get('/master/suppliers', [\App\Http\Controllers\SupplierController::class, 'index'])->name('suppliers.index');
        Route::get('/master/suppliers/create', [\App\Http\Controllers\SupplierController::class, 'create'])->name('suppliers.create');
        Route::post('/master/suppliers', [\App\Http\Controllers\SupplierController::class, 'store'])->name('suppliers.store');
        Route::get('/master/suppliers/{supplier}/edit', [\App\Http\Controllers\SupplierController::class, 'edit'])->name('suppliers.edit');
        Route::put('/master/suppliers/{supplier}', [\App\Http\Controllers\SupplierController::class, 'update'])->name('suppliers.update');
        Route::patch('/master/suppliers/{supplier}/toggle', [\App\Http\Controllers\SupplierController::class, 'toggle'])->name('suppliers.toggle');

        // Products
        Route::get('/master/products', [\App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
        Route::get('/master/products/preview-sku', [\App\Http\Controllers\ProductController::class, 'previewSku'])->name('products.previewSku');
        Route::get('/master/products/create', [\App\Http\Controllers\ProductController::class, 'create'])->name('products.create');
        Route::post('/master/products', [\App\Http\Controllers\ProductController::class, 'store'])->name('products.store');
        Route::get('/master/products/{product}/edit', [\App\Http\Controllers\ProductController::class, 'edit'])->name('products.edit');
        Route::post('/master/products/{product}', [\App\Http\Controllers\ProductController::class, 'update'])->name('products.update'); // POST for multipart/form-data
        Route::patch('/master/products/{product}/toggle', [\App\Http\Controllers\ProductController::class, 'toggle'])->name('products.toggle');
    });

    Route::get('/pos/offline', function () {
        return Inertia::render('Placeholder', ['title' => 'POS Offline']);
    })->middleware(RoleMiddleware::class . ':kasir')->name('pos.offline');

    Route::get('/pos/online', function () {
        return Inertia::render('Placeholder', ['title' => 'POS Online']);
    })->middleware(RoleMiddleware::class . ':admin')->name('pos.online');

});
