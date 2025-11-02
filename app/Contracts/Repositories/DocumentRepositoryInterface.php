<?php

namespace App\Contracts\Repositories;

use App\Models\ArchivedDocument;
use App\Models\Document;
use App\Models\DocumentSignatory;
use App\Models\User;

interface DocumentRepositoryInterface
{
    public function find(int $id);
    public function create(array $attributes);
    public function update(Document $document, array $data);
    public function delete(Document $document);
    public function paginate(?string $search, ?string $dateFrom = null, ?string $dateTo = null);
    public function paginateArchived(?string $search = null, ?string $dateFrom = null, ?string $dateTo = null);
    public function paginateAuthorizedDocuments(
        User $user,
        ?string $search = null,
        ?string $dateFrom = null,
        ?string $dateTo = null,
        int $perPage = 10
    );
    public function archive(Document $document, int $archivedBy, string $reason = 'Manual archive');

    public function unarchive(ArchivedDocument $document, int $unarchivedBy);

    public function addSignatory(Document $document, array $data);
    public function getDocumentCreationOptions();
    public function getHistoryLogs(Document $document);

    public function setRepresentative(DocumentSignatory $signatory, User $representative);

    public function removeRepresentative(DocumentSignatory $signatory);
}
