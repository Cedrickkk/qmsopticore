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
        Schema::table('document_signatories', function (Blueprint $table) {
            $table->boolean('signed_by_representative')->default(false)->after('signed_at');
            $table->timestamp('representative_signed_at')->nullable()->after('signed_by_representative');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_signatories', function (Blueprint $table) {
            //
        });
    }
};
