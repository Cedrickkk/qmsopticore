<?php

namespace Database\Seeders;

use App\Models\DocumentCategory;
use App\Models\DocumentType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DocumentCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $documentTypes = DocumentType::all()->pluck('id', 'name')->toArray();

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
            $typeId = $documentTypes[$typeName];

            foreach ($categoryNames as $categoryName) {
                DocumentCategory::create([
                    'name' => $categoryName,
                    'type' => $typeId
                ]);
            }
        }
    }
}
