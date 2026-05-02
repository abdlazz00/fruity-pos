# 🎨 Sprint 6 Frontend Guideline — POS & Shift Management

Dokumen ini adalah panduan bagi developer frontend untuk mengimplementasikan UI Sprint 6.

---

## 1. Halaman yang Perlu Dibuat

| ID | Halaman | File | Role | Prioritas |
|----|---------|------|------|-----------|
| S6-F01 | Shift Saya (Index) | `Pages/Shift/Index.jsx` | Kasir, Admin | 🔴 Tinggi |
| S6-F02 | POS Offline (Kasir) | `Pages/Pos/Offline.jsx` | Kasir | 🔴 Tinggi |
| S6-F03 | POS Online (Admin) | `Pages/Pos/Online.jsx` | Admin | 🟡 Sedang |

---

## 2. S6-F01: Halaman Shift Saya (`/shift`)

### Props dari Backend
```js
{
  activeShift: null | { id, user_id, location_id, opened_at, opening_balance, status, transactions: [...] },
  shifts: { data: [...], links: {...} }  // Paginated history
}
```

### State Machine UI
**State A: Belum Ada Shift Aktif (`activeShift === null`)**
- Tampilkan card center layar dengan ikon jam besar (48px, `#9CA3AF`)
- Teks: "Belum ada shift aktif"
- Tombol Primary: "Buka Shift" → buka **Modal Buka Shift**

**Modal Buka Shift:**
- Input: `opening_balance` (format Rupiah, default 0)
- Tombol: "Buka Shift" (POST `/shift/open`)

**State B: Shift Aktif (`activeShift.status === 'open'`)**
- Info bar: Nama User, Lokasi, Waktu Buka
- **4 KPI Cards:**
  - Total Transaksi (count dari `activeShift.transactions`)
  - Pemasukan Tunai (sum total where payment_method=cash)
  - Non-Tunai (sum total where payment_method != cash)
  - Saldo Berjalan (opening_balance + cash income)
- Tabel transaksi ringkas (No. TRX, Waktu, Total, Metode)
- Tombol Danger: "Tutup Shift" → buka **Modal Tutup Shift**

**Modal Tutup Shift:**
- Readonly: Saldo Seharusnya (calculated)
- Input: `actual_balance` (saldo fisik aktual)
- Display: Selisih (hijau jika pas/lebih, merah jika kurang)
- Tombol: "Tutup Shift" (PATCH `/shift/{id}/close`)

---

## 3. S6-F02: POS Offline (`/pos/offline`)

### Props dari Backend
```js
{
  shift: { id, opening_balance, ... },
  catalog: [{ product_id, name, sku, category, image_path, selling_price, stock, in_stock, tiers: [...] }],
  transactions: [...] // Recent transactions in this shift
}
```

### Layout (Sesuai Design Spec #13)
- **Sidebar auto-collapse** ke 64px saat halaman POS terbuka
- **2 Kolom:** 65% Katalog (kiri) + 35% Keranjang (kanan)

### Kolom Kiri: Katalog Produk
- Search bar besar di atas
- Filter tabs per kategori (opsional)
- Grid 3 kolom card produk:
  - Foto produk (atau placeholder icon buah)
  - Nama produk
  - Harga jual (`selling_price`) dalam warna `#2C6E49`
  - **TANPA HPP / MARGIN** (kolom ini TIDAK BOLEH ditampilkan)
  - Disabled/grey jika `in_stock === false`
  - Klik card → tambah ke keranjang

### Kolom Kanan: Keranjang
- Header: "Keranjang" + item count
- List item: Nama, Qty (+/- buttons), Harga satuan, Subtotal, Hapus
- Input gramasi: Angka besar 32px, validasi error merah jika melebihi stok
- Diskon field (expandable): `discount_amount` + `discount_note`
- Total: 24px bold
- Dua tombol bawah:
  - "Hold" secondary (opsional, stretch goal)
  - "Bayar" primary → buka **Modal Pembayaran**

### Modal Pembayaran
- Total besar hijau (`#2C6E49`) di atas
- Pills metode: Cash | Transfer | E-Wallet
- Quick-amount buttons (Rp 10.000, 20.000, 50.000, 100.000)
- Input pembayaran
- Kembalian (hijau jika cash, 0 jika non-cash)
- Tombol: "Selesaikan Transaksi" (POST `/pos/offline`)
- Setelah sukses: flash message + reset keranjang

---

## 4. S6-F03: POS Online (`/pos/online`)

### Props dari Backend
```js
{
  shift: { id, ... },
  catalog: [...] // Same format as POS Offline
}
```

### Layout (Sesuai Design Spec #14)
- Sidebar tetap expanded 240px
- **4 Stacked Cards** (form vertikal):

**Card 1: Data Pelanggan**
- Input: `customer_name`, `customer_phone`, `customer_address`
- Dropdown: `platform` (WhatsApp, Grab, GoFood, Shopee, Lainnya)

**Card 2: Item Pesanan**
- Dropdown autocomplete pilih produk → otomatis isi harga
- Tabel item (Produk, Harga readonly, Qty, Subtotal)
- **TANPA HPP / MARGIN**

**Card 3: Pengiriman**
- Input: `courier`, `shipping_method`
- Input: `shipping_cost` (Rupiah)

**Card 4: Pembayaran**
- Pills metode: Cash | Transfer | E-Wallet
- Input: `discount_amount` + `discount_note`
- Breakdown: Subtotal - Diskon + Ongkir = **Total**
- Tombol: "Simpan Pesanan" (POST `/pos/online`)

---

## 5. Aturan Keamanan UI

| Rule | Keterangan |
|------|------------|
| ❌ HPP | TIDAK BOLEH ditampilkan di halaman POS manapun |
| ❌ Margin | TIDAK BOLEH ditampilkan di halaman POS manapun |
| ❌ avg_cost | TIDAK BOLEH ditampilkan di halaman POS manapun |
| ✅ Harga Jual | Yang ditampilkan hanya `selling_price` dari `product_prices` |
| ✅ Stok | Boleh ditampilkan sebagai indikator ketersediaan |

---

## 6. Komponen Reusable yang Dibutuhkan

| Komponen | Dipakai Di | Catatan |
|----------|-----------|---------|
| `Badge` | Shift status, Payment method | Sudah ada |
| `Button` | Semua aksi | Sudah ada |
| `Modal` | Buka/Tutup Shift, Pembayaran | Sudah ada |
| `AppLayout` | Wrapper halaman | Sudah ada |
| `ProductCard` | Grid katalog POS | **Baru** |
| `CartItem` | List item keranjang | **Baru** |
| `PaymentModal` | Modal checkout | **Baru** |

---

## 7. Color Token Reference (dari Design System)

| Elemen | Token/Hex |
|--------|-----------|
| Harga jual di katalog | `#2C6E49` (Secondary) |
| Tombol Bayar | `#2C6E49` (Primary button) |
| Tombol Tutup Shift | `#DC2626` (Danger button) |
| Kembalian | `#16A34A` (Success) |
| Stok habis | `#9CA3AF` (Muted) + opacity 60% |
| Background POS | `#F3F4F6` (Page bg) |
| Header tabel | `#1A3636` (Primary) |
