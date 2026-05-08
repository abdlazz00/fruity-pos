<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waste_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number', 30)->unique();
            $table->foreignId('location_id')->constrained('locations');
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('waste_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('waste_request_id')->constrained('waste_requests')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products');
            $table->decimal('quantity', 10, 2);
            $table->enum('reason', ['rotten', 'damaged', 'expired', 'failed_qc']);
            $table->string('photo_path', 255); // Wajib upload foto (FR-701)
            $table->decimal('hpp_value', 12, 2); // qty × avg_cost (FR-704)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waste_request_items');
        Schema::dropIfExists('waste_requests');
    }
};
