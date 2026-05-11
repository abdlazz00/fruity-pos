# Sprint 9 — Frontend Guide: Owner Dashboard

**Tanggal:** 11 Mei 2026  
**Untuk:** Tim Frontend  
**Backend Status:** ✅ Selesai dan siap diintegrasikan

---

## 1. Halaman yang Perlu Dibuat / Diperbarui

### 1.1 `Dashboard.jsx` (Update)

**Route:** `GET /dashboard`  
**Route Name:** `dashboard`  
**RBAC:** Owner only

> Halaman ini sudah ada sebagai placeholder. Perlu diperbarui menjadi dashboard KPI penuh.

---

## 2. Inertia Props yang Tersedia

Semua data sudah disuplai oleh `DashboardController@index` melalui Inertia. Berikut props yang diterima:

```jsx
export default function Dashboard({
    kpi,                // Object: KPI metrics
    revenueByStore,     // Array: revenue per toko
    revenueTrend,       // Array: daily revenue 7 hari terakhir
    topProducts,        // Array: top 5 produk terlaris
    salesByChannel,     // Array: breakdown offline vs online
    recentTransactions, // Array: 10 transaksi terbaru
    locations,          // Array: daftar toko untuk filter
    filters             // Object: { start_date, end_date, location_id }
}) { ... }
```

---

## 3. Komponen yang Perlu Dibuat

### 3.1 Filter Bar

Filter di atas dashboard:
- **Date Range Picker:** `start_date` dan `end_date` (default: hari ini)
- **Lokasi Dropdown:** Pilih "Semua Toko" atau spesifik satu toko

```jsx
const handleFilter = (newFilters) => {
    router.get('/dashboard', { ...filters, ...newFilters }, { preserveState: true });
};
```

### 3.2 KPI Cards (`S9-F02`)

5 card utama dalam satu baris:

| Card | Data Source | Format | Warna Aksen |
|------|------------|--------|-------------|
| Revenue | `kpi.revenue` | `Rp X.XXX.XXX` | Emerald |
| Laba Bersih | `kpi.net_profit` | `Rp X.XXX.XXX` | Blue |
| Transaksi | `kpi.total_transactions` | Angka | Purple |
| Waste Pending | `kpi.waste_pending` | Angka + badge warning | Amber |
| Stok Rendah | `kpi.low_stock_count` | Angka + badge danger | Red |

#### KPI Tambahan (baris kedua / detail):

| Metrik | Data Source | Keterangan |
|--------|------------|------------|
| COGS (HPP) | `kpi.cogs` | Harga pokok penjualan |
| Laba Kotor | `kpi.gross_profit` | Revenue − COGS |
| Total Diskon | `kpi.discount` | Diskon yang diberikan |
| Ongkos Kirim | `kpi.shipping_cost` | Total ongkir transaksi online |
| Nilai Waste | `kpi.waste_value` | HPP waste yang disetujui |
| Rata-rata/TRX | `kpi.avg_transaction` | Revenue ÷ Jumlah Transaksi |

### 3.3 Revenue per Toko — Bar Chart (`S9-F03`)

```js
// Data: revenueByStore
// X-axis: location_name
// Y-axis: revenue
// Label tooltip: total_transactions transaksi
```

Rekomendasi: Gunakan **Chart.js** atau **Recharts** untuk rendering chart.

```bash
npm install recharts
# atau
npm install chart.js react-chartjs-2
```

### 3.4 Revenue Trend — Line Chart

```js
// Data: revenueTrend
// X-axis: label (e.g. "Sen, 05 Mei")
// Y-axis: revenue
// Secondary: transactions (opsional)
```

### 3.5 Penjualan per Channel — Pie/Donut Chart

```js
// Data: salesByChannel
// Segments: type ("offline" / "online")
// Value: revenue
// Label: total_transactions transaksi
```

### 3.6 Top 5 Produk Terlaris — Table/List

```js
// Data: topProducts
// Kolom: product_name, total_qty, total_revenue
// Urutan: by total_revenue desc (sudah di-sort backend)
```

