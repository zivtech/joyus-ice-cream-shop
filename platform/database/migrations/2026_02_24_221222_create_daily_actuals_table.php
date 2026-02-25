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
        Schema::create('daily_actuals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('location_id')->constrained('locations');
            $table->date('date');
            $table->unsignedInteger('transactions')->default(0);
            $table->decimal('revenue', 10, 2)->default(0);
            $table->decimal('store_labor', 10, 2)->default(0);
            $table->decimal('delivery_net', 10, 2)->default(0);
            $table->decimal('delivery_gross', 10, 2)->nullable();
            $table->decimal('delivery_commission', 10, 2)->nullable();
            $table->string('delivery_source', 50)->nullable();
            $table->string('pos_source', 50)->default('square');
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'location_id', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_actuals');
    }
};
