<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add composite indexes to improve query performance across the application.
     *
     * Based on performance audit — these indexes target the most frequently
     * executed query patterns found in reports, dashboard, and POS flows.
     */
    public function up(): void
    {
        // transactions — used in all dashboard and report queries
        // Covers: WHERE status = ? AND created_at BETWEEN ? AND ? AND location_id = ?
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(
                ['status', 'created_at', 'location_id'],
                'idx_transactions_status_date_location'
            );
        });

        // reorder_points — used in low stock alert queries
        // Covers: WHERE is_active = 1 AND location_id = ?
        Schema::table('reorder_points', function (Blueprint $table) {
            $table->index(
                ['is_active', 'location_id'],
                'idx_reorder_points_active_location'
            );
        });

        // waste_requests — used in waste reports and approval queries
        // Covers: WHERE status = ? AND location_id = ? AND approved_at BETWEEN ? AND ?
        Schema::table('waste_requests', function (Blueprint $table) {
            $table->index(
                ['status', 'location_id', 'approved_at'],
                'idx_waste_requests_status_location_approved'
            );
        });

        // shifts — used for getActiveShift() lookups
        // Covers: WHERE user_id = ? AND status = ?
        Schema::table('shifts', function (Blueprint $table) {
            $table->index(
                ['user_id', 'status'],
                'idx_shifts_user_status'
            );
        });

        // transaction_items — for COGS subqueries in reports
        // Covers: WHERE transaction_id IN (?)
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->index(
                ['transaction_id'],
                'idx_transaction_items_transaction'
            );
        });

        // stock_mutations — for mutation queries by location and status
        Schema::table('stock_mutations', function (Blueprint $table) {
            $table->index(
                ['status', 'from_location_id'],
                'idx_stock_mutations_status_from_location'
            );
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('idx_transactions_status_date_location');
        });
        Schema::table('reorder_points', function (Blueprint $table) {
            $table->dropIndex('idx_reorder_points_active_location');
        });
        Schema::table('waste_requests', function (Blueprint $table) {
            $table->dropIndex('idx_waste_requests_status_location_approved');
        });
        Schema::table('shifts', function (Blueprint $table) {
            $table->dropIndex('idx_shifts_user_status');
        });
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropIndex('idx_transaction_items_transaction');
        });
        Schema::table('stock_mutations', function (Blueprint $table) {
            $table->dropIndex('idx_stock_mutations_status_from_location');
        });
    }
};
