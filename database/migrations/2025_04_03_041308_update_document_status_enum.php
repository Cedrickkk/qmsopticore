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
            $table->dropColumn('status');
            $table->dropColumn('is_archived');
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->enum('status', [
                'draft',
                'in_review',
                'approved',
                'rejected',
                'published',
                'archived'
            ])->default('draft')->after('created_by');
            $table->text('description')->after('title')->nullable();
            $table->boolean('requires_all_signatures')->default(true)->after('version');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            //
        });
    }
};
