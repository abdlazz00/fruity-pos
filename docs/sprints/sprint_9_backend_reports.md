# Sprint 9 — Backend Summary: Modul Laporan (S9-B09 s/d S9-B17)

**Tanggal:** 11 Mei 2026  
**Deliverable:** ReportService (8 metode laporan) + ReportController (8 endpoint) + Routes lengkap.

---

## 1. Ringkasan Perubahan

### File Baru (2 file)

| File | Deskripsi |
|------|-----------|
| `app/Services/ReportService.php` | Service layer: 8 metode laporan analitik |
| `app/Http/Controllers/ReportController.php` | Controller: 8 endpoint Inertia (1 endpoint shift aksesibel semua role) |

### File Dimodifikasi (1 file)

| File | Perubahan |
|------|-----------|
| `routes/web.php` | Tambah 7 route di owner group + 1 route shift di group semua role |

---

## 2. API Endpoints

| Method | URL | Route Name | FR | RBAC |
|--------|-----|------------|-------|------|
| `GET` | `/reports/profit-loss` | `reports.profit-loss` | FR-902 | Owner |
| `GET` | `/reports/sales` | `reports.sales` | FR-903 | Owner |
| `GET` | `/reports/inventory` | `reports.inventory` | FR-904 | Owner |
| `GET` | `/reports/waste` | `reports.waste` | FR-905 | Owner |
| `GET` | `/reports/shifts` | `reports.shifts` | FR-906/907 | All (scoped) |
| `GET` | `/reports/discounts` | `reports.discounts` | FR-1205 | Owner |
| `GET` | `/reports/shipping-costs` | `reports.shipping-costs` | FR-1218 | Owner |
| `GET` | `/reports/hpp-comparison` | `reports.hpp-comparison` | FR-1111 | Owner |

### Query Parameters

| Parameter | Berlaku Untuk | Tipe | Default |
|-----------|---------------|------|---------|
| `start_date` | Semua kecuali inventory, hpp | `Y-m-d` | Awal bulan ini |
| `end_date` | Semua kecuali inventory, hpp | `Y-m-d` | Hari ini |
| `location_id` | Semua | `int` / `null` | `null` (semua toko) |
| `low_stock_only` | Inventory | `boolean` | `false` |

---

## 3. Struktur Data per Endpoint

### 3.1 Profit & Loss (`profitLoss`)

```json
{
  "report": {
    "period": { "start": "2026-05-01", "end": "2026-05-11" },
    "revenue": 15750000.00,
    "discount": 250000.00,
    "cogs": 9200000.00,
    "gross_profit": 6550000.00,
    "shipping_cost": 180000.00,
    "waste_value": 120000.00,
    "mutation_loss_qty": 2.50,
    "net_profit": 6250000.00,
    "total_transactions": 142,
    "margin_percentage": 39.68
  }
}
```

**Formula (SRS v1.2 Bab 5.4):**
```
Laba Kotor       = Revenue − COGS
Laba Operasional = Laba Kotor − Ongkir − Waste Value
Margin %         = (Laba Operasional / Revenue) × 100
```

### 3.2 Sales by Channel (`salesByChannel`)

```json
{
  "report": {
    "period": { "start": "2026-05-01", "end": "2026-05-11" },
    "details": [
      {
        "type": "offline",
        "platform": null,
        "location_id": 1,
        "location_name": "Toko Bogor",
        "total_transactions": 78,
        "revenue": 8500000.00,
        "total_discount": 100000.00
      },
      {
        "type": "online",
        "platform": "tokopedia",
        "location_id": 1,
        "location_name": "Toko Bogor",
        "total_transactions": 22,
        "revenue": 3200000.00,
        "total_discount": 50000.00
      }
    ],
    "summary": {
      "offline": { "revenue": 12500000.00, "transactions": 120 },
      "online":  { "revenue": 5250000.00,  "transactions": 44 }
    }
  }
}
```

### 3.3 Inventory Report (`inventoryReport`)

```json
{
  "report": {
    "items": [
      {
        "product_id": 5,
        "product_name": "Mangga Harum Manis",
        "sku": "BUH-00005",
        "base_uom": "kg",
        "category_name": "Buah Tropis",
        "location_id": 1,
        "location_name": "Toko Bogor",
        "quantity": 45.50,
        "avg_cost": 25000.00,
        "stock_value": 1137500.00
      }
    ],
    "total_items": 35,
    "total_stock_value": 25750000.00
  }
}
```

### 3.4 Waste Report (`wasteReport`)

```json
{
  "report": {
    "period": { "start": "2026-05-01", "end": "2026-05-11" },
    "by_product": [
      { "product_id": 3, "product_name": "Apel Fuji", "total_qty": 12.00, "total_value": 360000.00 }
    ],
    "monthly_trend": [
      { "month": "2026-04", "total_qty": 25.50, "total_value": 750000.00 },
      { "month": "2026-05", "total_qty": 12.00, "total_value": 360000.00 }
    ],
    "by_location": [
      { "location_id": 1, "location_name": "Toko Bogor", "total_qty": 8.00, "total_value": 240000.00 }
    ],
    "total_value": 360000.00,
    "total_qty": 12.00
  }
}
```

