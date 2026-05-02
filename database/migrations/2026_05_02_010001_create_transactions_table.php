<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number', 30)->unique()->comment('Auto-generated: TRX-LOC-YYYYMMDD-NNNN');
            $table->foreignId('shift_id')->constrained('shifts');
            $table->foreignId('location_id')->constrained('locations');
            $table->foreignId('user_id')->constrained('users')->comment('Kasir/Admin yang memproses');
            $table->enum('type', ['offline', 'online'])->default('offline');

            // Online-only fields
            $table->string('customer_name', 100)->nullable();
            $table->string('customer_phone', 20)->nullable();
            $table->text('customer_address')->nullable();
            $table->string('platform', 30)->nullable()->comment('WhatsApp, Grab, GoFood, Shopee, dll');
            $table->string('courier', 50)->nullable();
            $table->string('shipping_method', 50)->nullable();
            $table->decimal('shipping_cost', 14, 2)->default(0);

            // Financial
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('discount_amount', 14, 2)->default(0);
            $table->string('discount_note')->nullable();
            $table->decimal('total', 14, 2)->default(0)->comment('subtotal - discount + shipping_cost');

            // Payment
            $table->enum('payment_method', ['cash', 'transfer', 'ewallet'])->default('cash');
            $table->decimal('payment_amount', 14, 2)->default(0);
            $table->decimal('change_amount', 14, 2)->default(0)->comment('Kembalian (cash only)');

            $table->enum('status', ['completed', 'voided'])->default('completed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
