<?php

namespace App\Providers;

use App\Models\Document;
use App\Services\UserService;
use App\Policies\DocumentPolicy;
use App\Services\DocumentService;
use App\Services\DashboardService;
use App\Observers\DocumentObserver;
use Illuminate\Support\Facades\Gate;
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
        Gate::policy(Document::class, DocumentPolicy::class);
        Document::observe(DocumentObserver::class);
    }
}
