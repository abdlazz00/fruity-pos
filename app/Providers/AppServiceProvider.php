<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\Contracts\AuditRepositoryInterface::class,
            \App\Repositories\AuditRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\StoreRepositoryInterface::class,
            \App\Repositories\StoreRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\UserRepositoryInterface::class,
            \App\Repositories\UserRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\CategoryRepositoryInterface::class,
            \App\Repositories\CategoryRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\ProductRepositoryInterface::class,
            \App\Repositories\ProductRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\SupplierRepositoryInterface::class,
            \App\Repositories\SupplierRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\PurchaseOrderRepositoryInterface::class,
            \App\Repositories\PurchaseOrderRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\InboundRepositoryInterface::class,
            \App\Repositories\InboundRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\InventoryRepositoryInterface::class,
            \App\Repositories\InventoryRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\ProductPriceRepositoryInterface::class,
            \App\Repositories\ProductPriceRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\ShiftRepositoryInterface::class,
            \App\Repositories\ShiftRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\TransactionRepositoryInterface::class,
            \App\Repositories\TransactionRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\MutationRepositoryInterface::class,
            \App\Repositories\MutationRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\WasteRepositoryInterface::class,
            \App\Repositories\WasteRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\OpnameRepositoryInterface::class,
            \App\Repositories\OpnameRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\ReorderPointRepositoryInterface::class,
            \App\Repositories\ReorderPointRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
