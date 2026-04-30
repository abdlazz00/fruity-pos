# Sprint 5 — Pricing Engine: Frontend Development Guideline

**Untuk:** Tim Frontend (React + Inertia.js)
**Tanggal:** 30 April 2026
**Backend Status:** ✅ Semua endpoint siap digunakan

---

## Daftar Halaman & Komponen yang Perlu Dibuat

| ID     | Komponen / Halaman           | Prioritas | Estimasi |
|--------|------------------------------|-----------|----------|
| S5-F01 | `Pricing/Index.jsx`          | ⭐ Tinggi  | 3h       |
| S5-F02 | `Pricing/Show.jsx`           | ⭐ Tinggi  | 4h       |
| S5-F03 | `MarginCalculator.jsx`       | ⭐ Tinggi  | 3h       |
| S5-F04 | `HPPRounder.jsx`             | Sedang    | 2h       |
| S5-F05 | `TierManager.jsx`            | Sedang    | 3h       |
| S5-F06 | Lock/Unlock Button           | ⭐ Tinggi  | 1h       |
| S5-F07 | Margin Preview per Toko      | Sedang    | 2h       |

---

## 1. Halaman `Pricing/Index.jsx` (S5-F01)

### Props dari Backend (Inertia)
```javascript
{
  prices: {                    // Paginated ProductPrice collection
    data: [
      {
        id: 1,
        product_id: 5,
        hpp_baseline: "12500.00",
        margin_percentage: "25.00",
        selling_price: "16000.00",
        rounding_to: 500,
        status: "locked",       // "pending" | "locked"
        locked_at: "2026-04-30 14:00:00",
        product: {
          id: 5,
          name: "Apel Fuji",
          sku: "APE-00001",
          category: { id: 1, name: "Buah Impor" }
        },
        locker: { id: 1, name: "Pak Andi" },
        tiers: [
          { id: 1, label: "Ecer", min_qty: 1, selling_price: "16000.00" },
          { id: 2, label: "Grosir", min_qty: 10, selling_price: "14500.00" }
        ]
      }
    ],
    links: { ... },
    meta: { ... }
  },
  unpricedProducts: [          // Produk aktif yang belum punya harga
    { id: 8, name: "Jeruk Bali", sku: "JER-00003", category: { ... } }
  ],
  locations: [                 // Daftar toko aktif
    { id: 1, name: "Toko Serpong", code: "SRP" }
  ]
}
```

### Desain UI yang Diharapkan
- **Tabel utama** menampilkan semua produk yang sudah diset harganya
- **Badge status**: warna hijau untuk `locked`, kuning untuk `pending`
- **Section terpisah** (atau tab) untuk `unpricedProducts` — produk yang belum punya harga
- **Filter** berdasarkan status (`pending` / `locked` / semua)
- **Tombol aksi** per baris: "Detail", "Lock"/"Unlock"
- Format mata uang: `Rp 16.000` (gunakan `Intl.NumberFormat('id-ID')`)

### Navigasi Sidebar
Tambahkan menu baru di `Sidebar.jsx`:
```javascript
{
  label: 'Pricing Engine',
  href: '/pricing',
  icon: 'TagIcon',          // atau icon yang sesuai
  roles: ['owner']           // Hanya owner
}
```

---

## 2. Halaman `Pricing/Show.jsx` (S5-F02)

### Props dari Backend
```javascript
{
  price: { ... },              // ProductPrice object (sama seperti di Index)
  avgCostBreakdown: [          // HPP per toko (S5-B09)
    {
      location_id: 1,
      location_name: "Toko Serpong",
      location_code: "SRP",
      quantity: "150.00",
      avg_cost: "11200.00"
    },
    {
      location_id: 2,
      location_name: "Toko BSD",
      location_code: "BSD",
      quantity: "80.00",
      avg_cost: "12500.00"    // ← ini yang jadi hpp_baseline (MAX)
    }
  ]
}
```

### Desain UI yang Diharapkan
- **Info card** produk di bagian atas (nama, SKU, kategori, status)
- **Tabel komparasi HPP** per toko (dari `avgCostBreakdown`):
  - Kolom: Toko, Kode, Stok, HPP (avg_cost)
  - Baris dengan avg_cost tertinggi di-highlight (karena ini baseline)
- **Form margin calculator** di samping/bawah tabel
- **Tabel multi-tier pricing** jika ada

---

## 3. Komponen `MarginCalculator.jsx` (S5-F03)

### Fitur Utama
- Input **margin percentage** (slider + number input)
- Input **pembulatan** (dropdown: 0, 100, 500, 1000)
- **Preview real-time** harga jual tanpa menyimpan

### API untuk Preview (tanpa save)
```javascript
// POST /api/pricing/preview
const response = await axios.post('/api/pricing/preview', {
  product_id: 5,
  margin_percentage: 25,
  rounding_to: 500
});

// Response:
{
  hpp_baseline: 12500.00,
  margin: 25,
  rounding_to: 500,
  selling_price: 16000.00
}
```