### 3.7 Low Stock Alerts Widget (`S9-F04`)

Gunakan API `/api/reorder-points/low-stock` yang sudah tersedia dari modul Reorder Point:

```jsx
// Bisa di-fetch terpisah via useEffect atau gunakan kpi.low_stock_count untuk badge
const [alerts, setAlerts] = useState([]);
useEffect(() => {
    fetch(route('reorder-points.low-stock'))
        .then(res => res.json())
        .then(data => setAlerts(data.alerts));
}, []);
```

### 3.8 Transaksi Terbaru — Activity Feed

```js
// Data: recentTransactions
// List: transaction_number, type badge, total, cashier_name, location_name, created_at
// Warna type: offline=blue, online=purple
```

---

## 4. Layout Saran

```
┌──────────────────────────────────────────────────────────┐
│ Filter Bar: [Date Range] [Lokasi ▾]                       │
├──────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│ │Revenue│ │ Laba │ │ TRX  │ │Waste │ │Low   │  KPI Cards │
│ │      │ │Bersih│ │      │ │Pend. │ │Stock │           │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘           │
├──────────────────────────┬───────────────────────────────┤
│  Revenue Trend (Line)    │  Revenue per Toko (Bar)       │
│  7 hari terakhir         │  Horizontal bar chart         │
├──────────────────────────┼───────────────────────────────┤
│  Top 5 Produk (Table)    │  Penjualan per Channel (Pie)  │
│                          │  Offline vs Online            │
├──────────────────────────┼───────────────────────────────┤
│  Transaksi Terbaru       │  Low Stock Alerts             │
│  Activity Feed           │  Widget dari reorder-points   │
└──────────────────────────┴───────────────────────────────┘
```

---

## 5. Styling Guidelines

### KPI Card Component

```jsx
function KpiCard({ label, value, icon, color, subtext }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${color}/10`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
```

### Format Currency

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

## 6. API Endpoint JSON (untuk AJAX Refresh)

Jika ingin melakukan refresh tanpa full page reload:

```js
// GET /api/dashboard/kpi?start_date=2026-05-11&end_date=2026-05-11&location_id=1
const response = await axios.get(route('dashboard.kpi'), {
    params: { start_date, end_date, location_id }
});
// Response: sama dengan struktur kpi object di atas
```

---

## 7. Daftar Route Frontend

| Nama Route | URL | Method | Body/Params |
|------------|-----|--------|-------------|
| `dashboard` | `/dashboard` | `GET` | `?start_date=&end_date=&location_id=` |
| `dashboard.kpi` | `/api/dashboard/kpi` | `GET` | `?start_date=&end_date=&location_id=` |
| `reorder-points.low-stock` | `/api/reorder-points/low-stock` | `GET` | `?location_id=` |

---

## 8. Dependensi Chart (Opsional)

Untuk chart interaktif, install salah satu:

```bash
# Option A: Recharts (React-native charts)
npm install recharts

# Option B: Chart.js + React wrapper
npm install chart.js react-chartjs-2
```

---

## 9. Checklist Integrasi

- [ ] Update `Dashboard.jsx` dari placeholder menjadi full dashboard layout
- [ ] Buat komponen `KpiCard.jsx` (reusable card untuk metrik)
- [ ] Buat komponen `RevenueChart.jsx` (bar chart revenue per toko)
- [ ] Buat komponen `RevenueTrendChart.jsx` (line chart 7 hari)
- [ ] Buat komponen `SalesChannelChart.jsx` (pie/donut chart)
- [ ] Buat komponen `TopProductsTable.jsx` (top 5 terlaris)
- [ ] Buat komponen `RecentTransactions.jsx` (activity feed)
- [ ] Buat komponen `LowStockWidget.jsx` (alert produk stok rendah)
- [ ] Pasang filter bar (date range + lokasi dropdown)
- [ ] Install chart library (recharts/chart.js)
- [ ] Test: filter tanggal + filter lokasi memperbarui semua widget
