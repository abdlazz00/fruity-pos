<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add missing columns to products table
        Schema::table('products', function (Blueprint $table) {
            $table->text('description')->nullable()->after('sku');
            $table->string('type', 20)->default('tunggal')->after('description');
            $table->boolean('has_sn')->default(false)->after('type');
        });

        // Add price and default columns to product_units table
        Schema::table('product_units', function (Blueprint $table) {
            $table->decimal('price_purchase', 12, 2)->default(0)->after('conversion_to_base');
            $table->decimal('price_sales', 12, 2)->default(0)->after('price_purchase');
            $table->boolean('is_default')->default(false)->after('price_sales');
        });

        // Add limit_value, limit_unit, action to weight_safeguards (replace min/max)
        Schema::table('weight_safeguards', function (Blueprint $table) {
            $table->decimal('limit_value', 10, 2)->nullable()->after('product_id');
            $table->string('limit_unit', 20)->default('gram')->after('limit_value');
            $table->string('action', 20)->default('warning')->after('limit_unit');
            // Make old columns nullable so they don't block
            $table->integer('min_weight_gram')->nullable()->change();
            $table->integer('max_weight_gram')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['description', 'type', 'has_sn']);
        });

        Schema::table('product_units', function (Blueprint $table) {
            $table->dropColumn(['price_purchase', 'price_sales', 'is_default']);
        });

        Schema::table('weight_safeguards', function (Blueprint $table) {
            $table->dropColumn(['limit_value', 'limit_unit', 'action']);
        });
    }
};
