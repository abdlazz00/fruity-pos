<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->string('product_name', 100)->comment('Snapshot nama produk saat transaksi');
            $table->decimal('unit_price', 14, 2)->comment('Snapshot harga jual saat transaksi');
            $table->decimal('qty', 12, 2);
            $table->decimal('subtotal', 14, 2)->comment('unit_price * qty');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
    }
};
