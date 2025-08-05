<?php

namespace App\Contracts\Repositories;

use App\Models\Document;
use App\Models\User;

interface DocumentRepositoryInterface
{
    public function find(int $id);
    public function create(array $attributes);
    public function update(Document $document, array $data);
    public function delete(Document $document);
    public function paginate(?string $search, ?string $dateFrom = null, ?string $dateTo = null);
    public function paginateArchived(?string $search = null);
    public function paginateAuthorizedDocuments(
        User $user,
        ?string $search = null,
        ?string $dateFrom = null,
        ?string $dateTo = null,
        int $perPage = 10
    );
    public function archive(Document $document);
    public function unarchive(Document $document);
    public function addSignatory(Document $document, array $data);
    public function getDocumentCreationOptions();
    public function getHistoryLogs(Document $document);
}
