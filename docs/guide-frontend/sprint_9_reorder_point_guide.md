# Sprint 9 — Frontend Guide: Reorder Point Module

**Tanggal:** 11 Mei 2026  
**Untuk:** Tim Frontend  
**Backend Status:** ✅ Selesai dan siap diintegrasikan

---

## 1. Halaman yang Perlu Dibuat

### 1.1 `ReorderPointIndex.jsx` — Halaman Daftar Reorder Point

**Route:** `GET /inventory/reorder-points`  
**Route Name:** `reorder-points.index`  
**RBAC:** Owner + Stockist

#### Props dari Backend (Inertia)

```js
{
  reorderPoints: {
    data: [
      {
        id: 1,
        product_id: 5,
        location_id: 2,
        min_quantity: "10.00",
        is_active: true,
        last_notified_at: "2026-05-11 10:00:00",
        created_by: 3,
        updated_by: 3,
        created_at: "2026-05-11T03:00:00.000000Z",
        updated_at: "2026-05-11T03:00:00.000000Z",
        product: {
          id: 5,
          name: "Mangga Harum Manis",
          sku: "BUA-00005",
          base_uom: "kg"
        },
        location: {
          id: 2,
          name: "Toko Depok",
          code: "DPK"
        },
        creator: { id: 3, name: "Stockist A" },
        updater: { id: 3, name: "Stockist A" }
      }
    ],
    current_page: 1,
    last_page: 3,
    per_page: 20,
    total: 45
    // ... pagination meta standar Laravel
  },
  lowStockAlerts: [
    // Array item reorder point yang stoknya SUDAH di bawah threshold
    // Gunakan untuk menampilkan badge/warning di UI
    {
      id: 1,
      product: { name: "Mangga Harum Manis", sku: "BUA-00005" },
      location: { name: "Toko Depok" },
      min_quantity: "10.00"
      // current stock TIDAK ada di sini, fetch terpisah jika butuh
    }
  ],
  locations: [
    { id: 1, name: "Toko Bogor", code: "BGR" },
    { id: 2, name: "Toko Depok", code: "DPK" }
  ],
  filters: {
    location_id: null  // atau integer jika ada filter aktif
  }
}
```

#### Fitur UI yang Diharapkan

1. **Tabel** dengan kolom:
   - Produk (nama + SKU)
   - Toko (nama)
   - Min. Stok (+ satuan `base_uom`)
   - Status (badge aktif/nonaktif)
   - Terakhir Alert (format relatif, e.g. "2 jam lalu")
   - Aksi (edit, toggle, hapus)

2. **Filter lokasi** (dropdown) — Owner bisa pilih semua toko, Stockist auto-filter ke toko sendiri.

3. **Low Stock Alert Banner** — Tampilkan banner/card di atas tabel jika `lowStockAlerts.length > 0`:
   > ⚠️ {count} produk stoknya di bawah batas minimum!

4. **Tombol "Set Reorder Point"** → navigasi ke `/inventory/reorder-points/create`

5. **Pagination** — Gunakan komponen pagination yang sudah ada.

#### Aksi pada Tabel

| Aksi | Method | Endpoint |
|------|--------|----------|
| Toggle aktif/nonaktif | `PATCH` | `/inventory/reorder-points/{id}/toggle` |
| Hapus | `DELETE` | `/inventory/reorder-points/{id}` |

---

### 1.2 `ReorderPointForm.jsx` — Form Set/Edit Reorder Point

**Route:** `GET /inventory/reorder-points/create`  
**Route Name:** `reorder-points.create`  
**RBAC:** Owner + Stockist

#### Props dari Backend (Inertia)

```js
{
  products: [
    {
      id: 5,
      name: "Mangga Harum Manis",
      sku: "BUA-00005",
      base_uom: "kg",
      category: "Buah",
      current_stock: 8.5  // Stok saat ini di lokasi yang dipilih
    }
  ],
  locations: [
    { id: 1, name: "Toko Bogor" },
    { id: 2, name: "Toko Depok" }
  ],
  filters: {
    location_id: null
  }
}
```

#### Form Fields

| Field | Type | Validasi | Keterangan |
|-------|------|----------|------------|
| `location_id` | Dropdown | Required | Stockist: auto-filled & disabled. Owner: pilih bebas. |
| `product_id` | Dropdown/Searchable | Required | List produk aktif di toko yang dipilih |
| `min_quantity` | Number Input | Required, min 0.01 | Tampilkan satuan `base_uom` di sebelah input |

#### Submit

```js
// POST /inventory/reorder-points
router.post(route('reorder-points.store'), {
  product_id: selectedProduct,
  location_id: selectedLocation,
  min_quantity: minQty
});
```

