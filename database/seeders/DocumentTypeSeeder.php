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
        $documentTypes = [
            ['name' => 'Academic Documents', 'code' => 'ACD'],
            ['name' => 'Administrative Records', 'code' => 'ADM'],
            ['name' => 'Financial Records', 'code' => 'FIN'],
            ['name' => 'Student Records', 'code' => 'STD'],
            ['name' => 'Faculty Documents', 'code' => 'FAC'],
            ['name' => 'Extracurricular Activities', 'code' => 'EXT'],
            ['name' => 'Curriculum Guides', 'code' => 'CUR'],
            ['name' => 'Policy Manuals', 'code' => 'POL'],
            ['name' => 'Library Records', 'code' => 'LIB'],
            ['name' => 'Research Papers', 'code' => 'RES'],
        ];

        // Create or update each type with its code
        foreach ($documentTypes as $type) {
            DocumentType::updateOrCreate(
                ['name' => $type['name']],
                ['code' => $type['code']]
            );
        }
    }
}
