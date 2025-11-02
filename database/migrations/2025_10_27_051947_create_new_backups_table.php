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
        Schema::create('backups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['database', 'document']);
            $table->string('filename');
            $table->string('path');
            $table->bigInteger('size')->nullable();
            $table->boolean('successful')->default(false);
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }
};
