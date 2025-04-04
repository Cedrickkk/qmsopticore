<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\DocumentSignatory;
use App\Models\DocumentType;
use App\Models\DocumentWorkflowLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $typeMap = collect([
            'Academic Documents',
            'Administrative Records',
            'Financial Records',
            'Student Records',
            'Faculty Documents',
            'Extracurricular Activities',
            'Curriculum Guides',
            'Policy Manuals',
            'Library Records',
            'Research Papers',
        ])->mapWithKeys(function ($typeName) {
            $type = DocumentType::factory()->create(['name' => $typeName]);
            return [$typeName => $type->id];
        });

        $categories = [
            'Academic Documents' => ['Syllabus', 'Lesson Plan', 'Grade Reports', 'Exam Papers'],
            'Administrative Records' => ['School Policies', 'Meeting Minutes', 'Announcements', 'Notices'],
            'Financial Records' => ['Fee Receipts', 'Budget Plans', 'Expense Reports', 'Payroll'],
            'Student Records' => ['Enrollment Forms', 'Attendance Sheets', 'Progress Reports', 'Disciplinary Reports'],
            'Faculty Documents' => ['Employment Contracts', 'Performance Reviews', 'Schedules', 'Leave Applications'],
            'Extracurricular Activities' => ['Event Schedules', 'Club Memberships', 'Activity Reports', 'Volunteer Logs'],
            'Curriculum Guides' => ['Subject Outlines', 'Course Overviews', 'Academic Standards', 'Assessment Plans'],
            'Policy Manuals' => ['Code of Conduct', 'Safety Guidelines', 'IT Usage Policies', 'Grievance Procedures'],
            'Library Records' => ['Book Catalogs', 'Borrower Logs', 'Acquisition Lists', 'Overdue Reports'],
            'Research Papers' => ['Thesis Documents', 'Journals', 'Conference Papers', 'Research Proposals'],
        ];

        foreach ($categories as $typeName => $categoryNames) {
            foreach ($categoryNames as $categoryName) {
                DocumentCategory::factory()->create([
                    'name' => $categoryName,
                    'type' => $typeMap[$typeName]
                ]);
            }
        }

        $users = User::all();

        Document::factory(20)
            ->recycle(DocumentCategory::all())
            ->create()
            ->each(function (Document $document) use ($users) {
                // Create initial workflow log for document creation
                DocumentWorkflowLog::factory()
                    ->creation()
                    ->create([
                        'document_id' => $document->id,
                        'user_id' => $document->createdBy->id,
                        'created_at' => $document->created_at,
                    ]);

                // Generate 3-5 signatories per document
                $signatoriesCount = fake()->numberBetween(3, 5);
                $documentSignatories = $users->random($signatoriesCount);

                // Track document status
                $currentStatus = 'draft';
                $document->update(['status' => $currentStatus]);

                // Create signatories and their corresponding workflow logs
                foreach ($documentSignatories as $index => $user) {
                    // Create signatory
                    $signatory = DocumentSignatory::factory()
                        ->for($document)
                        ->for($user)
                        ->create([
                            'signatory_order' => $index + 1,
                            'status' => $this->determineSignatoryStatus($index)
                        ]);

                    // Create workflow log for signatory assignment
                    DocumentWorkflowLog::factory()->create([
                        'document_id' => $document->id,
                        'user_id' => $document->createdBy->id,
                        'action' => 'signatory_added',
                        'from_status' => $currentStatus,
                        'to_status' => $currentStatus,
                        'notes' => "Added {$user->name} as signatory #{$signatory->signatory_order}",
                        'created_at' => fake()->dateTimeBetween($document->created_at, 'now'),
                    ]);

                    // If signatory has taken action, create workflow log for it
                    if ($signatory->status !== 'pending') {
                        $newStatus = $this->determineDocumentStatus($document, $signatory->status);

                        DocumentWorkflowLog::factory()->create([
                            'document_id' => $document->id,
                            'user_id' => $document->createdBy->id,
                            'action' => $signatory->status === 'approved' ? 'approved' : 'rejected',
                            'from_status' => $currentStatus,
                            'to_status' => $newStatus,
                            'notes' => $signatory->status === 'approved'
                                ? "Approved the document"
                                : "Rejected the document: " . fake()->sentence(),
                            'created_at' => $signatory->signed_at,
                        ]);

                        $currentStatus = $newStatus;
                        $document->update(['status' => $currentStatus]);
                    }
                }

                // If all approved, create published workflow log
                if ($currentStatus === 'approved') {
                    DocumentWorkflowLog::factory()->create([
                        'document_id' => $document->id,
                        'user_id' =>  $user->id,
                        'action' => 'published',
                        'from_status' => 'approved',
                        'to_status' => 'published',
                        'notes' => 'Document published after all approvals received',
                        'created_at' => fake()->dateTimeBetween($document->created_at, 'now'),
                    ]);

                    $document->update(['status' => 'published']);
                }
            });
    }

    private function determineSignatoryStatus(int $index): string
    {
        // First signatory more likely to have acted
        if ($index === 0) {
            return fake()->randomElement(['approved', 'approved', 'rejected', 'pending']);
        }

        // Subsequent signatories more likely to be pending
        return fake()->randomElement(['pending', 'pending', 'approved', 'rejected']);
    }

    private function determineDocumentStatus(Document $document, string $signatoryAction): string
    {
        if ($signatoryAction === 'rejected') {
            return 'rejected';
        }

        $signatories = $document->signatories;
        $allApproved = $signatories->every(fn($s) => $s->status === 'approved');
        $anyPending = $signatories->contains(fn($s) => $s->status === 'pending');

        if ($allApproved) {
            return 'approved';
        }

        if ($anyPending) {
            return 'in_review';
        }

        return 'pending';
    }
}
