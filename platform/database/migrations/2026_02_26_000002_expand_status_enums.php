<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Expand status enums to support the full lifecycle values.
     */
    public function up(): void
    {
        // SQLite (used in testing) doesn't enforce enums, so we only need to
        // alter the column for non-SQLite drivers.
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            return;
        }

        // Expand policy_exception_requests status to include 'rejected'
        DB::statement("ALTER TABLE policy_exception_requests MODIFY COLUMN status ENUM('pending', 'approved', 'denied', 'rejected') DEFAULT 'pending'");

        // Expand pto_requests status to include 'cancelled'
        DB::statement("ALTER TABLE pto_requests MODIFY COLUMN status ENUM('pending', 'approved', 'denied', 'cancelled') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE policy_exception_requests MODIFY COLUMN status ENUM('pending', 'approved', 'denied') DEFAULT 'pending'");
        DB::statement("ALTER TABLE pto_requests MODIFY COLUMN status ENUM('pending', 'approved', 'denied') DEFAULT 'pending'");
    }
};
