# Sprint 9 — Frontend Guide: Modul Laporan (Reports)

**Tanggal:** 11 Mei 2026  
**Untuk:** Tim Frontend  
**Backend Status:** ✅ Selesai — 8 endpoint Inertia siap diintegrasikan

---

## 1. Halaman yang Perlu Dibuat (8 halaman)

| # | File | Route | Route Name | RBAC |
|---|------|-------|------------|------|
| 1 | `Pages/Reports/ProfitLoss.jsx` | `/reports/profit-loss` | `reports.profit-loss` | Owner |
| 2 | `Pages/Reports/Sales.jsx` | `/reports/sales` | `reports.sales` | Owner |
| 3 | `Pages/Reports/Inventory.jsx` | `/reports/inventory` | `reports.inventory` | Owner |
| 4 | `Pages/Reports/Waste.jsx` | `/reports/waste` | `reports.waste` | Owner |
| 5 | `Pages/Reports/Shifts.jsx` | `/reports/shifts` | `reports.shifts` | All |
| 6 | `Pages/Reports/Discounts.jsx` | `/reports/discounts` | `reports.discounts` | Owner |
| 7 | `Pages/Reports/ShippingCosts.jsx` | `/reports/shipping-costs` | `reports.shipping-costs` | Owner |
| 8 | `Pages/Reports/HppComparison.jsx` | `/reports/hpp-comparison` | `reports.hpp-comparison` | Owner |

---

## 2. Sidebar Navigation

Tambahkan grup menu **"Laporan"** di `Sidebar.jsx` untuk Owner:

```jsx
// Grup: Laporan (Owner)
{
    label: 'Laporan',
    icon: <BarChart3 className="w-5 h-5" />,
    children: [
        { label: 'Laba Rugi',         href: '/reports/profit-loss' },
        { label: 'Penjualan',         href: '/reports/sales' },
        { label: 'Laporan Stok',      href: '/reports/inventory' },
        { label: 'Laporan Waste',     href: '/reports/waste' },
        { label: 'Laporan Shift',     href: '/reports/shifts' },
        { label: 'Laporan Diskon',    href: '/reports/discounts' },
        { label: 'Biaya Ongkir',     href: '/reports/shipping-costs' },
        { label: 'Komparasi HPP',    href: '/reports/hpp-comparison' },
    ],
}
```

Untuk non-owner, hanya tampilkan:
```jsx
{ label: 'Laporan Shift Saya', href: '/reports/shifts' }
```

---

## 3. Reusable Components

### 3.1 Filter Bar (digunakan di hampir semua halaman)

```jsx
function ReportFilterBar({ filters, locations, showDateRange = true, showLocation = true, extraFilters }) {
    const handleChange = (key, value) => {
        router.get(window.location.pathname, { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    return (
        <div className="flex flex-wrap gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-6">
            {showDateRange && (
                <>
                    <input type="date" className="form-input text-sm" value={filters.startDate}
                        onChange={(e) => handleChange('start_date', e.target.value)} />
                    <span className="text-gray-400 self-center">—</span>
                    <input type="date" className="form-input text-sm" value={filters.endDate}
                        onChange={(e) => handleChange('end_date', e.target.value)} />
                </>
            )}
            {showLocation && (
                <select className="form-input text-sm" value={filters.locationId || ''}
                    onChange={(e) => handleChange('location_id', e.target.value)}>
                    <option value="">Semua Toko</option>
                    {locations?.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
            )}
            {extraFilters}
        </div>
    );
}
```

### 3.2 Report Card (metric display)

```jsx
function ReportMetric({ label, value, color = 'text-gray-900', prefix = '' }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{prefix}{value}</p>
        </div>
    );
}
```

---

## 4. Detail Implementasi per Halaman

### 4.1 Laba Rugi (`ProfitLoss.jsx`)

**Props:**
```jsx
{ report, locations, filters }
```

**Layout:**
- **Metric Cards (top):** Revenue, COGS, Laba Kotor, Ongkir, Waste, Laba Operasional, Margin %
- **Visual:** Waterfall chart atau breakdown bar (Revenue → deductions → Net Profit)
- **Table:** Rincian komponen P&L

**Styling:**
- Revenue & Laba → Emerald/Green
- Deductions (COGS, Ongkir, Waste) → Red/Amber
- Net Profit → Blue (bold, prominent)
- Margin → Badge (hijau jika > 30%, kuning jika 15-30%, merah jika < 15%)

### 4.2 Penjualan per Kanal (`Sales.jsx`)

**Props:**
```jsx
{ report, locations, filters }
// report.details = array per type+platform+location
// report.summary = { offline: {...}, online: {...} }
```

**Layout:**
- **Summary Cards:** Offline Revenue vs Online Revenue (with transaction count)
- **Pie/Donut Chart:** Proporsi offline vs online
- **Detail Table:** Grouped by type → platform → location

**Styling:**
- Offline → Blue badges/accents
- Online → Purple badges/accents

### 4.3 Laporan Stok (`Inventory.jsx`)

**Props:**
```jsx
{ report, locations, filters }
// report.items = array of inventory per product per location
// report.total_items, report.total_stock_value
```

**Layout:**
- **Filter:** Location dropdown + toggle "Hanya Low Stock" (checkbox)
- **Summary Cards:** Total SKU, Total Nilai Stok
- **Table:** Produk, SKU, Kategori, Toko, Stok, Avg Cost, Nilai Stok

