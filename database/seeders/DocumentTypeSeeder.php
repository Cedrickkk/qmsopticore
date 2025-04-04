<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        collect([
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
        ])->each(function ($typeName) {
            DocumentType::factory()->create(['name' => $typeName]);
        });
    }
}
