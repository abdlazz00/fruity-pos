# Sprint 5 — Pricing Engine: Backend Summary

**Tanggal Selesai:** 30 April 2026
**Komponen:** Backend (Laravel)
**Status:** ✅ Semua 14 task backend selesai

---

## Deliverables

Owner dapat melihat HPP per toko, mengatur margin keuntungan, mengunci harga jual, dan mengelola multi-tier pricing. Produk yang belum di-lock harganya tidak akan muncul di query POS.

---

## Task Completion Checklist

| ID      | Task                                                               | Status |
|---------|--------------------------------------------------------------------|--------|
| S5-B01  | Migration: tabel `product_prices` + `price_tiers`                  | ✅     |
| S5-B02  | Model: `ProductPrice` + `PriceTier` + relasi                      | ✅     |
| S5-B03  | PricingService: `calculateBaseline` (MAX avg_cost semua toko)      | ✅     |
| S5-B04  | PricingService: `setMargin`, `roundHPP`, `calculateSellingPrice`   | ✅     |
| S5-B05  | PricingService: `lockPrice`, `unlockPrice`                         | ✅     |
| S5-B06  | PricingService: `syncTiers` (multi-tier per produk)                | ✅     |
| S5-B07  | `ProductPriceRepository` (interface + Eloquent)                    | ✅     |
| S5-B08  | `PricingController`: index, store, update, lock, unlock, tiers     | ✅     |
| S5-B09  | Query: daftar avg_cost per toko per produk                         | ✅     |
| S5-B10  | Event: `PriceLocked` (ShouldBroadcast via Echo)                    | ✅     |
| S5-B11  | Listener: `SyncPriceToAllBranches`                                 | ✅     |
| S5-B12  | Implementasi: produk tanpa harga locked tidak muncul di POS        | ✅     |
| S5-B13  | Listener: `RecalculateHppBaseline` saat InboundCreated             | ✅     |
| S5-B14  | Notifikasi HPP delta ke Owner (`HppBaselineChangedNotification`)   | ✅     |

---

## Arsitektur & File yang Dibuat/Dimodifikasi

### File Baru
| File                                                              | Deskripsi                                   |
|-------------------------------------------------------------------|---------------------------------------------|
| `database/migrations/..._create_product_prices_table.php`         | Tabel `product_prices` + `price_tiers`      |
| `app/Models/ProductPrice.php`                                     | Model pricing utama                         |
| `app/Models/PriceTier.php`                                        | Model multi-tier harga                      |
| `app/Repositories/Contracts/ProductPriceRepositoryInterface.php`  | Interface repository                        |
| `app/Repositories/ProductPriceRepository.php`                     | Implementasi Eloquent repository            |
| `app/Services/PricingService.php`                                 | Service layer logika bisnis pricing         |
| `app/Http/Controllers/PricingController.php`                      | Controller dengan 9 endpoint                |
| `app/Http/Requests/PricingRequest.php`                            | Form Request validasi                       |
| `app/Events/PriceLocked.php`                                      | Event broadcast saat harga di-lock          |
| `app/Listeners/SyncPriceToAllBranches.php`                        | Listener server-side saat harga di-lock     |
| `app/Listeners/RecalculateHppBaseline.php`                        | Listener recalc baseline saat inbound       |
| `app/Notifications/HppBaselineChangedNotification.php`            | Notifikasi HPP berubah ke Owner             |

### File yang Dimodifikasi
| File                                        | Perubahan                                                 |
|---------------------------------------------|-----------------------------------------------------------|
| `app/Models/Product.php`                    | Ditambah relasi `price()` dan `inventories()`             |
| `app/Providers/AppServiceProvider.php`      | Register binding `ProductPriceRepositoryInterface`        |
| `app/Providers/EventServiceProvider.php`    | Register `PriceLocked` event + `RecalculateHppBaseline`   |
| `routes/web.php`                            | 9 rute baru under `/pricing` (owner only)                 |

---

## Skema Database

### Tabel `product_prices`
| Kolom               | Tipe            | Keterangan                              |
|---------------------|-----------------|-----------------------------------------|
| `id`                | bigint (PK)     | Auto-increment                          |
| `product_id`        | FK → products   | Unique, 1 produk = 1 harga             |
| `hpp_baseline`      | decimal(14,2)   | MAX avg_cost dari semua toko            |
| `margin_percentage` | decimal(8,2)    | Margin keuntungan (%)                   |
| `selling_price`     | decimal(14,2)   | Harga jual final setelah margin+round   |
| `rounding_to`       | integer         | Pembulatan ke atas (0, 500, 1000, dst)  |
| `status`            | enum            | `pending` / `locked`                    |
| `locked_at`         | timestamp       | Waktu di-lock                           |
| `locked_by`         | FK → users      | Siapa yang meng-lock                    |

### Tabel `price_tiers`
| Kolom              | Tipe                | Keterangan                    |
|--------------------|---------------------|-------------------------------|
| `id`               | bigint (PK)         | Auto-increment                |
| `product_price_id` | FK → product_prices | Parent pricing                |
| `label`            | string(50)          | Nama tier (Ecer, Grosir, dll) |
| `min_qty`          | integer             | Minimum qty untuk tier ini    |
| `selling_price`    | decimal(14,2)       | Harga khusus tier             |

---

## Alur Bisnis (Flow)

### Flow 1: Owner Set Harga
```
1. Owner buka /pricing
2. Pilih produk → sistem hitung hpp_baseline = MAX(avg_cost) semua toko
3. Owner input margin % → sistem hitung selling_price = baseline + (baseline × margin%)
4. Owner pilih pembulatan (misal Rp 500) → harga dibulatkan ke atas
5. Owner klik "Lock" → produk muncul di POS kasir
```

### Flow 2: Auto-Recalc saat Inbound
```
1. Stockist terima barang (Inbound) → InboundCreated event
2. RecalculateWAC listener update avg_cost di inventories
3. RecalculateHppBaseline listener recalc hpp_baseline
4. Jika baseline berubah → notifikasi dikirim ke semua Owner
5. Owner bisa review dan adjust margin di Pricing Engine
```

### Flow 3: POS Filter
```
1. Kasir buka POS
2. Query hanya menampilkan produk WHERE product_prices.status = 'locked'
3. Produk pending/belum diset harga TIDAK muncul di POS
```

---

## API Endpoints

| Method | URI                                  | Name               | Deskripsi                            |
|--------|--------------------------------------|---------------------|--------------------------------------|
| GET    | `/pricing`                           | `pricing.index`     | List pricing dashboard               |
| POST   | `/pricing`                           | `pricing.store`     | Set margin baru                      |
| GET    | `/pricing/{id}`                      | `pricing.show`      | Detail harga + breakdown per toko    |
| PUT    | `/pricing/{id}`                      | `pricing.update`    | Update margin                        |
| PATCH  | `/pricing/{id}/lock`                 | `pricing.lock`      | Lock harga → tampil di POS           |
| PATCH  | `/pricing/{id}/unlock`               | `pricing.unlock`    | Unlock harga → hilang dari POS       |
| PUT    | `/pricing/{id}/tiers`                | `pricing.tiers`     | Sync multi-tier pricing              |
| GET    | `/api/pricing/breakdown/{productId}` | `pricing.breakdown` | HPP per toko (JSON)                  |
| POST   | `/api/pricing/preview`               | `pricing.preview`   | Preview kalkulasi tanpa simpan       |
