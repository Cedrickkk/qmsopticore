<?php

namespace App\Observers;

use App\Models\User;
use App\Services\ActivityLogService;

class UserObserver
{
    public function __construct(
        private readonly ActivityLogService $activityLogService
    ) {}

    public function created(User $user): void
    {
        $this->activityLogService->logUser(
            action: 'created',
            targetUser: $user
        );
    }

    public function updated(User $user): void
    {
        $this->activityLogService->logUser(
            action: 'updated',
            targetUser: $user,
            oldValues: $user->getOriginal(),
            newValues: $user->getChanges()
        );
    }

    public function deleted(User $user): void
    {
        $this->activityLogService->logUser(
            action: 'deleted',
            targetUser: $user
        );
    }
}
