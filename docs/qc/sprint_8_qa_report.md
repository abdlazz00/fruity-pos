# 📋 Sprint 8 — QA Report
## Mutasi Stok + Waste Management + Stock Opname

**Tanggal QA:** 8 Mei 2026  
**QA Engineer:** AI QA  
**Scope:** S8-B01 s/d S8-B16 (Backend) + S8-F01 s/d S8-F10 (Frontend)  
**Status Keseluruhan:** ⚠️ **PASS WITH NOTES** (12 temuan, 3 Critical harus di-fix)

---

## 1. Ringkasan Eksekutif

| Aspek | Status | Detail |
|-------|--------|--------|
| **Migrations (3 file)** | ✅ PASS | Schema sesuai SRS Bab 4.2 |
| **Models (6 file)** | ✅ PASS | Relationships, casts, fillable lengkap |
| **Services (3 file)** | ✅ PASS | Business logic sesuai FR-601→FR-806 |
| **Controllers (3 file)** | ⚠️ PASS w/ NOTES | 1 isu Owner filter logic |
| **Routes (19 endpoint)** | ✅ PASS | RBAC benar, endpoint lengkap |
| **Events & Listeners (4+3)** | ⚠️ PASS w/ NOTES | WasteApproved listener kosong |
| **Repository Bindings** | ✅ PASS | 3 repo terdaftar di AppServiceProvider |
| **Frontend Pages (8 file)** | ⚠️ PASS w/ NOTES | Beberapa isu UI/security |
| **Frontend Component (1 file)** | ✅ PASS | ReceiveConfirmation fungsional |
| **Sidebar Update** | ✅ PASS | Menu Manajemen Stok untuk Owner & Stockist |
| **Build** | ✅ PASS | Vite build sukses, 0 error |

---

## 2. Detail Temuan per Layer

### 2.1 Database Migrations

| File | SRS Ref | Status | Notes |
|------|---------|--------|-------|
| `create_stock_mutations_table.php` | Bab 4.2 stock_mutations | ✅ | Kolom sesuai SRS. **Note:** SRS mencantumkan `product_unit_id` di `stock_mutation_items` tapi migration tidak menyertakannya. Ini **acceptable** karena mutasi menggunakan base_uom. |
| `create_waste_requests_table.php` | Bab 4.2 waste_requests | ✅ | `photo_path NOT NULL` sesuai FR-701 (foto wajib). `hpp_value` sesuai FR-704. |
| `create_stock_opnames_table.php` | Bab 4.2 stock_opnames | ✅ | Kolom `difference` & `shrinkage_value` sesuai FR-803. |

> [!NOTE]
> SRS Bab 4.2 menyebutkan `product_unit_id` FK di `stock_mutation_items`, namun karena project menggunakan `base_uom` sebagai standar mutasi (tanpa konversi unit), kolom ini sengaja di-skip. Keputusan ini konsisten dengan implementasi POS dan Waste.

### 2.2 Models (6 Model)

| Model | Fillable | Casts | Relations | Status Helpers | Status |
|-------|----------|-------|-----------|----------------|--------|
| `StockMutation` | ✅ 9 fields | ✅ datetime | ✅ 5 relasi | ✅ 4 helpers | ✅ |
| `StockMutationItem` | ✅ 5 fields | ✅ decimal:2 | ✅ 2 relasi | — | ✅ |
| `WasteRequest` | ✅ 7 fields | ✅ datetime | ✅ 4 relasi | ✅ 3 helpers | ✅ |
| `WasteRequestItem` | ✅ 6 fields | ✅ decimal:2 | ✅ 2 relasi | — | ✅ |
| `StockOpname` | ✅ 8 fields | ✅ date+datetime | ✅ 4 relasi | ✅ 3 helpers | ✅ |
| `StockOpnameItem` | ✅ 6 fields | ✅ decimal:2 | ✅ 2 relasi | — | ✅ |

**Auto-number generators verified:**
- `MUT-{CODE}-YYYYMMDD-XXXX` ✅ (FR-1102 pattern)
- `WST-{CODE}-YYYYMMDD-XXXX` ✅
- `OPN-{CODE}-YYYYMMDD-XXXX` ✅

### 2.3 Services — Business Logic Audit

#### MutationService.php
| Method | FR Ref | Logic Check | Status |
|--------|--------|-------------|--------|
| `create()` | FR-601 | Stockist buat dari toko sendiri → items saved | ✅ |
| `ship()` | FR-603 | Stok asal dikurangi, avg_cost TIDAK berubah | ✅ |
| `receive()` | FR-604, FR-605 | Stok tujuan +, WAC recalc pakai `avg_cost` asal, loss dihitung | ✅ |
| `complete()` | FR-602 | Status transition dari received → completed | ✅ |

