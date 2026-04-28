<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products');
            $table->foreignId('location_id')->constrained('locations');
            $table->decimal('quantity', 12, 2)->default(0);
            $table->decimal('avg_cost', 12, 2)->default(0); // WAC per toko
            $table->timestamps();

            $table->unique(['product_id', 'location_id']); // 1 row per product per store
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
