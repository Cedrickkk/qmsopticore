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
    Schema::create('activity_logs', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('user_id')->nullable();
      $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
      $table->string('action'); // login, logout, create, update, delete, view, etc.
      $table->string('entity_type')->nullable(); // Document, User, etc.
      $table->unsignedBigInteger('entity_id')->nullable(); // ID of the entity being acted upon
      $table->string('description'); // Human readable description
      $table->json('old_values')->nullable(); // Previous values for updates
      $table->json('new_values')->nullable(); // New values for updates
      $table->string('ip_address', 45)->nullable();
      $table->text('user_agent')->nullable();
      $table->timestamps();

      $table->index(['user_id', 'created_at']);
      $table->index(['entity_type', 'entity_id']);
      $table->index(['action', 'created_at']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('activity_logs');
  }
};