### 3.5 Shift Report (`shiftReport`)

```json
{
  "report": {
    "period": { "start": "2026-05-01", "end": "2026-05-11" },
    "shifts": [
      {
        "id": 42,
        "cashier_name": "Kasir A",
        "location_name": "Toko Bogor",
        "opened_at": "2026-05-11 08:00:00",
        "closed_at": "2026-05-11 16:00:00",
        "status": "closed",
        "opening_balance": 200000.00,
        "expected_balance": 1850000.00,
        "actual_balance": 1845000.00,
        "difference": -5000.00,
        "total_transactions": 35,
        "total_sales": 1650000.00
      }
    ],
    "total_shifts": 15,
    "summary": {
      "total_sales": 12500000.00,
      "total_transactions": 280,
      "total_difference": -15000.00
    }
  }
}
```

**Note FR-907:** Kasir/Admin hanya melihat shift sendiri (di-filter di controller via `$userId`).

### 3.6 Discount Report (`discountReport`)

```json
{
  "report": {
    "period": { "start": "2026-05-01", "end": "2026-05-11" },
    "transactions": [
      {
        "id": 123,
        "transaction_number": "TRX-BGR-20260511-0012",
        "type": "offline",
        "subtotal": 250000.00,
        "discount_amount": 25000.00,
        "discount_note": "Diskon member",
        "total": 225000.00,
        "created_at": "2026-05-11T10:32:15",
        "location_name": "Toko Bogor",
        "cashier_name": "Kasir A"
      }
    ],
    "total_discount": 250000.00,
    "count": 18
  }
}
```

### 3.7 Shipping Cost Report (`shippingCostReport`)

```json
{
  "report": {
    "period": { "start": "2026-05-01", "end": "2026-05-11" },
    "transaction_shipping": {
      "details": [
        { "location_id": 1, "location_name": "Toko Bogor", "order_count": 22, "total_shipping": 440000.00 }
      ],
      "total": 680000.00
    },
    "inbound_shipping": {
      "details": [
        { "location_id": 1, "location_name": "Toko Bogor", "inbound_count": 5, "total_shipping": 250000.00 }
      ],
      "total": 450000.00
    },
    "grand_total": 1130000.00
  }
}
```

### 3.8 HPP Comparison Report (`hppComparisonReport`)

```json
{
  "report": {
    "products": [
      {
        "product_id": 5,
        "product_name": "Mangga Harum Manis",
        "sku": "BUH-00005",
        "category": "Buah Tropis",
        "locations": [
          { "location_id": 1, "location_name": "Toko Bogor", "avg_cost": 25000.00, "quantity": 45.50 },
          { "location_id": 2, "location_name": "Toko Depok", "avg_cost": 27500.00, "quantity": 30.00 }
        ],
        "min_cost": 25000.00,
        "max_cost": 27500.00,
        "spread": 2500.00
      }
    ],
    "total_items": 12
  }
}
```

---

## 4. Arsitektur & Keputusan Teknis

1. **Single ReportService:** Semua 8 laporan ada dalam satu service file untuk kohesi. Jika berkembang besar, bisa dipecah nanti.
2. **Qualified Column Names:** Semua query menggunakan `table.column` format untuk menghindari error `ambiguous column` saat JOIN.
3. **P&L Formula:** Mengikuti SRS v1.2 Bab 5.4 secara ketat:
   - `Revenue − COGS = Laba Kotor`
   - `Laba Kotor − Ongkir − Waste − Mutasi Loss = Laba Operasional`
4. **FR-907 Enforcement:** Shift report menggunakan `$userId` filter di service level. Controller mendeteksi role dan men-scope otomatis.
5. **Shipping Cost Split:** Laporan ongkir memisahkan antara ongkir dari transaksi online (ditanggung pembeli) dan ongkir inbound/pengiriman dari supplier (ditanggung toko).
6. **HPP Spread Analysis:** HPP Comparison menghitung `spread` (selisih max-min avg_cost) per produk antar toko, membantu Owner melihat inkonsistensi HPP.
7. **Default Period:** Semua laporan default ke bulan ini (awal bulan sampai hari ini), kecuali Inventory dan HPP yang bersifat real-time (tanpa filter tanggal).

---

## 5. FR Coverage

| FR | Requirement | Status |
|----|-------------|--------|
| FR-902 | Laba-rugi: Revenue - COGS - Ongkir - Waste - Loss | ✅ `profitLoss()` |
| FR-903 | Penjualan per kanal: Offline per toko vs Online per platform | ✅ `salesByChannel()` |
| FR-904 | Stok real-time + avg_cost per toko. Filter low stock | ✅ `inventoryReport()` |
| FR-905 | Tren waste per item per bulan | ✅ `wasteReport()` |
| FR-906 | Shift per kasir: transaksi, penjualan, selisih | ✅ `shiftReport()` |
| FR-907 | Kasir/Admin hanya lihat shift sendiri | ✅ Controller scoping |
| FR-1205 | Laporan transaksi dengan diskon | ✅ `discountReport()` |
| FR-1218 | Total ongkir per toko per periode | ✅ `shippingCostReport()` |
| FR-1111 | Perbandingan HPP avg_cost per toko per produk | ✅ `hppComparisonReport()` |
