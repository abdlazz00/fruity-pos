# Sprint 9 — Backend Summary: Dashboard Owner (S9-B07 & S9-B08)

**Tanggal:** 11 Mei 2026  
**Deliverable:** DashboardService + DashboardController lengkap — KPI harian, revenue per toko, tren 7 hari, top produk, penjualan per channel, transaksi terbaru.

---

## 1. Ringkasan Perubahan

### File Baru (2 file)

| File | Deskripsi |
|------|-----------|
| `app/Services/DashboardService.php` | Service layer: semua query agregasi KPI & chart data |
| `app/Http/Controllers/DashboardController.php` | Controller: `index` (Inertia) + `kpiApi` (JSON) |

### File Dimodifikasi (1 file)

| File | Perubahan |
|------|-----------|
| `routes/web.php` | Dashboard route diubah dari inline closure ke `DashboardController@index` + tambah API endpoint `dashboard.kpi` |

---

## 2. API Endpoints

| Method | URL | Name | Deskripsi |
|--------|-----|------|-----------|
| `GET` | `/dashboard` | `dashboard` | Halaman Dashboard Owner (Inertia) |
| `GET` | `/api/dashboard/kpi` | `dashboard.kpi` | JSON: KPI data refresh (AJAX polling) |

### Query Parameters (berlaku untuk kedua endpoint)

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `start_date` | `Y-m-d` | Hari ini | Awal periode filter |
| `end_date` | `Y-m-d` | Hari ini | Akhir periode filter |
| `location_id` | `int` | `null` (semua) | Filter per toko |

---

## 3. Data yang Disuplai ke Frontend

### 3.1 `kpi` — KPI Cards

```json
{
  "revenue": 15750000.00,
  "cogs": 9200000.00,
  "gross_profit": 6550000.00,
  "discount": 250000.00,
  "shipping_cost": 180000.00,
  "waste_value": 120000.00,
  "net_profit": 6250000.00,
  "total_transactions": 142,
  "avg_transaction": 110915.49,
  "waste_pending": 3,
  "low_stock_count": 5
}
```

**Formula Laba (sesuai SRS 5.4):**
```
Laba Kotor       = Revenue − COGS
Laba Operasional = Laba Kotor − Ongkir − Waste Value
```

### 3.2 `revenueByStore` — Bar Chart

```json
[
  { "location_id": 1, "location_name": "Toko Bogor", "revenue": 8500000, "total_transactions": 78 },
  { "location_id": 2, "location_name": "Toko Depok", "revenue": 7250000, "total_transactions": 64 }
]
```

### 3.3 `revenueTrend` — Line Chart (7 Hari Terakhir)

```json
[
  { "date": "2026-05-05", "label": "Sen, 05 Mei", "revenue": 2100000, "transactions": 18 },
  { "date": "2026-05-06", "label": "Sel, 06 Mei", "revenue": 1850000, "transactions": 15 },
  ...
]
```

### 3.4 `topProducts` — Top 5 Produk Terlaris

```json
[
  { "product_id": 5, "product_name": "Mangga Harum Manis", "total_qty": 145.50, "total_revenue": 4365000 },
  { "product_id": 3, "product_name": "Apel Fuji", "total_qty": 120.00, "total_revenue": 3600000 }
]
```

### 3.5 `salesByChannel` — Pie Chart

```json
[
  { "type": "offline", "total_transactions": 98, "revenue": 10500000 },
  { "type": "online",  "total_transactions": 44, "revenue": 5250000 }
]
```

### 3.6 `recentTransactions` — Activity Feed

```json
[
  {
    "id": 342,
    "transaction_number": "TRX-BGR-20260511-0042",
    "type": "offline",
    "total": 185000,
    "payment_method": "cash",
    "location_name": "Toko Bogor",
    "cashier_name": "Kasir A",
    "created_at": "2026-05-11 10:32:15"
  }
]
```

### 3.7 `locations` — Filter Dropdown

```json
[
  { "id": 1, "name": "Toko Bogor", "code": "BGR" },
  { "id": 2, "name": "Toko Depok", "code": "DPK" }
]
```

### 3.8 `filters` — Current Active Filters

```json
{
  "start_date": "2026-05-11",
  "end_date": "2026-05-11",
  "location_id": null
}
```

---

## 4. Arsitektur & Desain

### DashboardService Methods

| Method | Parameter | Return | Keterangan |
|--------|-----------|--------|------------|
| `getKpi()` | `?startDate, ?endDate, ?locationId` | `array` | Semua metrik KPI |
| `getRevenueByStore()` | `?startDate, ?endDate` | `array` | Revenue per toko |
| `getRevenueTrend()` | `days, ?locationId` | `array` | Tren harian N hari terakhir |
| `getTopProducts()` | `limit, ?startDate, ?endDate, ?locationId` | `array` | Produk terlaris |
| `getSalesByChannel()` | `?startDate, ?endDate, ?locationId` | `array` | Breakdown offline vs online |
| `getRecentTransactions()` | `limit, ?locationId` | `array` | Transaksi terbaru |

### Keputusan Teknis

1. **Single Service, No Repository:** Dashboard hanya melakukan query read-only agregasi, tidak butuh repository layer terpisah.
2. **Date Range Filtering:** Semua metrik mendukung filter periode (default: hari ini). Ini memungkinkan frontend untuk menampilkan "Hari Ini", "Minggu Ini", "Bulan Ini" tanpa perubahan backend.
3. **Location Scoping:** Semua metrik mendukung filter `location_id` untuk drill-down per toko.
4. **Revenue Trend Gap-fill:** Hari tanpa transaksi tetap muncul di chart dengan value 0, sehingga line chart tidak terputus.
5. **Low Stock Count:** Menggunakan `ReorderPoint` + `Inventory` check yang sudah diimplementasi di Sprint 9 Reorder Point.
6. **Net Profit Formula:** Mengikuti SRS v1.2 Bab 5.4 → `Revenue - COGS - ShippingCost - WasteValue`.

---

## 5. FR Coverage

| FR | Requirement | Status |
|----|-------------|--------|
| FR-901 | Dashboard KPI: Revenue, Laba, Transaksi, Waste, Low Stock | ✅ Semua metrik tersedia via `getKpi()` |
| FR-1213 | Alert di dashboard Owner (low stock) | ✅ `low_stock_count` field + existing `/api/reorder-points/low-stock` endpoint |
