# Sprint 7 Backend — POS Online + Offline Sync

**Fase Pengerjaan:** Sinkronisasi Transaksi Offline  
**Status:** ✅ Backend Selesai  
**Tanggal:** 5 Mei 2026

---

## 1. Perubahan Schema Database (Migration)

### A. `offline_uuid` pada `transactions` (S7-B06/B07/B08)
- **File:** `2026_05_05_010000_add_offline_uuid_to_transactions_table.php`
- **Tipe:** `UUID`, nullable, unique
- **Fungsi:** Idempotency key untuk deduplikasi saat sinkronisasi transaksi dari Dexie.js (IndexedDB). Frontend menghasilkan UUID v4 per transaksi di browser. Saat sync, backend menolak UUID yang sudah tersimpan.

### B. `hpp_at_sale` pada `transaction_items` (Persiapan Sprint 9)
- **File:** `2026_05_05_010001_add_hpp_at_sale_to_transaction_items_table.php`
- **Tipe:** `DECIMAL(14,2)`, default 0
- **Fungsi:** Snapshot `avg_cost` dari tabel `inventories` saat transaksi terjadi. Memungkinkan kalkulasi margin aktual per item untuk laporan Laba/Rugi di Sprint 9.

---

## 2. Model yang Diperbarui

| Model | Perubahan | Alasan |
|:------|:----------|:-------|
| `Transaction` | Tambah `offline_uuid` ke `$fillable` | Support offline sync |
| `TransactionItem` | Tambah `hpp_at_sale` ke `$fillable` + `$casts` | Snapshot HPP saat jual |

---

## 3. Service Layer

### A. `OfflineSyncService` (Baru — S7-B06)
- **File:** `app/Services/OfflineSyncService.php`
- **Method utama:** `syncBatch(array $transactions, int $userId): array`
- **Fitur:**
  - Menerima batch transaksi (max 50 per request)
  - Setiap transaksi diproses dalam DB::transaction independen
  - Deduplikasi via `offline_uuid` (status `duplicate`)
  - Error handling per-transaksi (status `failed`)
  - Logging untuk setiap operasi sync

### B. `TransactionService` (Diperbarui)
- **Perubahan pada `resolveItems()`:** Menangkap `hpp_at_sale` dari `inventory.avg_cost` saat resolving cart items
- **Perubahan pada `createOfflineTransaction()`:** Menyimpan `offline_uuid` dan `hpp_at_sale` ke database
- **Perubahan pada `createOnlineTransaction()`:** Menyimpan `hpp_at_sale` ke database

---

## 4. Repository Layer

### `TransactionRepository` (Diperbarui)
- **Method baru:** `findByOfflineUuid(string $uuid)` — mencari transaksi berdasarkan UUID offline untuk keperluan deduplikasi
- **Interface:** `TransactionRepositoryInterface` juga diperbarui

---

## 5. Controller & Route

### `PosOfflineController` (Diperbarui — S7-B07)
- **DI baru:** `OfflineSyncService`
- **Method baru:** `sync(Request $request)` — endpoint untuk batch sync
- **Validasi `store()`:** Ditambahkan `offline_uuid` (nullable, uuid, unique)

### Route Baru
```
POST /pos/offline/sync → PosOfflineController@sync (role: kasir)
```

---

## 6. API Contract — Sync Endpoint

### Request
```http
POST /pos/offline/sync
Content-Type: application/json
```

```json
{
  "transactions": [
    {
      "offline_uuid": "550e8400-e29b-41d4-a716-446655440000",
      "shift_id": 12,
      "items": [
        { "product_id": 5, "qty": 2.5 },
        { "product_id": 8, "qty": 1.0 }
      ],
      "discount_amount": 0,
      "discount_note": null,
      "payment_method": "cash",
      "payment_amount": 50000
    }
  ]
}
```

### Response
```json
{
  "total_received": 1,
  "synced": 1,
  "duplicates": 0,
  "failed": 0,
  "results": [
    {
      "index": 0,
      "offline_uuid": "550e8400-e29b-41d4-a716-446655440000",
      "status": "synced",
      "message": "Berhasil disinkronkan.",
      "transaction_number": "TRX-SRP-20260505-0001",
      "transaction_id": 42
    }
  ]
}
```

### Status per Transaksi
| Status | Kode | Penjelasan |
|:-------|:-----|:-----------|
| `synced` | Sukses | Transaksi berhasil disimpan ke server |
| `duplicate` | Skip | `offline_uuid` sudah ada di database |
| `failed` | Error | Validasi gagal atau stok tidak cukup |

---

## 7. Catatan Teknis untuk Frontend

1. **UUID Generation:** Gunakan `crypto.randomUUID()` atau library `uuid` v4 di browser saat membuat transaksi offline di Dexie.js
2. **Retry Logic:** Jika status `failed`, frontend bisa retry. Jika `duplicate`, hapus dari queue lokal
3. **Batch Limit:** Maksimal 50 transaksi per request sync
4. **Endpoint `store` tetap ada:** Untuk transaksi saat online, gunakan `POST /pos/offline` seperti biasa. `offline_uuid` bersifat opsional di sini
