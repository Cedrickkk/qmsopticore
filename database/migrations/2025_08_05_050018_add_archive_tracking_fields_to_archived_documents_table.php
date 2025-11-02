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
        Schema::table('archived_documents', function (Blueprint $table) {
            $table->unsignedBigInteger('archived_by')->nullable()->after('document_id');
            $table->timestamp('archived_at')->nullable()->after('archived_by');
            $table->text('archive_reason')->nullable()->after('archived_at');

            $table->foreign('archived_by')->references('id')->on('users')->onDelete('set null');
            $table->index('archived_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('archived_documents', function (Blueprint $table) {
            //
        });
    }
};
