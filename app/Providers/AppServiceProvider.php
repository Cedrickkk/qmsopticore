<?php

namespace App\Providers;

use App\Contracts\Repositories\DepartmentRepositoryInterface;
use App\Contracts\Repositories\DocumentRepositoryInterface;
use App\Contracts\Repositories\RoleRepositoryInterface;
use App\Contracts\Repositories\SignatureRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Repositories\WorkflowRepositoryInterface;
use App\Models\Document;
use App\Models\User;
use App\Observers\DocumentObserver;
use App\Observers\UserObserver;
use App\Policies\DocumentPolicy;
use App\Repositories\DepartmentRepository;
use App\Repositories\DocumentRepository;
use App\Repositories\RoleRepository;
use App\Repositories\SignatureRepository;
use App\Repositories\UserRepository;
use App\Repositories\WorkflowRepository;
use App\Services\DashboardService;
use App\Services\DepartmentService;
use App\Services\DocumentService;
use App\Services\FileService;
use App\Services\PdfService;
use App\Services\UserService;
use App\Services\WorkflowService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

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
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(WorkflowRepositoryInterface::class, WorkflowRepository::class);
        $this->app->bind(DepartmentRepositoryInterface::class, DepartmentRepository::class);

        $this->app->singleton(DocumentService::class);
        $this->app->singleton(DashboardService::class);
        $this->app->singleton(UserService::class);
        $this->app->singleton(FileService::class);
        $this->app->singleton(PdfService::class);
        $this->app->singleton(WorkflowService::class);
        $this->app->singleton(DepartmentService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Document::class, DocumentPolicy::class);

        Document::observe(DocumentObserver::class);
        User::observe(UserObserver::class);
    }
}