#### WasteService.php
| Method | FR Ref | Logic Check | Status |
|--------|--------|-------------|--------|
| `submit()` | FR-701, FR-702 | Foto disimpan, HPP = qty × avg_cost, stok TIDAK dipotong | ✅ |
| `approve()` | FR-704 | Stok dipotong per item | ✅ |
| `reject()` | FR-705 | Stok tetap, alasan dicatat, `approved_by` diisi | ✅ |

#### StockOpnameService.php
| Method | FR Ref | Logic Check | Status |
|--------|--------|-------------|--------|
| `startSession()` | FR-801 | Snapshot stok + exclusive lock check | ✅ |
| `inputCounts()` | FR-802, FR-803 | Selisih + shrinkage_value dihitung, hanya loss yang dihitung | ✅ |
| `submit()` | FR-804 | Total shrinkage dihitung, status → submitted | ✅ |
| `approve()` | FR-805 | Stok adjust ke physical_quantity, avg_cost TETAP | ✅ |

### 2.4 Controllers

| Controller | Validation | Inertia Render | Status |
|------------|-----------|----------------|--------|
| `MutationController` | ✅ store validated | ✅ 3 views | ⚠️ See BUG-01 |
| `WasteController` | ✅ store + reject validated | ✅ 3 views | ✅ |
| `OpnameController` | ✅ updateCounts validated | ✅ 2 views | ✅ |

### 2.5 Routes — 19 Endpoints

| Group | Middleware | Count | Status |
|-------|-----------|-------|--------|
| Mutasi | `owner,stockist` | 7 | ✅ |
| Waste (CRUD) | `owner,stockist` | 4 | ✅ |
| Waste (Approval) | `owner` | 2 | ✅ RBAC benar |
| Opname (CRUD) | `owner,stockist` | 5 | ✅ |
| Opname (Approval) | `owner` | 1 | ✅ RBAC benar |

### 2.6 Events & Listeners

| Event | Listener | Status |
|-------|----------|--------|
| `MutationShipped` | `NotifyMutationShipped` | ✅ |
| `MutationReceived` | `HandleMutationReceived` | ✅ |
| `WasteSubmitted` | `NotifyWasteSubmitted` | ✅ (FR-703) |
| `WasteApproved` | *(kosong)* | ⚠️ See BUG-02 |

### 2.7 Frontend Pages

| Page | Props Match | Role Logic | UI Pattern | Build | Status |
|------|-------------|------------|------------|-------|--------|
| `MutationIndex.jsx` | ✅ | ✅ Owner filter, Stockist create btn | ✅ Matches PO Index | ✅ | ✅ |
| `MutationForm.jsx` | ✅ | ✅ Stockist only | ✅ Item repeater | ✅ | ✅ |
| `MutationShow.jsx` | ✅ | ✅ Ship/Receive/Complete conditional | ✅ Timeline + detail | ✅ | ⚠️ See BUG-03 |
| `WasteIndex.jsx` | ✅ | ✅ Dual view Owner/Stockist | ✅ HPP column Owner-only | ✅ | ✅ |
| `WasteForm.jsx` | ✅ | ✅ Stockist only | ✅ Photo upload + preview | ✅ | ✅ |
| `WasteShow.jsx` | ✅ | ✅ Approve/Reject Owner-only | ✅ Card-based items + photo | ✅ | ✅ |
| `OpnameIndex.jsx` | ✅ | ✅ Start btn + active lock | ✅ Shrinkage Owner-only | ✅ | ✅ |
| `OpnameShow.jsx` | ✅ | ✅ 3-state view + Owner approve | ✅ Editable inputs | ✅ | ⚠️ See BUG-04 |

---

## 3. Daftar Temuan (Bug & Issues)

### 🔴 CRITICAL (Harus Fix Sebelum Release)

#### BUG-01: MutationController — Owner Melihat Semua Mutasi Gagal
- **File:** `MutationController.php:29-34`
- **Masalah:** Jika Owner memilih "Semua Toko" di filter (`location_id` = empty), controller fallback ke `firstLocation`. Artinya Owner **tidak pernah bisa lihat mutasi semua toko sekaligus** — hanya 1 toko per waktu.
- **Dampak:** UX Owner terbatas. Tidak sesuai dengan ekspektasi "Semua Toko" di dropdown filter.
- **Fix:** Buat method `getAll()` di repository yang mengembalikan semua mutasi tanpa filter lokasi saat `location_id` null.

