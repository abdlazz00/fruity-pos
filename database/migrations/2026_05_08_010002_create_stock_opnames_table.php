<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_opnames', function (Blueprint $table) {
            $table->id();
            $table->string('opname_number', 30)->unique();
            $table->foreignId('location_id')->constrained('locations');
            $table->foreignId('conducted_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->date('opname_date');
            $table->enum('status', ['in_progress', 'submitted', 'approved'])->default('in_progress');
            $table->decimal('total_shrinkage_value', 14, 2)->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_opname_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_opname_id')->constrained('stock_opnames')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products');
            $table->decimal('system_quantity', 12, 2); // Snapshot saat sesi dimulai
            $table->decimal('physical_quantity', 12, 2)->nullable(); // Hasil hitung fisik
            $table->decimal('difference', 12, 2)->nullable(); // physical - system
            $table->decimal('shrinkage_value', 12, 2)->nullable(); // |difference| × avg_cost
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_opname_items');
        Schema::dropIfExists('stock_opnames');
    }
};
