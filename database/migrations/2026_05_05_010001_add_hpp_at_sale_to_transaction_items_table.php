<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sprint 7 — Persiapan Laporan Laba/Rugi (Sprint 9)
     *
     * Menambahkan kolom `hpp_at_sale` pada tabel `transaction_items`.
     * Kolom ini menyimpan snapshot `avg_cost` dari tabel `inventories`
     * pada saat transaksi terjadi, sehingga margin aktual per item
     * bisa dihitung secara akurat untuk laporan P&L.
     *
     * Rumus: margin_per_item = unit_price - hpp_at_sale
     */
    public function up(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->decimal('hpp_at_sale', 14, 2)
                ->default(0)
                ->after('unit_price')
                ->comment('Snapshot avg_cost dari inventories saat transaksi terjadi');
        });
    }

    public function down(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropColumn('hpp_at_sale');
        });
    }
};