#### BUG-02: WasteApproved Listener Kosong
- **File:** `EventServiceProvider.php:32-34`
- **Masalah:** Event `WasteApproved` terdaftar tapi listener array kosong. Seharusnya trigger `RecalculateHppBaseline` karena waste mengurangi stok sehingga mempengaruhi avg_cost di laporan.
- **Dampak:** hpp_baseline tidak auto-recalc setelah waste di-approve, potensi data inconsistency di Pricing Engine.
- **Fix:** Tambah `RecalculateHppBaseline::class` ke listener array WasteApproved.

#### BUG-03: MutationShow — Security: Owner Bisa Lihat `avg_cost` Melalui Source Inventory
- **File:** `MutationShow.jsx` — Ini sebenarnya aman karena data `avg_cost` tidak di-pass ke frontend. Namun, jika `mutation.items` di-serialize dengan `product.inventories`, HPP bisa terekspose ke Stockist.
- **Masalah:** Backend `findById()` di repository perlu diaudit — pastikan **tidak** eager-load `inventories` relasi saat mengembalikan data ke Stockist.
- **Dampak:** Potensial kebocoran data HPP ke Stockist (melanggar SRS Bab 2.3: *"Stockist TIDAK bisa lihat HPP/harga"*).
- **Fix:** Audit `MutationRepository::findById()` — pastikan hanya load relasi yang aman: `items.product` (tanpa `inventories` atau `avg_cost`).

### 🟡 MAJOR (Sebaiknya Fix)

#### BUG-04: OpnameShow — `physical_quantity` Default 0 Menyesatkan
- **File:** `OpnameShow.jsx` + `StockOpnameService.php:81`
- **Masalah:** Saat sesi dimulai, `physical_quantity` di-set ke 0. Di UI, input field menampilkan "0" bukan placeholder kosong. User bisa terkecoh mengira stok fisik = 0 padahal belum dihitung.
- **Fix:** Gunakan empty string `""` di UI state dan set `physical_quantity` ke `null` atau 0 di backend, tapi frontend render empty input.

#### BUG-05: WasteForm — Tidak Ada Validasi Max File Size di Frontend
- **File:** `WasteForm.jsx`
- **Masalah:** Meskipun backend memvalidasi `max:5120` (5MB), frontend tidak memberikan feedback saat file terlalu besar sebelum submit.
- **Fix:** Tambah client-side validation: `if (file.size > 5 * 1024 * 1024) alert('...')`.

#### BUG-06: MutationForm — Duplikasi Produk Tidak Dicegah
- **File:** `MutationForm.jsx`
- **Masalah:** User bisa menambahkan produk yang sama di 2 baris berbeda. Backend mungkin error atau stok terpotong ganda.
- **Fix:** Filter dropdown berdasarkan produk yang sudah dipilih, atau validasi sebelum submit.

#### BUG-07: WasteForm — Photo Preview Memory Leak
- **File:** `WasteForm.jsx:38`
- **Masalah:** `URL.createObjectURL()` dipanggil tapi `URL.revokeObjectURL()` tidak pernah dipanggil, menyebabkan memory leak.
- **Fix:** Tambah cleanup di `useEffect` return atau saat item dihapus/foto diganti.

#### BUG-08: OpnameIndex — `hasActiveOpname` Hanya Cek Page Pertama
- **File:** `OpnameIndex.jsx:18`  
- **Masalah:** `opnames.data?.some(o => o.status === 'in_progress')` hanya cek halaman yang sedang ditampilkan. Jika opname aktif ada di halaman lain, tombol "Mulai Opname Baru" akan tetap aktif.
- **Fix:** Backend harus kirim prop `has_active_opname: true/false` tersendiri, bukan mengandalkan data paginated.

### 🟢 MINOR (Nice to Have)

#### BUG-09: MutationIndex — `received` dan `completed` Status Badge Warna Sama
- **File:** `MutationIndex.jsx:8`
- **Masalah:** Keduanya `variant: 'success'` (hijau). User tidak bisa membedakan secara visual.
- **Fix:** Gunakan warna berbeda, contoh: `received` → `'info'` (biru), `completed` → `'success'` (hijau). Sesuai guideline: received = hijau muda, completed = hijau tua.

#### BUG-10: WasteIndex — Owner Selalu Hanya Lihat Pending
- **File:** `WasteController.php:28-30`
- **Masalah:** Method `getAllPending()` hanya return status 'pending'. Owner tidak bisa melihat histori waste yang sudah approved/rejected.
- **Fix:** Tambah parameter status di `getAllPending()` atau buat method `getAll()` dengan opsional filter.

