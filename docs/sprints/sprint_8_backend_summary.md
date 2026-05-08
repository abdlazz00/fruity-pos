# Sprint 8 — Final Summary
## Mutasi Stok + Waste Management + Stock Opname + Laporan Stok

**Tanggal:** 8 Mei 2026 | **Status:** ✅ Selesai Total (17/17 Tasks)

---

## 1. Task Completion

| ID | Task | File | Status |
|----|------|------|--------|
| S8-B01 | Migration: stock_mutations + items | `2026_05_08_010000_create_stock_mutations_table.php` | ✅ |
| S8-B02 | Migration: waste_requests + items | `2026_05_08_010001_create_waste_requests_table.php` | ✅ |
| S8-B03 | Migration: stock_opnames + items | `2026_05_08_010002_create_stock_opnames_table.php` | ✅ |
| S8-B04 | Models (6 model + relasi) | `StockMutation`, `StockMutationItem`, `WasteRequest`, `WasteRequestItem`, `StockOpname`, `StockOpnameItem` | ✅ |
| S8-B05 | MutationService (create, ship, receive, complete) | `app/Services/MutationService.php` | ✅ |
| S8-B06 | WAC recalc di toko tujuan saat received | Terintegrasi di `MutationService::receive()` | ✅ |
| S8-B07 | MutationRepository + MutationController | `app/Repositories/`, `app/Http/Controllers/` | ✅ |
| S8-B08 | Events: MutationShipped, MutationReceived + Listeners | `app/Events/`, `app/Listeners/` | ✅ |
| S8-B09 | WasteService (submit, approve, reject) | `app/Services/WasteService.php` | ✅ |
| S8-B10 | Foto upload wajib (Laravel Storage) | Terintegrasi di `WasteService::submit()` | ✅ |
| S8-B11 | WasteRepository + WasteController | `app/Repositories/`, `app/Http/Controllers/` | ✅ |
| S8-B12 | Events: WasteSubmitted, WasteApproved + Listeners | `app/Events/`, `app/Listeners/` | ✅ |
| S8-B13 | StockOpnameService (startSession, inputCounts, submit, approve) | `app/Services/StockOpnameService.php` | ✅ |
| S8-B14 | Snapshot stok saat sesi opname dimulai | Terintegrasi di `StockOpnameService::startSession()` | ✅ |
| S8-B15 | OpnameRepository + OpnameController | `app/Repositories/`, `app/Http/Controllers/` | ✅ |
| S8-B16 | Stok adjustment setelah Owner approve | Terintegrasi di `StockOpnameService::approve()` | ✅ |
| S8-B17 | Modul Laporan Stok Realtime (Filter Kategori & Lokasi) | `InventoryController.php`, `StockIndex.jsx` | ✅ |

---

## 2. Database Tables Created

| Table | Columns | Purpose |
|-------|---------|---------|
| `stock_mutations` | 12 cols | Header mutasi antar-toko |
| `stock_mutation_items` | 7 cols | Item per mutasi (sent/received/loss) |
| `waste_requests` | 10 cols | Header pengajuan waste |
| `waste_request_items` | 8 cols | Item waste (qty, reason, foto, hpp_value) |
| `stock_opnames` | 11 cols | Header sesi opname |
| `stock_opname_items` | 8 cols | Item opname (system vs physical) |

---

## 3. Business Logic Summary

### Mutasi Stok (FR-601 → FR-605)
- **Create**: Stockist membuat mutasi dari toko sendiri ke toko lain
- **Ship**: Stok asal dikurangi, avg_cost asal **TIDAK berubah** (FR-603)
- **Receive**: Stok tujuan bertambah, **WAC recalc** menggunakan avg_cost asal sebagai cost basis (FR-604)
- **Loss**: Selisih sent vs received tercatat sebagai `loss_quantity` (FR-605)

### Waste Management (FR-701 → FR-706)
- **Submit**: Stockist ajukan waste dengan **foto wajib**, HPP value otomatis dihitung (qty × avg_cost)
- **Pending**: Stok **TIDAK** dipotong (FR-702)
- **Approve**: Owner approve → stok dipotong (FR-704)
- **Reject**: Stok tetap, alasan wajib dicatat (FR-705)

### Stock Opname (FR-801 → FR-806)
- **Start Session**: Snapshot stok + avg_cost saat ini (FR-801), 1 sesi aktif per lokasi
- **Input Counts**: Stockist input jumlah fisik, selisih + shrinkage value otomatis dihitung (FR-802, FR-803)
- **Approve**: Owner approve → stok di-adjust ke jumlah fisik, **avg_cost TIDAK berubah** (FR-805)

### Laporan Stok Realtime
- **Stockist**: Melihat stok *real-time* khusus di lokasinya sendiri dengan filter kategori.
- **Owner**: Melihat seluruh stok perusahaan secara *real-time*, dengan *dropdown* filter lokasi & kategori, beserta valuasi aset (Qty × Avg Cost).

---

## 4. Routes Registered (20 endpoints)

```
GET    /inventory/stocks             → inventory.stocks

GET    /inventory/mutations          → mutations.index
POST   /inventory/mutations          → mutations.store
GET    /inventory/mutations/create   → mutations.create
GET    /inventory/mutations/{id}     → mutations.show
PATCH  /inventory/mutations/{id}/ship      → mutations.ship
PATCH  /inventory/mutations/{id}/receive   → mutations.receive
PATCH  /inventory/mutations/{id}/complete  → mutations.complete

GET    /inventory/waste              → waste.index
POST   /inventory/waste              → waste.store
GET    /inventory/waste/create       → waste.create
GET    /inventory/waste/{id}         → waste.show
PATCH  /inventory/waste/{id}/approve → waste.approve     (Owner)
PATCH  /inventory/waste/{id}/reject  → waste.reject      (Owner)

GET    /inventory/opname             → opname.index
POST   /inventory/opname/start       → opname.start
GET    /inventory/opname/{id}        → opname.show
PUT    /inventory/opname/{id}/counts → opname.updateCounts
PATCH  /inventory/opname/{id}/submit → opname.submit
PATCH  /inventory/opname/{id}/approve → opname.approve   (Owner)
```

---

## 5. Events & Notifications

| Event | Listeners | Notification |
|-------|-----------|--------------|
| `MutationShipped` | `NotifyMutationShipped` | Database notif ke Stockist tujuan |
| `MutationReceived` | `HandleMutationReceived` | Log loss qty jika ada |
| `WasteSubmitted` | `NotifyWasteSubmitted` | Database notif ke semua Owner |
| `WasteApproved` | `RecalculateHppBaseline` | HPP recalculation based on approval |

---

## 6. Quality Assurance & UI/UX
- Telah dilakukan E2E browser testing penuh menggunakan Subagent.
- UI/UX disesuaikan dengan komponen React (Card, Table, Modal).
- Semua bug minor dan crash rendering (*TypeError string kosong* pada Opname, *Location filter bug* pada Waste, & *Listener strict-typing error*) telah **diperbaiki secara tuntas**.
- Selengkapnya dapat dilihat pada artifact: `artifacts/sprint8_qa_report.md`
