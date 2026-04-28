<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inbound_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inbound_id')->constrained('inbounds')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->foreignId('product_unit_id')->constrained('product_units');
            $table->decimal('quantity_received', 10, 2);
            $table->decimal('total_buy_price', 14, 2);
            $table->integer('content_per_unit');
            $table->decimal('hpp_raw_calculated', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inbound_items');
    }
};
