# 📦 Sprint 4 — Backend Documentation
## Pengadaan & Inbound: Purchase Order + WAC Calculation

**Versi:** 1.0  
**Tanggal:** 28 April 2026  
**Sprint:** 4 (Minggu 4)  
**Status:** ✅ Backend Selesai (Siap Migrasi + Frontend)

---

## 📋 Daftar Task yang Diselesaikan

| ID | Task | Status |
|----|------|--------|
| S4-B01 | Migration: `purchase_orders` | ✅ |
| S4-B02 | Migration: `purchase_order_items` | ✅ |
| S4-B03 | Migration: `inbounds` (incl shipping_cost) | ✅ |
| S4-B04 | Migration: `inbound_items` | ✅ |
| S4-B05 | Migration: `inventories` | ✅ |
| S4-B06 | Model: PurchaseOrder, PurchaseOrderItem, Inbound, InboundItem, Inventory | ✅ |
| S4-B07 | PurchaseOrderService: create, update, confirm, cancel | ✅ |
| S4-B08 | PurchaseOrderRepository (interface + Eloquent) | ✅ |
| S4-B09 | PurchaseOrderController: index, create, store, show, edit, update, confirm, cancel, destroy | ✅ |
| S4-B10 | Auto-generate PO number: `PO-{CODE}-YYYYMMDD-XXXX` | ✅ |
| S4-B11 | InboundService: processReceipt (core method) | ✅ |
| S4-B12 | HPP Mentah = `total_buy_price / (qty × content)` | ✅ |
| S4-B13 | WAC = `((old_qty × old_avg) + (new_qty × hpp)) / total` | ✅ |
| S4-B14 | InboundRepository + InventoryRepository | ✅ |
| S4-B15 | InboundController: index, create, store, show | ✅ |
| S4-B16 | Event: InboundCreated | ✅ |
| S4-B17 | Listener: RecalculateWAC | ✅ |
| S4-B18 | Listener: SendInboundNotification | ✅ |
| S4-B19 | Migration: notifications (Laravel built-in) | ✅ |
| S4-B20 | shipping_cost di inbound (terpisah dari HPP) | ✅ |

---

## 🗂️ File yang Dibuat (Total: 30+ files)

### Database Migrations (6 file)

| File | Tabel | Keterangan |
|------|-------|------------|
| `2026_04_28_010000_create_purchase_orders_table.php` | `purchase_orders` | PO header dengan status enum 5-state |
| `2026_04_28_010001_create_purchase_order_items_table.php` | `purchase_order_items` | Line items PO |
| `2026_04_28_010002_create_inbounds_table.php` | `inbounds` | Penerimaan barang + ongkir |
| `2026_04_28_010003_create_inbound_items_table.php` | `inbound_items` | Detail item + HPP raw |
| `2026_04_28_010004_create_inventories_table.php` | `inventories` | Stok + WAC per produk/toko |
| `xxxx_create_notifications_table.php` | `notifications` | Laravel built-in notification |

### Models (5 file)

| Model | Fitur Utama |
|-------|-------------|
| `PurchaseOrder` | Auto PO number, status helpers (`isDraft`, `isConfirmed`, `isEditable`), relasi |
| `PurchaseOrderItem` | Relasi ke product + product_unit, cast decimal |
| `Inbound` | Auto inbound number, shipping_cost, relasi ke PO |
| `InboundItem` | hpp_raw_calculated, relasi ke product + unit |
| `Inventory` | UNIQUE(product, location), WAC per toko |

### Repository Layer (3 interface + 3 implementation)

| Interface | Implementation | Key Method |
|-----------|---------------|------------|
| `PurchaseOrderRepositoryInterface` | `PurchaseOrderRepository` | `syncItems()`, `paginate()` with location/status filter |
| `InboundRepositoryInterface` | `InboundRepository` | `paginate()` with location filter |
| `InventoryRepositoryInterface` | `InventoryRepository` | `updateOrCreateStock()` — **WAC recalculation** |

### Service Layer (2 file)

| Service | Methods |
|---------|---------|
| `PurchaseOrderService` | `createPurchaseOrder`, `updatePurchaseOrder`, `confirmPurchaseOrder`, `cancelPurchaseOrder`, `deletePurchaseOrder` |
| `InboundService` | `processReceipt` (HPP calc, qty validation, PO status update, event dispatch) |

### Controllers (2 file)

| Controller | Endpoints |
|-----------|-----------|
| `PurchaseOrderController` | 9 routes: CRUD + show + confirm + cancel |
| `InboundController` | 4 routes: index, create, store, show |

### Form Requests (2 file)

| Request | Validasi |
|---------|----------|
| `PurchaseOrderRequest` | supplier, location, order_date, items array |
| `InboundRequest` | PO reference, received_date, shipping_cost, items array + HPP fields |

### Event/Listener System (3 file)

| Component | Fungsi |
|-----------|--------|
| `InboundCreated` (Event) | Dispatched setelah inbound berhasil dibuat |
| `RecalculateWAC` (Listener) | Update inventory stock + WAC per item |
| `SendInboundNotification` (Listener) | Kirim notifikasi ke semua Owner |

### Notification (1 file)

| Class | Channel | Data |
|-------|---------|------|
| `InboundReceivedNotification` | `database` | PO/supplier info, HPP summary, human message |

### Provider + Config (3 file diubah)

| File | Perubahan |
|------|-----------|
| `AppServiceProvider` | +3 repository bindings (PO, Inbound, Inventory) |
| `EventServiceProvider` | InboundCreated → [RecalculateWAC, SendInboundNotification] |
| `bootstrap/providers.php` | +EventServiceProvider |

---

## 🔄 State Machine: Purchase Order Lifecycle

```
┌─────────┐     Confirm      ┌────────────┐     Partial      ┌─────────────────────┐
│  DRAFT  │ ───────────────► │ CONFIRMED  │ ──────────────► │ PARTIALLY_RECEIVED  │
└─────────┘                  └────────────┘                  └─────────────────────┘
    │                              │                                │
    │ Cancel                       │ Full Inbound                   │ Remaining Inbound
    ▼                              ▼                                ▼
┌───────────┐               ┌────────────┐                  ┌────────────┐
│ CANCELLED │               │ COMPLETED  │                  │ COMPLETED  │
└───────────┘               └────────────┘                  └────────────┘
```

## 📐 Formula Reference

### HPP Mentah (FR-205)
```
hpp_raw = total_buy_price / (quantity_received × content_per_unit)
```

### WAC / Weighted Average Cost (FR-206, FR-207)
```
new_avg_cost = ((old_qty × old_avg_cost) + (base_qty × hpp_raw)) / (old_qty + base_qty)
```

### Auto-Numbering
```
PO:      PO-{STORE_CODE}-YYYYMMDD-XXXX     → PO-SRP-20260428-0001
Inbound: INB-{STORE_CODE}-YYYYMMDD-XXXX    → INB-SRP-20260428-0001
```

---

## ⚠️ Catatan Penting

> Sebelum menjalankan frontend, pastikan:
> 1. MySQL aktif dan database `fruitypos` tersedia
> 2. Jalankan `php artisan migrate` untuk membuat 6 tabel baru
> 3. Pastikan ada minimal 1 Location dengan kolom `code` terisi (dipakai untuk auto-numbering)
