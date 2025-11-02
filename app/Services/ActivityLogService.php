<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    /**
     * Log an activity.
     */
    public function log(
        string $action,
        string $description,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?User $user = null,
        ?Request $request = null
    ): ActivityLog {
        $user = $user ?? Auth::user();
        $request = $request ?? request();

        return ActivityLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    /**
     * Log user authentication activities.
     */
    public function logAuth(string $action, User $user, ?Request $request = null): ActivityLog
    {
        $descriptions = [
            'login' => "User {$user->name} logged in",
            'logout' => "User {$user->name} logged out",
            'login_failed' => "Failed login attempt for {$user->email}",
            'password_reset' => "User {$user->name} reset their password",
            'email_verified' => "User {$user->name} verified their email",
        ];

        return $this->log(
            action: $action,
            description: $descriptions[$action] ?? "User {$user->name} performed {$action}",
            entityType: 'User',
            entityId: $user->id,
            user: $user,
            request: $request
        );
    }

    /**
     * Log document-related activities.
     */
    public function logDocument(
        string $action,
        $document,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?User $user = null
    ): ActivityLog {
        $user = $user ?? Auth::user();

        $descriptions = [
            'created' => "Document '{$document->title}' was created",
            'updated' => "Document '{$document->title}' was updated",
            'deleted' => "Document '{$document->title}' was deleted",
            'viewed' => "Document '{$document->title}' was viewed",
            'downloaded' => "Document '{$document->title}' was downloaded",
            'approved' => "Document '{$document->title}' was approved",
            'rejected' => "Document '{$document->title}' was rejected",
            'published' => "Document '{$document->title}' was published",
            'archived' => "Document '{$document->title}' was archived",
            'unarchived' => "Document '{$document->title}' was restored",
            'shared' => "Document '{$document->title}' was shared",
        ];

        return $this->log(
            action: $action,
            description: $descriptions[$action] ?? "Document '{$document->title}' action: {$action}",
            entityType: 'Document',
            entityId: $document->id,
            oldValues: $oldValues,
            newValues: $newValues,
            user: $user
        );
    }

    /**
     * Log user management activities.
     */
    public function logUser(
        string $action,
        User $targetUser,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?User $performer = null
    ): ActivityLog {

        $performer = $performer ?? Auth::user();

        $descriptions = [
            'created' => "User account '{$targetUser->name}' was created",
            'updated' => "User account '{$targetUser->name}' was updated",
            'deleted' => "User account '{$targetUser->name}' was deleted",
            'role_assigned' => "Role was assigned to user '{$targetUser->name}'",
            'role_removed' => "Role was removed from user '{$targetUser->name}'",
            'permissions_updated' => "Permissions updated for user '{$targetUser->name}'",
        ];

        return $this->log(
            action: $action,
            description: $descriptions[$action] ?? "User '{$targetUser->name}' action: {$action}",
            entityType: 'User',
            entityId: $targetUser->id,
            oldValues: $oldValues,
            newValues: $newValues,
            user: $performer
        );
    }

    public function logBackup(
        string $action,
        $backup,
        ?User $user = null
    ): ActivityLog {
        $user = $user ?? Auth::user();

        $descriptions = [
            'created' => "Backup '{$backup->filename}' ({$backup->type}) was created - {$backup->file_size}",
            'downloaded' => "Backup '{$backup->filename}' ({$backup->type}) was downloaded",
            'deleted' => "Backup '{$backup->filename}' ({$backup->type}) was deleted",
            'verified' => "Backup '{$backup->filename}' ({$backup->type}) was verified",
            'restored' => "Backup '{$backup->filename}' ({$backup->type}) was restored",
        ];

        $metadata = [
            'filename' => $backup->filename,
            'type' => $backup->type,
            'size' => $backup->size,
            'file_size' => $backup->file_size,
            'successful' => $backup->successful,
        ];

        return $this->log(
            action: $action,
            description: $descriptions[$action] ?? "Backup '{$backup->filename}' action: {$action}",
            entityType: 'Backup',
            entityId: $backup->id,
            newValues: $metadata,
            user: $user
        );
    }

    /**
     * Log system activities.
     */
    public function logSystem(string $action, string $description, ?array $metadata = null): ActivityLog
    {
        return $this->log(
            action: $action,
            description: $description,
            newValues: $metadata
        );
    }

    /**
     * Get paginated activity logs.
     */
    public function getPaginatedLogs(
        ?string $search = null,
        ?string $action = null,
        ?string $entityType = null,
        ?int $userId = null,
        ?string $dateFrom = null,
        ?string $dateTo = null,
        int $perPage = 10
    ) {
        $query = ActivityLog::with('user')
            ->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($action) {
            $query->byAction($action);
        }

        if ($entityType) {
            $query->byEntityType($entityType);
        }

        if ($userId) {
            $query->byUser($userId);
        }

        if ($dateFrom || $dateTo) {
            $query->dateRange($dateFrom, $dateTo);
        }

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Get activity statistics.
     */
    public function getActivityStats(?string $period = '30 days'): array
    {
        $startDate = now()->sub($period);

        $totalActivities = ActivityLog::where('created_at', '>=', $startDate)->count();

        $topActions = ActivityLog::where('created_at', '>=', $startDate)
            ->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        $topUsers = ActivityLog::where('created_at', '>=', $startDate)
            ->whereNotNull('user_id')
            ->with('user:id,name')
            ->selectRaw('user_id, COUNT(*) as count')
            ->groupBy('user_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        $dailyActivity = ActivityLog::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'total_activities' => $totalActivities,
            'top_actions' => $topActions,
            'top_users' => $topUsers,
            'daily_activity' => $dailyActivity,
        ];
    }

    public function getUserActivityLogs(int $userId, int $perPage)
    {
        return $this->getPaginatedLogs(
            userId: $userId,
            perPage: $perPage,
        );
    }

    public function getRecentUserActivity(int $userId, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return ActivityLog::with('user')
            ->where('user_id', $userId)
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Get user activity summary/stats
     */
    public function getUserActivityStats(int $userId, string $period = '30 days'): array
    {
        $startDate = now()->sub($period);

        $totalActivities = ActivityLog::where('user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->count();

        $topActions = ActivityLog::where('user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        return [
            'total_activities' => $totalActivities,
            'top_actions' => $topActions,
            'period' => $period,
        ];
    }
}
