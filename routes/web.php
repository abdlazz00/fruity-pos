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

    // Force Password Change Routes
    Route::get('/change-password', [AuthController::class, 'showChangePassword'])->name('password.change');
    Route::post('/change-password', [AuthController::class, 'updatePassword'])->name('password.change.post');

    Route::middleware(RoleMiddleware::class . ':owner')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

        // API: KPI data refresh
        Route::get('/api/dashboard/kpi', [\App\Http\Controllers\DashboardController::class, 'kpiApi'])->name('dashboard.kpi');

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

        // Pricing Engine (Sprint 5 — Owner only)
        Route::get('/pricing', [\App\Http\Controllers\PricingController::class, 'index'])->name('pricing.index');
        Route::post('/pricing', [\App\Http\Controllers\PricingController::class, 'store'])->name('pricing.store');
        Route::get('/pricing/{price}', [\App\Http\Controllers\PricingController::class, 'show'])->name('pricing.show');
        Route::put('/pricing/{price}', [\App\Http\Controllers\PricingController::class, 'update'])->name('pricing.update');
        Route::patch('/pricing/{price}/lock', [\App\Http\Controllers\PricingController::class, 'lock'])->name('pricing.lock');
        Route::patch('/pricing/{price}/unlock', [\App\Http\Controllers\PricingController::class, 'unlock'])->name('pricing.unlock');
        Route::put('/pricing/{price}/tiers', [\App\Http\Controllers\PricingController::class, 'syncTiers'])->name('pricing.tiers');
        Route::get('/api/pricing/breakdown/{product}', [\App\Http\Controllers\PricingController::class, 'breakdown'])->name('pricing.breakdown');
        Route::post('/api/pricing/preview', [\App\Http\Controllers\PricingController::class, 'preview'])->name('pricing.preview');

        // ── Reports (Sprint 9 — Owner only) ──
        Route::get('/reports/profit-loss', [\App\Http\Controllers\ReportController::class, 'profitLoss'])->name('reports.profit-loss');
        Route::get('/reports/sales', [\App\Http\Controllers\ReportController::class, 'sales'])->name('reports.sales');
        Route::get('/reports/inventory', [\App\Http\Controllers\ReportController::class, 'inventory'])->name('reports.inventory');
        Route::get('/reports/waste', [\App\Http\Controllers\ReportController::class, 'waste'])->name('reports.waste');
        Route::get('/reports/discounts', [\App\Http\Controllers\ReportController::class, 'discounts'])->name('reports.discounts');
        Route::get('/reports/shipping-costs', [\App\Http\Controllers\ReportController::class, 'shippingCosts'])->name('reports.shipping-costs');
        Route::get('/reports/hpp-comparison', [\App\Http\Controllers\ReportController::class, 'hppComparison'])->name('reports.hpp-comparison');
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

        // Purchase Orders
        Route::get('/procurement/purchase-orders', [\App\Http\Controllers\PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
        Route::get('/procurement/purchase-orders/create', [\App\Http\Controllers\PurchaseOrderController::class, 'create'])->name('purchase-orders.create');
        Route::post('/procurement/purchase-orders', [\App\Http\Controllers\PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
        Route::get('/procurement/purchase-orders/{po}', [\App\Http\Controllers\PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
        Route::get('/procurement/purchase-orders/{po}/edit', [\App\Http\Controllers\PurchaseOrderController::class, 'edit'])->name('purchase-orders.edit');
        Route::put('/procurement/purchase-orders/{po}', [\App\Http\Controllers\PurchaseOrderController::class, 'update'])->name('purchase-orders.update');
        Route::patch('/procurement/purchase-orders/{po}/confirm', [\App\Http\Controllers\PurchaseOrderController::class, 'confirm'])->name('purchase-orders.confirm');
        Route::patch('/procurement/purchase-orders/{po}/cancel', [\App\Http\Controllers\PurchaseOrderController::class, 'cancel'])->name('purchase-orders.cancel');
        Route::delete('/procurement/purchase-orders/{po}', [\App\Http\Controllers\PurchaseOrderController::class, 'destroy'])->name('purchase-orders.destroy');

        // Inbounds
        Route::get('/procurement/inbounds', [\App\Http\Controllers\InboundController::class, 'index'])->name('inbounds.index');
        Route::get('/procurement/inbounds/create', [\App\Http\Controllers\InboundController::class, 'create'])->name('inbounds.create');
        Route::post('/procurement/inbounds', [\App\Http\Controllers\InboundController::class, 'store'])->name('inbounds.store');
        Route::get('/procurement/inbounds/{inbound}', [\App\Http\Controllers\InboundController::class, 'show'])->name('inbounds.show');
    });

    // Notifications API (all authenticated users)
    Route::get('/api/notifications', function (Illuminate\Http\Request $request) {
        return response()->json([
            'notifications' => $request->user()->notifications()->latest()->take(20)->get(),
            'unread_count'  => $request->user()->unreadNotifications()->count(),
        ]);
    })->name('notifications.index');

    // ── Shift Report (all roles, scoped by FR-907 in controller) ──
    Route::get('/reports/shifts', [\App\Http\Controllers\ReportController::class, 'shifts'])->name('reports.shifts');

    Route::post('/api/notifications/mark-read', function (Illuminate\Http\Request $request) {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    })->name('notifications.markRead');
    // ── Shift Management (Kasir + Admin) ──
    Route::middleware(RoleMiddleware::class . ':kasir,admin')->group(function () {
        Route::get('/shift', [\App\Http\Controllers\ShiftController::class, 'index'])->name('shift.index');
        Route::post('/shift/open', [\App\Http\Controllers\ShiftController::class, 'open'])->name('shift.open');
        Route::patch('/shift/{shift}/close', [\App\Http\Controllers\ShiftController::class, 'close'])->name('shift.close');
        Route::get('/shift/{shift}', [\App\Http\Controllers\ShiftController::class, 'show'])->name('shift.show');
    });

    // ── POS Offline (Kasir only) ──
    Route::middleware(RoleMiddleware::class . ':kasir')->group(function () {
        Route::get('/pos/offline', [\App\Http\Controllers\PosOfflineController::class, 'index'])->name('pos.offline');
        Route::post('/pos/offline', [\App\Http\Controllers\PosOfflineController::class, 'store'])->name('pos.offline.store');
        Route::post('/pos/offline/sync', [\App\Http\Controllers\PosOfflineController::class, 'sync'])->name('pos.offline.sync');
    });

    // ── POS Online (Admin only) ──
    Route::middleware(RoleMiddleware::class . ':admin')->group(function () {
        Route::get('/pos/online', [\App\Http\Controllers\PosOnlineController::class, 'index'])->name('pos.online');
        Route::post('/pos/online', [\App\Http\Controllers\PosOnlineController::class, 'store'])->name('pos.online.store');
    });

    // ══════════════════════════════════════════════════════════
    // ── Sprint 8: Mutasi Stok + Waste + Stock Opname ──
    // ══════════════════════════════════════════════════════════

    // ── Laporan Stok Realtime ──
    Route::middleware(RoleMiddleware::class . ':owner,stockist')->group(function () {
        Route::get('/inventory/stocks', [\App\Http\Controllers\InventoryController::class, 'index'])->name('inventory.stocks');
    });

    // ── Mutasi Stok (Stockist create/ship, Stockist destination receive) ──
    Route::middleware(RoleMiddleware::class . ':owner,stockist')->group(function () {
        Route::get('/inventory/mutations', [\App\Http\Controllers\MutationController::class, 'index'])->name('mutations.index');
        Route::get('/inventory/mutations/create', [\App\Http\Controllers\MutationController::class, 'create'])->name('mutations.create');
        Route::post('/inventory/mutations', [\App\Http\Controllers\MutationController::class, 'store'])->name('mutations.store');
        Route::get('/inventory/mutations/{id}', [\App\Http\Controllers\MutationController::class, 'show'])->name('mutations.show');
        Route::patch('/inventory/mutations/{id}/ship', [\App\Http\Controllers\MutationController::class, 'ship'])->name('mutations.ship');
        Route::patch('/inventory/mutations/{id}/receive', [\App\Http\Controllers\MutationController::class, 'receive'])->name('mutations.receive');
        Route::patch('/inventory/mutations/{id}/complete', [\App\Http\Controllers\MutationController::class, 'complete'])->name('mutations.complete');
    });

    // ── Waste Management (Stockist submit, Owner approve/reject) ──
    Route::middleware(RoleMiddleware::class . ':owner,stockist')->group(function () {
        Route::get('/inventory/waste', [\App\Http\Controllers\WasteController::class, 'index'])->name('waste.index');
        Route::get('/inventory/waste/create', [\App\Http\Controllers\WasteController::class, 'create'])->name('waste.create');
        Route::post('/inventory/waste', [\App\Http\Controllers\WasteController::class, 'store'])->name('waste.store');
        Route::get('/inventory/waste/{id}', [\App\Http\Controllers\WasteController::class, 'show'])->name('waste.show');
    });
    Route::middleware(RoleMiddleware::class . ':owner')->group(function () {
        Route::patch('/inventory/waste/{id}/approve', [\App\Http\Controllers\WasteController::class, 'approve'])->name('waste.approve');
        Route::patch('/inventory/waste/{id}/reject', [\App\Http\Controllers\WasteController::class, 'reject'])->name('waste.reject');
    });

    // ── Stock Opname (Stockist conduct, Owner approve) ──
    Route::middleware(RoleMiddleware::class . ':owner,stockist')->group(function () {
        Route::get('/inventory/opname', [\App\Http\Controllers\OpnameController::class, 'index'])->name('opname.index');
        Route::post('/inventory/opname/start', [\App\Http\Controllers\OpnameController::class, 'start'])->name('opname.start');
        Route::get('/inventory/opname/{id}', [\App\Http\Controllers\OpnameController::class, 'show'])->name('opname.show');
        Route::put('/inventory/opname/{id}/counts', [\App\Http\Controllers\OpnameController::class, 'updateCounts'])->name('opname.updateCounts');
        Route::patch('/inventory/opname/{id}/submit', [\App\Http\Controllers\OpnameController::class, 'submit'])->name('opname.submit');
    });
    Route::middleware(RoleMiddleware::class . ':owner')->group(function () {
        Route::patch('/inventory/opname/{id}/approve', [\App\Http\Controllers\OpnameController::class, 'approve'])->name('opname.approve');
    });

    // ══════════════════════════════════════════════════════════
    // ── Sprint 9: Reorder Point (FR-1207 s/d FR-1215) ──
    // ══════════════════════════════════════════════════════════

    Route::middleware(RoleMiddleware::class . ':owner,stockist')->group(function () {
        Route::get('/inventory/reorder-points', [\App\Http\Controllers\ReorderPointController::class, 'index'])->name('reorder-points.index');
        Route::get('/inventory/reorder-points/create', [\App\Http\Controllers\ReorderPointController::class, 'create'])->name('reorder-points.create');
        Route::post('/inventory/reorder-points', [\App\Http\Controllers\ReorderPointController::class, 'store'])->name('reorder-points.store');
        Route::put('/inventory/reorder-points/{id}', [\App\Http\Controllers\ReorderPointController::class, 'update'])->name('reorder-points.update');
        Route::patch('/inventory/reorder-points/{id}/toggle', [\App\Http\Controllers\ReorderPointController::class, 'toggle'])->name('reorder-points.toggle');
        Route::delete('/inventory/reorder-points/{id}', [\App\Http\Controllers\ReorderPointController::class, 'destroy'])->name('reorder-points.destroy');
    });

    // ── API: Low Stock Alerts (Dashboard FR-1213) ──
    Route::get('/api/reorder-points/low-stock', [\App\Http\Controllers\ReorderPointController::class, 'lowStockAlerts'])->name('reorder-points.low-stock');

});
