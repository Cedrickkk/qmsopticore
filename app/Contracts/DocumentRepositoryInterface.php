<?php

namespace App\Contracts;

use App\Models\Document;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface DocumentRepositoryInterface
{
    public function find(int $id);
    public function create(array $data);
    public function update(Document $document, array $data);
    public function delete(Document $document);
    public function paginate(?string $search = null);
    public function paginateArchived(?string $search = null);
    public function archive(Document $document);
    public function unarchive(Document $document);
    public function addSignatory(Document $document, array $data);
    public function getCreationOptions();
    public function getHistoryLogs(Document $document);
}