#### BUG-11: MutationShow — Tombol Action Tidak Menampilkan Flash Message
- **File:** `MutationShow.jsx`
- **Masalah:** Setelah action berhasil (ship/receive/complete), flash message dari backend (`->with('status', ...)`) tidak ditampilkan di UI.
- **Fix:** Tambah rendering `usePage().props.flash?.status` di `AppLayout` atau di page langsung.

#### BUG-12: Sidebar — Stockist Dashboard Missing
- **File:** `Sidebar.jsx:60-88`  
- **Masalah:** Stockist menu tidak punya link ke Dashboard. Saat login, Stockist diarahkan ke route yang mungkin 403 karena dashboard hanya untuk Owner.
- **Dampak:** Bukan blocker Sprint 8, tapi perlu perhatian untuk Sprint 9.

---

## 4. Matriks FR Coverage

### 4.1 Mutasi Stok (FR-601 → FR-605)

| FR | Requirement | Backend | Frontend | Status |
|----|-------------|---------|----------|--------|
| FR-601 | Mutasi dari TOKO SENDIRI ke toko lain | ✅ `MutationService::create()` | ✅ `MutationForm.jsx` | ✅ |
| FR-602 | Status: Preparing → Shipped → Received → Completed | ✅ 4 methods + helpers | ✅ `MutationShow.jsx` conditional buttons | ✅ |
| FR-603 | Shipped: stok asal -, avg_cost TIDAK berubah | ✅ `deductStock()` only | ✅ Ship button | ✅ |
| FR-604 | Received: stok tujuan +, WAC recalc | ✅ `updateOrCreateStock()` w/ transferCost | ✅ `ReceiveConfirmation` modal | ✅ |
| FR-605 | Selisih qty = Mutasi Loss | ✅ `loss_quantity` calculated | ✅ Loss column in table | ✅ |

### 4.2 Waste Management (FR-701 → FR-706)

| FR | Requirement | Backend | Frontend | Status |
|----|-------------|---------|----------|--------|
| FR-701 | Stockist ajukan: item, qty, alasan, foto WAJIB | ✅ photo validate + store | ✅ `WasteForm.jsx` photo upload | ✅ |
| FR-702 | Pending TIDAK potong stok | ✅ `submit()` no stock deduction | — | ✅ |
| FR-703 | Notifikasi waste ke Owner + foto | ✅ `WasteSubmitted` event + listener | — | ✅ |
| FR-704 | Approve: stok potong, value = qty × avg_cost | ✅ `approve()` deductStock per item | ✅ Approve button + modal | ✅ |
| FR-705 | Reject: stok tetap, alasan dicatat | ✅ `reject()` no stock change | ✅ Reject modal + textarea | ✅ |
| FR-706 | Riwayat waste untuk analisis tren | ⚠️ Partial (data tersimpan, report di S9) | ⚠️ Index shows history | ⚠️ S9 |

### 4.3 Stock Opname (FR-801 → FR-806)

| FR | Requirement | Backend | Frontend | Status |
|----|-------------|---------|----------|--------|
| FR-801 | Mulai sesi: snapshot stok + avg_cost | ✅ `startSession()` snapshots all inventory | ✅ Start button | ✅ |
| FR-802 | Input jumlah fisik per item | ✅ `inputCounts()` | ✅ Editable inputs in `OpnameShow` | ✅ |
| FR-803 | Hitung selisih dan nilai penyusutan | ✅ difference + shrinkage_value calc | ✅ Color-coded difference | ✅ |
| FR-804 | Laporan selisih ke Owner | ✅ `submit()` status → submitted | ✅ Submit button | ✅ |
| FR-805 | Owner approve: stok adjust, avg_cost TETAP | ✅ `approve()` sets qty = physical, no WAC change | ✅ Approve button + modal | ✅ |
| FR-806 | Audit trail: siapa hitung, siapa approve | ✅ `conducted_by` + `approved_by` stored | ✅ Displayed in UI | ✅ |

---

## 5. Sprint Task Coverage

### Backend (S8-B01 → S8-B16)

