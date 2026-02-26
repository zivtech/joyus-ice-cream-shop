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
        Schema::create('compliance_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('jurisdiction', 100);
            $table->string('certification_type', 150);
            $table->string('coverage_requirement', 50);
            $table->string('constraint_type', 20)->default('hard');
            $table->unsignedSmallInteger('minimum_certified_count')->default(1);
            $table->unsignedSmallInteger('expiration_months')->nullable();
            $table->boolean('active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'jurisdiction']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_rules');
    }
};
