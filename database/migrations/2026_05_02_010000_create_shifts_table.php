<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('location_id')->constrained('locations');
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->decimal('opening_balance', 14, 2)->default(0)->comment('Saldo awal laci kasir');
            $table->decimal('expected_balance', 14, 2)->nullable()->comment('Saldo seharusnya (opening + cash in)');
            $table->decimal('actual_balance', 14, 2)->nullable()->comment('Saldo aktual fisik saat tutup shift');
            $table->decimal('difference', 14, 2)->nullable()->comment('Selisih (actual - expected)');
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
