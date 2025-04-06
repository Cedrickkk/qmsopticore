<?php

namespace App\Contracts\Repositories;

use App\Models\Document;

interface DocumentRepositoryInterface
{
    public function find(int $id);
    public function create(array $attributes);
    public function update(Document $document, array $data);
    public function delete(Document $document);
    public function paginate(?string $search = null);
    public function paginateArchived(?string $search = null);
    public function archive(Document $document);
    public function unarchive(Document $document);
    public function addSignatory(Document $document, array $data);
    public function getDocumentCreationOptions();
    public function getHistoryLogs(Document $document);
}