#### Catatan Penting
- Backend melakukan **upsert**: jika threshold sudah ada untuk `product_id + location_id`, akan di-update (bukan error).
- Tampilkan stok saat ini (`current_stock`) di samping nama produk sehingga user bisa membuat keputusan informatif.
- Ketika user mengganti `location_id`, lakukan `reload` halaman dengan query param `?location_id=X` untuk mendapatkan data stok yang tepat.

---

### 1.3 Inline Edit (Optional — Alternative ke Form)

Jika ingin edit langsung dari tabel `ReorderPointIndex`, bisa gunakan inline edit:

```js
// PUT /inventory/reorder-points/{id}
router.put(route('reorder-points.update', id), {
  min_quantity: newMinQty
});
```

---

## 2. API Endpoint untuk Dashboard

### Low Stock Alerts

```js
// GET /api/reorder-points/low-stock?location_id=2
const response = await fetch(route('reorder-points.low-stock', { location_id: 2 }));
// Response:
{
  alerts: [...],  // Array of ReorderPoint objects with product & location
  count: 5
}
```

Gunakan ini di **Owner Dashboard** (Sprint 9 - Dashboard) untuk menampilkan:
- KPI Card: "X produk low stock"
- Widget daftar produk dengan stok menipis

---

## 3. Integrasi Sidebar

Tambahkan menu baru di `Sidebar.jsx` di bawah grup **Inventori**:

```jsx
// Untuk role: owner, stockist
{
  label: 'Reorder Point',
  icon: AlertTriangle,  // atau icon Bell/ShoppingCart dari lucide-react
  href: route('reorder-points.index'),
  active: route().current('reorder-points.*'),
}
```

---

## 4. Notifikasi Bell Icon

Backend akan mengirim notifikasi bertipe `low_stock_alert` melalui channel `database` (sama seperti waste, mutation, inbound notifications yang sudah ada).

### Struktur Notifikasi

```js
{
  type: "low_stock_alert",
  product_id: 5,
  product_name: "Mangga Harum Manis",
  location_id: 2,
  location_name: "Toko Depok",
  current_stock: 3.5,
  min_quantity: "10.00",
  message: "Stok Mangga Harum Manis di Toko Depok tinggal 3.5 (min: 10.00). Segera lakukan pengadaan!"
}
```

Di `NotificationDropdown` yang sudah ada, tambahkan handler untuk `type === 'low_stock_alert'`:
- Icon: ⚠️ (warning)
- Warna: Amber/Yellow
- Klik: navigasi ke `/inventory/reorder-points`

---

## 5. Design Reference

### Warna & Badge

| Status | Warna Badge | Teks |
|--------|-------------|------|
| Aktif | `bg-emerald-100 text-emerald-700` | Aktif |
| Nonaktif | `bg-gray-100 text-gray-500` | Nonaktif |
| Low Stock (stok < min) | `bg-amber-100 text-amber-700` | ⚠ Stok Rendah |
| Out of Stock (stok = 0) | `bg-red-100 text-red-700` | ❌ Habis |

### Layout

- Gunakan layout yang konsisten dengan halaman inventori lain (`MutationIndex`, `WasteIndex`, `OpnameIndex`).
- Filter bar di atas tabel (dropdown lokasi + tombol "Set Reorder Point").
- Alert banner jika ada low stock alerts.

---

## 6. Daftar Route Frontend

| Nama Route | URL | Method | Body |
|------------|-----|--------|------|
| `reorder-points.index` | `/inventory/reorder-points` | `GET` | — |
| `reorder-points.create` | `/inventory/reorder-points/create` | `GET` | `?location_id=X` |
| `reorder-points.store` | `/inventory/reorder-points` | `POST` | `{ product_id, location_id, min_quantity }` |
| `reorder-points.update` | `/inventory/reorder-points/{id}` | `PUT` | `{ min_quantity }` |
| `reorder-points.toggle` | `/inventory/reorder-points/{id}/toggle` | `PATCH` | — |
| `reorder-points.destroy` | `/inventory/reorder-points/{id}` | `DELETE` | — |
| `reorder-points.low-stock` | `/api/reorder-points/low-stock` | `GET` | `?location_id=X` |

---

## 7. Checklist Integrasi

- [ ] Buat `ReorderPointIndex.jsx` di `resources/js/Pages/Inventory/`
- [ ] Buat `ReorderPointForm.jsx` di `resources/js/Pages/Inventory/`
- [ ] Tambahkan menu "Reorder Point" di `Sidebar.jsx` (Owner + Stockist)
- [ ] Handler notifikasi `low_stock_alert` di `NotificationDropdown`
- [ ] Low stock alert widget di Owner Dashboard (Sprint 9 berikutnya)
- [ ] Test: set reorder point → buat transaksi yang menurunkan stok → verifikasi notifikasi muncul