| ID | Task | Status |
|----|------|--------|
| S8-B01 | Migration: stock_mutations + items | ✅ |
| S8-B02 | Migration: waste_requests + items | ✅ |
| S8-B03 | Migration: stock_opnames + items | ✅ |
| S8-B04 | 6 Models + relasi | ✅ |
| S8-B05 | MutationService: create, ship, receive, complete | ✅ |
| S8-B06 | WAC recalc di toko tujuan saat receive | ✅ |
| S8-B07 | MutationRepository + MutationController | ✅ |
| S8-B08 | Event: MutationShipped, MutationReceived + Listeners | ✅ |
| S8-B09 | WasteService: submit, approve, reject | ✅ |
| S8-B10 | Foto upload wajib (Laravel Storage) | ✅ |
| S8-B11 | WasteRepository + WasteController | ✅ |
| S8-B12 | Event: WasteSubmitted, WasteApproved + Listeners | ⚠️ WasteApproved listener kosong |
| S8-B13 | StockOpnameService: startSession, inputCounts, submit, approve | ✅ |
| S8-B14 | Snapshot stok saat sesi dimulai | ✅ |
| S8-B15 | OpnameRepository + OpnameController | ✅ |
| S8-B16 | Stok adjustment setelah Owner approve | ✅ |

### Frontend (S8-F01 → S8-F10)

| ID | Task | File | Status |
|----|------|------|--------|
| S8-F01 | MutationIndex.jsx | ✅ Created | ✅ |
| S8-F02 | MutationForm.jsx | ✅ Created | ✅ |
| S8-F03 | Ship → Receive → Complete flow | ✅ In MutationShow.jsx | ✅ |
| S8-F04 | ReceiveConfirmation.jsx | ✅ Created | ✅ |
| S8-F05 | WasteIndex.jsx (dual view) | ✅ Created | ✅ |
| S8-F06 | WasteForm.jsx (foto upload) | ✅ Created | ✅ |
| S8-F07 | WasteShow.jsx (approval) | ✅ Created | ✅ |
| S8-F08 | OpnameIndex.jsx | ✅ Created | ✅ |
| S8-F09 | OpnameShow.jsx (tabel selisih) | ✅ Created | ✅ |
| S8-F10 | Owner approval opname | ✅ In OpnameShow.jsx | ✅ |

### Sidebar Update
| Item | Status |
|------|--------|
| Menu "Manajemen Stok" di Owner menu | ✅ |
| Menu "Manajemen Stok" di Stockist menu | ✅ |
| Sub-items: Mutasi, Waste, Opname | ✅ |

---

## 6. Security Checklist

| Check | Requirement | Status | Notes |
|-------|-------------|--------|-------|
| HPP/avg_cost hidden dari Stockist | SRS Bab 2.3 | ⚠️ | Perlu audit `findById()` repo — lihat BUG-03 |
| Waste approve/reject Owner only | Route RBAC | ✅ | Separate middleware group |
| Opname approve Owner only | Route RBAC | ✅ | Separate middleware group |
| Foto upload max 5MB | FR-701, S8-B10 | ✅ | Backend validated, FE needs client-side |
| CSRF protection | NFR-07 | ✅ | Inertia handles automatically |
| LocationScope isolation | SRS 3.4 | ✅ | Stockist filtered by own location_id |

---

## 7. Rekomendasi Prioritas Fix

### Harus Fix Sekarang (Before Merge)
1. **BUG-01:** Perbaiki Owner filter "Semua Toko" di MutationController & OpnameController
2. **BUG-02:** Tambah listener `RecalculateHppBaseline` ke WasteApproved
3. **BUG-03:** Audit repository `findById()` — pastikan tidak leak `avg_cost` ke Stockist

### Fix di Iterasi Berikutnya
4. **BUG-04:** Physical quantity default 0 → empty input
5. **BUG-06:** Duplikasi produk di MutationForm
6. **BUG-08:** `has_active_opname` prop dari backend

### Nice to Have
7. **BUG-05, BUG-07:** Client-side file validation & memory leak cleanup
8. **BUG-09:** Badge warna berbeda untuk received vs completed

---

## 8. Kesimpulan

Sprint 8 secara keseluruhan **berhasil mengimplementasikan 95% requirement** dari SRS FR-601 s/d FR-806. Backend layer (migrations, models, services, controllers, routes, events) solid dan mengikuti Service-Repository pattern dengan baik. Frontend pages menggunakan design system yang konsisten dan sudah lolos Vite build tanpa error.

**3 Critical bugs** perlu diperbaiki sebelum release:
1. Owner "Semua Toko" filter logic
2. WasteApproved listener kosong (hpp_baseline inconsistency risk)
3. Potential HPP data leak ke Stockist via repository eager-loading

Setelah 3 critical fix tersebut di-apply, Sprint 8 **siap untuk di-merge dan di-demo**.
