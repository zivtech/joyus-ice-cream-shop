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
        Schema::create('delivery_syncs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('location_id')->constrained('locations');
            $table->string('source', 50);
            $table->date('period_start');
            $table->date('period_end');
            $table->unsignedInteger('rows_total')->default(0);
            $table->unsignedInteger('rows_applied')->default(0);
            $table->unsignedInteger('rows_skipped')->default(0);
            $table->decimal('net_total', 10, 2)->default(0);
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_syncs');
    }
};
