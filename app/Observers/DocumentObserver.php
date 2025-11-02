<?php

namespace App\Observers;

use App\Models\Document;
use App\Services\ActivityLogService;

class DocumentObserver
{
    public function __construct(private readonly ActivityLogService $activityLogService) {}

    /**
     * Handle the Document "created" event.
     */
    public function created(Document $document): void
    {
        $this->activityLogService->logDocument(
            action: 'created',
            document: $document,
        );
    }

    /**
     * Handle the Document "updated" event.
     */
    public function updated(Document $document): void
    {
        $significantFields = ['title', 'status', 'description', 'category'];

        $changes = $document->getChanges();

        if (array_intersect_key($changes, array_flip($significantFields))) {
            $this->activityLogService->logDocument(
                action: 'updated',
                document: $document,
                oldValues: array_intersect_key($document->getOriginal(), array_flip($significantFields)),
                newValues: array_intersect_key($changes, array_flip($significantFields)),
            );
        }
    }

    /**
     * Handle the Document "deleted" event.
     */
    public function deleted(Document $document): void
    {
        $this->activityLogService->logDocument(
            action: 'deleted',
            document: $document,
        );
    }

    /**
     * Handle the Document "restored" event.
     */
    public function restored(Document $document): void
    {
        //
    }

    /**
     * Handle the Document "force deleted" event.
     */
    public function forceDeleted(Document $document): void
    {
        //
    }
}
