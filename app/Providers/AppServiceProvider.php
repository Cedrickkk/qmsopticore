<?php

namespace App\Providers;

use App\Contracts\Repositories\DepartmentRepositoryInterface;
use App\Models\Document;
use App\Repositories\RoleRepository;
use App\Repositories\UserRepository;
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
use App\Services\DocumentPermissionService;
use App\Contracts\Repositories\WorkflowServiceInterface;
use App\Contracts\Repositories\DocumentRepositoryInterface;
use App\Contracts\Repositories\RoleRepositoryInterface;
use App\Contracts\Repositories\SignatureRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Repositories\DepartmentRepository;
use App\Repositories\SignatureRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(DocumentRepositoryInterface::class, DocumentRepository::class);
        $this->app->bind(DepartmentRepositoryInterface::class, DepartmentRepository::class);
        $this->app->bind(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->bind(SignatureRepositoryInterface::class, SignatureRepository::class);
        $this->app->bind(WorkflowServiceInterface::class, WorkflowService::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);

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
