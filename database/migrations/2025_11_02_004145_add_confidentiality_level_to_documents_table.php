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
        Schema::table('documents', function (Blueprint $table) {
            $table->enum('confidentiality_leve', ['public', 'internal', 'confidential', 'highly_confidential'])
                ->default('internal');
            $table->boolean('require_reauth_on_view')->default(false);
            $table->boolean('auto_blur_after_seconds')->nullable()->after('require_reauth_on_view');
        });
    }
};
