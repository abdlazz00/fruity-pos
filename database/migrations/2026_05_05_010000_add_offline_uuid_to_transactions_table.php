<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sprint 7 — Offline Sync Support (S7-B06/B07/B08)
     *
     * Menambahkan kolom `offline_uuid` pada tabel `transactions`.
     * Kolom ini berfungsi sebagai idempotency key untuk mekanisme
     * deduplikasi saat sinkronisasi transaksi dari POS Offline (Dexie.js).
     *
     * Frontend akan membuat UUID v4 unik per transaksi di IndexedDB.
     * Saat sync ke server, backend menolak UUID yang sudah ada (dedup).
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->uuid('offline_uuid')
                ->nullable()
                ->unique()
                ->after('status')
                ->comment('UUID v4 dari Dexie.js, untuk dedup saat offline sync');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('offline_uuid');
        });
    }
};
