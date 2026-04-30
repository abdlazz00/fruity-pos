<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Main pricing table: one row per product (centralized pricing by Owner)
        Schema::create('product_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->decimal('hpp_baseline', 14, 2)->default(0)->comment('MAX avg_cost across all locations');
            $table->decimal('margin_percentage', 8, 2)->default(0)->comment('Profit margin % set by Owner');
            $table->decimal('selling_price', 14, 2)->default(0)->comment('Final selling price after margin + rounding');
            $table->integer('rounding_to')->default(0)->comment('Round up to nearest N (e.g. 500, 1000)');
            $table->enum('status', ['pending', 'locked'])->default('pending');
            $table->timestamp('locked_at')->nullable();
            $table->foreignId('locked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique('product_id');
        });

        // Multi-tier pricing: e.g. Ecer, Grosir (S5-B06 / FR-305)
        Schema::create('price_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_price_id')->constrained('product_prices')->cascadeOnDelete();
            $table->string('label', 50)->comment('e.g. Ecer, Grosir, Reseller');
            $table->integer('min_qty')->default(1)->comment('Minimum quantity for this tier');
            $table->decimal('selling_price', 14, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_tiers');
        Schema::dropIfExists('product_prices');
    }
};