### API untuk Simpan
```javascript
// POST /pricing (baru) atau PUT /pricing/{id} (update)
router.post('/pricing', {
  product_id: 5,
  margin_percentage: 25,
  rounding_to: 500
});
```

### Contoh Kalkulasi yang Ditampilkan
```
HPP Baseline    : Rp 12.500
Margin (25%)    : Rp  3.125
Subtotal        : Rp 15.625
Pembulatan (500): Rp 16.000  ← Harga Jual Final
```

---

## 4. Komponen `HPPRounder.jsx` (S5-F04)

### Fitur
- Dropdown pilihan pembulatan: `Tidak ada (0)`, `Rp 100`, `Rp 500`, `Rp 1.000`
- Preview harga sebelum dan sesudah pembulatan
- Terintegrasi dengan `MarginCalculator`

---

## 5. Komponen `TierManager.jsx` (S5-F05)

### Fitur
- Tabel editable untuk mengelola tier harga
- Tombol "Tambah Tier" dan "Hapus"
- Setiap tier: `label` (text), `min_qty` (number), `selling_price` (number)

### API untuk Sync Tiers
```javascript
// PUT /pricing/{id}/tiers
router.put(`/pricing/${priceId}/tiers`, {
  tiers: [
    { label: "Ecer", min_qty: 1, selling_price: 16000 },
    { label: "Grosir", min_qty: 10, selling_price: 14500 },
    { label: "Reseller", min_qty: 50, selling_price: 13000 }
  ]
});
```

---

## 6. Tombol Lock / Unlock (S5-F06)

### Implementasi
```javascript
// Lock
router.patch(`/pricing/${priceId}/lock`);

// Unlock
router.patch(`/pricing/${priceId}/unlock`);
```

### UX yang Diharapkan
- **Lock**: Tombol hijau dengan ikon gembok. Tampilkan dialog konfirmasi:
  > "Apakah Anda yakin ingin mengunci harga **Apel Fuji** sebesar **Rp 16.000**?
  > Produk akan langsung tersedia di POS semua toko."
- **Unlock**: Tombol merah/kuning. Tampilkan peringatan:
  > "Produk ini akan dihapus dari POS dan tidak bisa dijual sampai di-lock kembali."

---

## 7. Preview Margin per Toko (S5-F07)

### API untuk Data HPP per Toko
```javascript
// GET /api/pricing/breakdown/{productId}
const response = await axios.get(`/api/pricing/breakdown/${productId}`);

// Response:
{
  breakdown: [
    { location_name: "Toko Serpong", avg_cost: "11200.00", quantity: "150.00" },
    { location_name: "Toko BSD",    avg_cost: "12500.00", quantity: "80.00" }
  ],
  baseline: 12500.00
}
```

### Fitur UI
- Di samping harga jual, tampilkan kolom "Margin Aktual" per toko:
  - Toko Serpong: `margin = (16000 - 11200) / 11200 * 100 = 42.86%` ← untung besar
  - Toko BSD: `margin = (16000 - 12500) / 12500 * 100 = 28.00%` ← margin minimal
- Warnai hijau jika margin > 20%, kuning jika 10-20%, merah jika < 10%

---

## Utility Functions yang Disarankan

```javascript
// utils/currency.js
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// utils/pricing.js
export function calculateMarginActual(sellingPrice, avgCost) {
  if (avgCost <= 0) return 0;
  return ((sellingPrice - avgCost) / avgCost * 100).toFixed(2);
}

export function getMarginColor(marginPercent) {
  if (marginPercent >= 20) return 'text-emerald-600';
  if (marginPercent >= 10) return 'text-amber-500';
  return 'text-red-500';
}
```

---

## Flash Messages

Backend mengirim flash message via Inertia `with('status', '...')`. Tangani di komponen menggunakan:
```javascript
const { flash } = usePage().props;

useEffect(() => {
  if (flash?.status) {
    // Tampilkan toast/notification sukses
  }
}, [flash]);
```

---

## Catatan Penting

1. **Semua endpoint pricing** berada di bawah middleware `role:owner`. Hanya Owner yang bisa mengakses.
2. **`hpp_baseline`** dihitung otomatis oleh backend. Frontend **tidak perlu** menghitung sendiri.
3. **Preview endpoint** (`POST /api/pricing/preview`) bisa dipanggil berkali-kali tanpa menyimpan data — ideal untuk kalkulasi real-time di form.
4. **Broadcast** via `PriceLocked` event sudah disiapkan di backend. Untuk mendengarkan di frontend (POS nanti di Sprint 6), gunakan Laravel Echo:
   ```javascript
   Echo.channel('pricing')
     .listen('PriceLocked', (e) => {
       console.log('Price updated:', e);
       // Refresh katalog POS
     });
   ```
