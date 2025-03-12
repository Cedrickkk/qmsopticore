<?php

namespace App\Providers;

use App\Models\Document;
use App\Services\UserService;
use App\Services\DocumentService;
use App\Services\DashboardService;
use App\Observers\DocumentObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(DocumentService::class);
        $this->app->singleton(DashboardService::class);
        $this->app->singleton(UserService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Document::observe(DocumentObserver::class);
    }
}
