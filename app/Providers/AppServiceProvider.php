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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