**Toggle Low Stock:**
```jsx
<label className="flex items-center gap-2">
    <input type="checkbox" checked={filters.lowStockOnly}
        onChange={(e) => handleChange('low_stock_only', e.target.checked ? '1' : '')} />
    <span className="text-sm">Hanya Tampilkan Stok Rendah</span>
</label>
```

### 4.4 Laporan Waste (`Waste.jsx`)

**Props:**
```jsx
{ report, locations, filters }
// report.by_product = top waste products
// report.monthly_trend = monthly chart data
// report.by_location = per location
```

**Layout:**
- **Summary Cards:** Total Qty, Total Nilai HPP Waste
- **Line/Bar Chart:** `monthly_trend` (X: month, Y: total_value)
- **Table 1:** By Product (sorted by value desc)
- **Table 2:** By Location

**Chart Data:**
```js
// recharts: monthly_trend
// X: month, Y: total_value
```

### 4.5 Laporan Shift (`Shifts.jsx`)

**Props:**
```jsx
{ report, locations, filters }
// report.shifts = array with total_transactions and total_sales enriched
// report.summary = { total_sales, total_transactions, total_difference }
```

**Layout:**
- **Summary Cards:** Total Shift, Total Penjualan, Total Selisih Kas
- **Table:** Kasir, Toko, Jam Buka/Tutup, Transaksi, Penjualan, Saldo Harapan, Saldo Aktual, Selisih

**Styling Selisih Kas:**
```jsx
<span className={shift.difference < 0 ? 'text-red-600 font-bold' : 'text-emerald-600'}>
    {formatRupiah(shift.difference)}
</span>
```

**FR-907 Note:** Backend sudah mem-filter per user untuk non-owner. Frontend tidak perlu melakukan filtering tambahan.

### 4.6 Laporan Diskon (`Discounts.jsx`)

**Props:**
```jsx
{ report, locations, filters }
// report.transactions = array of discounted transactions
// report.total_discount, report.count
```

**Layout:**
- **Summary Cards:** Jumlah TRX Diskon, Total Nilai Diskon
- **Table:** No. TRX, Tipe, Subtotal, Diskon, Catatan Diskon, Total, Kasir, Toko, Waktu

### 4.7 Biaya Ongkir (`ShippingCosts.jsx`)

**Props:**
```jsx
{ report, locations, filters }
// report.transaction_shipping = { details, total }
// report.inbound_shipping = { details, total }
// report.grand_total
```

**Layout:**
- **Summary Cards:** Ongkir Penjualan, Ongkir Inbound (Procurement), Grand Total
- **Table 1:** Ongkir per Toko (dari transaksi online)
- **Table 2:** Ongkir per Toko (dari inbound/pengadaan)

### 4.8 Komparasi HPP (`HppComparison.jsx`)

**Props:**
```jsx
{ report, locations, filters }
// report.products = array grouped by product with locations array
// report.total_items
```

**Layout:**
- **Filter:** Location dropdown (optional)
- **Table:** Produk, SKU, Kategori, lalu kolom per toko (avg_cost), Min, Max, Spread

**Spread Badge:**
```jsx
<span className={spread > 5000 ? 'text-red-600 font-bold' : spread > 1000 ? 'text-amber-600' : 'text-emerald-600'}>
    {formatRupiah(spread)}
</span>
```

---

## 5. Utility: Format Rupiah

Gunakan helper ini secara konsisten di semua halaman:

```jsx
const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};
```

---

## 6. Filter Handling Pattern

Semua halaman laporan menggunakan pola yang sama untuk filter:

```jsx
const handleFilter = (key, value) => {
    router.get(window.location.pathname, {
        ...filters,
        [key]: value || undefined,
    }, { preserveState: true, replace: true });
};
```

---

## 7. Breadcrumbs Pattern

```jsx
<AppLayout title="Laporan Laba Rugi" breadcrumbs={[
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Laporan' },
    { label: 'Laba Rugi' },
]}>
```

---

## 8. Dependensi Chart

Library `recharts` sudah terinstall (dari Sprint 9 Dashboard). Gunakan untuk:
- `ProfitLoss.jsx` → Waterfall/Bar chart
- `Sales.jsx` → Pie chart
- `Waste.jsx` → Line/Bar chart (monthly_trend)

---

## 9. Checklist Integrasi

- [ ] Buat folder `resources/js/Pages/Reports/`
- [ ] Buat `ReportFilterBar.jsx` component (reusable)
- [ ] Buat `ProfitLoss.jsx` — P&L statement dengan metric cards
- [ ] Buat `Sales.jsx` — Sales by channel + pie chart
- [ ] Buat `Inventory.jsx` — Stock report + low stock toggle
- [ ] Buat `Waste.jsx` — Waste trend + monthly chart
- [ ] Buat `Shifts.jsx` — Shift per kasir + selisih kas
- [ ] Buat `Discounts.jsx` — Daftar transaksi diskon
- [ ] Buat `ShippingCosts.jsx` — Ongkir breakdown
- [ ] Buat `HppComparison.jsx` — Perbandingan HPP per toko
- [ ] Update `Sidebar.jsx` — Tambah grup menu "Laporan"
- [ ] Test: semua filter (tanggal, lokasi) berfungsi
- [ ] Test: FR-907 — non-owner hanya lihat shift sendiri
