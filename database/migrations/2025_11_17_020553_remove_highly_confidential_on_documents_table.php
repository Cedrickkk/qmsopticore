<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint  $table) {
            $table->dropColumn('confidentiality_level');
        });

        Schema::table('documents', function (Blueprint  $table) {
            $table->enum('confidentiality_level', ['public', 'internal', 'confidential'])
                ->default('internal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
