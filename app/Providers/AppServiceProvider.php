<?php

namespace App\Providers;

use App\Models\Document;
use App\Services\PdfService;
use App\Services\FileService;
use App\Services\UserService;
use App\Policies\DocumentPolicy;
use App\Services\WorkflowService;
use App\Services\DocumentService;
use App\Services\DashboardService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use App\Repositories\DocumentRepository;
use App\Contracts\Services\WorkflowServiceInterface;
use App\Services\DocumentPermissionService;
use App\Contracts\Repositories\DocumentRepositoryInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(DocumentRepositoryInterface::class, DocumentRepository::class);
        $this->app->bind(WorkflowServiceInterface::class, WorkflowService::class);

        $this->app->singleton(DocumentService::class);
        $this->app->singleton(DashboardService::class);
        $this->app->singleton(UserService::class);
        $this->app->singleton(FileService::class);
        $this->app->singleton(PdfService::class);
        $this->app->singleton(DocumentPermissionService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Document::class, DocumentPolicy::class);
    }
}
