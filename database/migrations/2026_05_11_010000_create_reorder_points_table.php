<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sprint 9 — Reorder Point (S9-B01)
     *
     * FR-1207: Stockist set min stok untuk TOKO-NYA.
     * FR-1208: Owner set/override untuk TOKO MANAPUN.
     * FR-1209: Threshold dalam base_uom.
     * FR-1210: UNIQUE per product per location.
     * FR-1214: Cooldown 1 jam per produk per toko.
     * FR-1215: Toggle aktif/nonaktif threshold.
     */
    public function up(): void
    {
        Schema::create('reorder_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('location_id')->constrained()->onDelete('cascade');
            $table->decimal('min_quantity', 12, 2)->comment('Minimum stock threshold in base UoM (FR-1209)');
            $table->boolean('is_active')->default(true)->comment('Toggle aktif/nonaktif (FR-1215)');
            $table->timestamp('last_notified_at')->nullable()->comment('Cooldown tracker: 1 jam per produk per toko (FR-1214)');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // FR-1210: UNIQUE per product per location
            $table->unique(['product_id', 'location_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reorder_points');
    }
};
