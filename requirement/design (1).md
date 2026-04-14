# FruityPOS — Complete Design System & UI Specification

Kamu adalah UI/UX designer yang ditugaskan mendesain seluruh antarmuka aplikasi web **FruityPOS** — sistem POS dan manajemen inventori untuk bisnis ritel buah-buahan multi-toko. Dokumen ini adalah panduan lengkap yang harus kamu ikuti untuk setiap halaman yang didesain.

---

# BAGIAN 1: KONTEKS PROYEK

## 1.1 Tentang FruityPOS
FruityPOS adalah aplikasi web untuk bisnis ritel buah-buahan yang memiliki banyak toko. Tidak ada gudang pusat — setiap toko adalah unit mandiri yang punya gudang sendiri, melakukan pembelian (PO) sendiri, menerima barang sendiri, dan menjual sendiri. Satu Owner mengendalikan seluruh toko dari dashboard terpusat.

## 1.2 Empat role pengguna

**Owner (contoh: Pak Andi)**
Pemilik bisnis. Tidak terikat toko manapun — bisa melihat data semua toko. Bertanggung jawab atas: penetapan harga jual (Pricing Engine), approval waste & stock opname, melihat dashboard & laporan, dan mengelola toko serta akun staff.

**Stockist (contoh: Budi)**
Tim gudang, terikat 1 toko. Bertanggung jawab atas: data master produk, Purchase Order ke supplier, penerimaan barang (Inbound), mutasi stok antar-toko, pengajuan waste buah busuk, stock opname, dan pengaturan minimum stok (reorder point). Stockist TIDAK bisa melihat HPP, margin, atau harga jual.

**Kasir (contoh: Rina)**
Operator POS toko fisik, terikat 1 toko. Bertanggung jawab atas: transaksi penjualan di toko (POS Offline) dan manajemen shift laci uang. POS harus bisa berfungsi tanpa internet. Kasir TIDAK bisa melihat HPP atau margin.

**Admin Online (contoh: Dina)**
Operator pesanan digital, terikat 1 toko. Memproses pesanan dari WhatsApp, Grab, Shopee, GoFood, dll. Bertanggung jawab atas: POS Online (input data pelanggan, kurir, ongkir) dan manajemen shift. Admin TIDAK bisa melihat HPP atau margin.

## 1.3 Prinsip desain
- **Clean & professional** — ini aplikasi bisnis, bukan consumer app. Hindari dekoratif berlebihan.
- **Data-dense tapi readable** — banyak tabel dan angka, tapi harus tetap nyaman dibaca.
- **Konsisten** — setiap komponen, warna, dan spacing harus identik di seluruh halaman.
- **Bahasa antarmuka: Bahasa Indonesia.**
- **Light theme saja** (tidak perlu dark mode).

---

# BAGIAN 2: DESIGN TOKENS

## 2.1 Warna

### Warna utama (brand)
| Token | Hex | Contoh penggunaan |
|-------|-----|-------------------|
| Primary | `#1A3636` | Sidebar background, header tabel, heading utama |
| Secondary | `#2C6E49` | Sidebar active item bg, tombol primary, aksen penting |
| Accent | `#4C956C` | Sidebar active border-left, focus ring input, highlight |

### Warna semantik (status)
| Token | Hex | Background | Teks di atas bg |
|-------|-----|------------|-----------------|
| Success | `#16A34A` | `#F0FDF4` | `#16A34A` |
| Warning | `#EAB308` | `#FFFBEB` | `#EAB308` |
| Danger | `#DC2626` | `#FEF2F2` | `#DC2626` |
| Info | `#2563EB` | `#E6F1FB` | `#0C447C` |

### Warna netral
| Token | Hex | Penggunaan |
|-------|-----|------------|
| Page Background | `#F3F4F6` | Background area konten utama |
| Card Background | `#FFFFFF` | Background semua card dan panel |
| Table Zebra | `#F9FAFB` | Baris genap tabel |
| Table Hover | `#F0FDF4` | Hover baris tabel |
| Border | `#E5E7EB` | Border card, tabel, divider, input |
| Text Primary | `#1C1C1C` | Teks utama, heading, angka |
| Text Secondary | `#6B7280` | Label, teks pendukung, breadcrumb |
| Text Muted | `#9CA3AF` | Placeholder, hint, caption |

## 2.2 Typography
- **Font**: Inter (atau fallback: system-ui, sans-serif).
- **H1**: 24px, semi-bold (600), `#1C1C1C`.
- **H2**: 20px, semi-bold, `#1C1C1C`.
- **H3**: 16px, semi-bold, `#1C1C1C`.
- **Body**: 14px, regular (400), `#1C1C1C`.
- **Small**: 12px, regular, `#6B7280`.
- **Caption**: 11px, medium (500), `#9CA3AF`.
- **Monospace** (untuk kode, nomor dokumen): `monospace`, 12-13px, `#6B7280`.

## 2.3 Spacing & radius
- **Padding card**: 20px.
- **Padding modal**: 24px.
- **Gap antar card**: 16px.
- **Gap antar section**: 24px.
- **Border radius card**: 12px.
- **Border radius button/input**: 8px.
- **Border radius badge/pill**: 99px.
- **Border radius modal**: 16px.

## 2.4 Shadow
- **Tidak ada shadow** pada card dan komponen standar. Desain flat dengan border.
- **Exception**: modal overlay menggunakan background `rgba(0,0,0,0.4)`.

---

# BAGIAN 3: LAYOUT SYSTEM

## 3.1 Struktur halaman standar
Setiap halaman (kecuali Login) terdiri dari 3 bagian:

```
+----------+---------------------------------------------+
|          |  HEADER BAR (64px, bg #FFFFFF)               |
|  SIDEBAR |----------------------------------------------+
|  (240px) |                                              |
|  bg      |  MAIN CONTENT                                |
|  #1A3636 |  (padding 24px, bg #F3F4F6)                  |
|          |                                              |
|          |                                              |
+----------+----------------------------------------------+
```

## 3.2 Header bar
- Tinggi: **64px**. Background: `#FFFFFF`. Border-bottom: 1px `#E5E7EB`.
- **Kiri**: breadcrumb — "Home / Halaman Aktif" — 14px, `#6B7280`, separator "/".
- **Kanan**: notifikasi bell icon (16px, `#6B7280`, badge count merah `#DC2626` jika ada) + avatar inisial (32px, lingkaran, bg `#4C956C`, teks putih) + nama user 14px.

## 3.3 Responsive behavior
- **Desktop (1280px+)**: sidebar expanded 240px.
- **Tablet (1024-1279px)**: sidebar collapsed 64px (icon only).
- **Mobile (<1024px)**: sidebar hidden, muncul sebagai drawer overlay dari kiri saat klik hamburger.

---

# BAGIAN 4: SIDEBAR NAVIGATION

## 4.1 Spesifikasi umum sidebar

### Dimensi
- Expanded: **240px** lebar. Collapsed: **64px** (icon only).
- Tinggi: 100vh, position fixed kiri.
- Tombol collapse/expand di bagian bawah sidebar.

### Warna sidebar
- Background: `#1A3636`.
- Teks menu default: `#FFFFFF` opacity 70%.
- Teks menu hover: `#FFFFFF` opacity 90%.
- Teks menu active: `#FFFFFF` opacity 100%.
- Hover background: `rgba(255,255,255,0.08)`.
- Active background: `#2C6E49`.
- Active border-left: 3px solid `#4C956C`.
- Divider antar section: `rgba(255,255,255,0.1)`, 1px.

### Header sidebar (atas)
- Padding: 20px 16px. Border-bottom: divider.
- Ikon buah jeruk (lingkaran oranye kecil) + teks **"FruityPOS"** putih bold 18px.
- Subtitle "v1.0" putih opacity 40%, 11px.

### User info card (di bawah logo)
- Background: `rgba(255,255,255,0.1)`, radius 8px, padding 12px.
- Avatar inisial: lingkaran 32px, background `#4C956C`, teks putih bold 12px.
- Baris 1: nama user — putih bold 14px.
- Baris 2: role + toko — putih opacity 60%, 12px.

### Menu item anatomy
- Ikon (20px, putih opacity 70%, outline style) + Label (14px putih) + Badge opsional (kanan) + Arrow opsional (submenu).
- Padding: 10px 16px. Radius: 8px. Gap antar item: 2px.
- Badge notification: bg `#DC2626`, teks putih, pill shape, 11px.
- Badge warning: bg `#EAB308`, teks putih.

### Submenu
- Indent: padding-left 44px. Tanpa ikon, hanya label 13px.
- Default: putih opacity 60%. Active: putih 100%, border-left 2px `#4C956C`.
- Expand/collapse dengan animasi slide.

### Footer sidebar
- Tombol "Keluar": ikon + label, putih opacity 50%.
- Tombol collapse: ikon panah, putih opacity 40%.
- Padding 16px. Border-top: divider.

### Collapsed state (64px)
- Hanya ikon centered. Logo jadi ikon saja. User info jadi avatar saja.
- Badge jadi dot merah kecil di pojok kanan atas ikon.
- Submenu muncul sebagai flyout popup kanan saat hover.
- Tooltip label muncul saat hover (bg `#2C2C2C`, teks putih, 12px).

## 4.2 Sidebar Owner (18 menu)

User info: **Pak Andi** | Owner

**Group 1 — Utama**:
- Dashboard — ikon: grid 4 kotak — badge merah (count notif)

**Group 2 — Pricing & approval** (divider atas):
- Pricing engine — ikon: price tag — badge kuning (count pending)
  - Sub: Daftar harga
  - Sub: Detail pricing
- Waste approval — ikon: checklist centang — badge merah (count pending)

**Group 3 — Laporan** (divider atas):
- Laporan — ikon: bar chart — arrow submenu
  - Sub: Laba-rugi
  - Sub: Penjualan per kanal
  - Sub: Stok real-time
  - Sub: Perbandingan HPP
  - Sub: Laporan waste
  - Sub: Laporan shift
  - Sub: Laporan diskon
  - Sub: Laporan ongkir

**Group 4 — Manajemen** (divider atas):
- Kelola toko — ikon: building
- Kelola user — ikon: people group

**Footer**: Keluar + Collapse toggle.

## 4.3 Sidebar Stockist (10 menu)

User info: **Budi Santoso** | Stockist · Toko Serpong

**Group 1 — Master data**:
- Data master — ikon: package — arrow submenu
  - Sub: Produk
  - Sub: Kategori
  - Sub: Supplier

**Group 2 — Pengadaan** (divider):
- Purchase order — ikon: clipboard
- Inbound — ikon: download arrow

**Group 3 — Inventori** (divider):
- Mutasi stok — ikon: panah kiri-kanan
- Waste request — ikon: trash
- Stock opname — ikon: clipboard check

**Group 4 — Monitoring** (divider):
- Reorder point — ikon: alert triangle — badge merah (count low stock)

## 4.4 Sidebar Kasir (2 menu)

User info: **Rina Permata** | Kasir · Toko Serpong

- POS — ikon: shopping cart
- Shift saya — ikon: clock

**Catatan**: sidebar **auto-collapse ke 64px** saat Kasir masuk halaman POS untuk memaksimalkan area POS.

## 4.5 Sidebar Admin Online (2 menu)

User info: **Dina Ayu** | Admin · Toko Serpong

- POS online — ikon: globe
- Shift saya — ikon: clock

Sidebar tetap expanded 240px (POS Online form-based, tidak perlu full-width).

---

# BAGIAN 5: KOMPONEN UI STANDAR

## 5.1 Button
| Variant | Background | Teks | Border | Hover |
|---------|-----------|------|--------|-------|
| Primary | `#2C6E49` | putih | none | `#245A3D` |
| Secondary | transparent | `#1C1C1C` | 1px `#E5E7EB` | bg `#F3F4F6` |
| Danger | `#DC2626` | putih | none | `#B91C1C` |
| Ghost | transparent | `#6B7280` | none | bg `#F3F4F6` |

Semua button: radius 8px, padding 10px 20px, font 14px medium. Active: scale(0.98).

## 5.2 Input field
- Border: 1px `#E5E7EB`. Radius: 8px. Padding: 10px 14px. Font: 14px.
- Label di atas: 13px `#6B7280`, margin-bottom 6px.
- Focus: border `#4C956C`, ring 2px `#4C956C` opacity 20%.
- Error: border `#DC2626`, label `#DC2626`, pesan error 12px `#DC2626` di bawah.
- Placeholder: `#9CA3AF`.

## 5.3 Dropdown / select
- Sama dengan input field + arrow indicator kanan.
- Dropdown list: bg `#FFFFFF`, border 1px `#E5E7EB`, radius 8px. Item hover: bg `#F3F4F6`.

## 5.4 Badge / pill
| Status | Background | Teks |
|--------|-----------|------|
| Aktif / Approved / Locked / Aman | `#F0FDF4` | `#16A34A` |
| Pending / Warning / Di bawah target | `#FFFBEB` | `#EAB308` |
| Nonaktif / Draft / Belum set | `#F3F4F6` | `#9CA3AF` |
| Rejected / Danger / Rendah / Tertinggi | `#FEF2F2` | `#DC2626` |
| Info / Confirmed | `#E6F1FB` | `#0C447C` |

Semua badge: radius 99px, padding 2px 10px, font 11px bold.

## 5.5 Role badge (khusus tabel user)
| Role | Background | Teks |
|------|-----------|------|
| Owner | `#D8F3DC` | `#1A3636` |
| Stockist | `#E6F1FB` | `#0C447C` |
| Kasir | `#FFFBEB` | `#854F0B` |
| Admin | `#EEEDFE` | `#3C3489` |

## 5.6 Card
- Background: `#FFFFFF`. Border: 1px `#E5E7EB`. Radius: 12px. Padding: 20px. No shadow.
- Card emphasis: tambah border-left 3px warna semantik (kuning/merah/hijau).

## 5.7 Tabel
- Container: card (bg putih, radius 12px, overflow hidden).
- Header row: bg `#1A3636`, teks putih, 12px uppercase, padding 12px 16px.
- Body row: padding 12px 16px, font 13px.
- Zebra: baris genap bg `#F9FAFB`. Hover: bg `#F0FDF4`.
- Row highlight warning: bg `#FFFBEB`. Row highlight danger: bg `#FEF2F2`.

## 5.8 Modal
- Overlay: `rgba(0,0,0,0.4)`. Card: center, max-width 480px, radius 16px, padding 24px.
- Title: 20px bold + close (X) kanan. Footer: tombol kanan-aligned.

## 5.9 KPI / metric card
- bg `#FFFFFF`, border 1px `#E5E7EB`, radius 12px, padding 16px.
- Label: 12px `#9CA3AF` atas. Angka: 24px bold `#1C1C1C`. Subtitle: 12px warna semantik.

## 5.10 Filter tabs
- Active: bg `#1A3636` teks putih. Inactive: bg `#F3F4F6` teks `#6B7280`. Hover: bg `#E5E7EB`.
- Radius: 8px. Padding: 8px 16px. Font: 13px medium. Gap: 6px.

## 5.11 Search bar
- Full-width. Ikon search kiri 16px `#9CA3AF`. Clear button kanan.
- Border 1px `#E5E7EB`, radius 8px, padding 10px 14px 10px 40px.

## 5.12 Status stepper
- Horizontal dots + connecting line. Completed: filled `#16A34A` + line `#16A34A`. Active: filled `#2C6E49`. Upcoming: outline `#E5E7EB`. Label 11px bawah.

## 5.13 Notification item
- Dot 8px kiri (kuning/biru/merah) + teks 13px + timestamp 12px `#9CA3AF`. Divider `#F3F4F6`.

## 5.14 Empty state
- Centered. Ikon 48px `#9CA3AF` + "Belum ada data" 16px `#6B7280` + tombol primary.

## 5.15 Toast
- Fixed bottom-right. Auto-dismiss 5s. Radius 8px. Border-left 3px warna semantik. Padding 12px 16px.

---

# BAGIAN 6: SPESIFIKASI 24 HALAMAN

---

## 01. Login
**Tanpa sidebar.** Full page centered. Background gradient `#1A3636` ke `#2C6E49`. Card center max-width 420px, padding 32px, radius 16px. Logo jeruk + "FruityPOS" 28px `#1A3636` + subtitle. Form: Username + Password (toggle show/hide). Tombol "Masuk" primary full-width. Tanpa register/lupa password. Error: border `#DC2626` + pesan.

---

## 02. Dashboard Owner
**Sidebar**: Owner, "Dashboard" active, badge "3". **Breadcrumb**: Dashboard.
- Greeting H1 + tanggal.
- 4 KPI cards: Revenue Rp 8.4Jt (arrow up hijau), Laba Rp 2.9Jt, Transaksi 47, Waste Pending 1 (kuning, card border-left kuning).
- 2 kolom: Revenue per toko (horizontal bar chart) + Notifikasi terbaru (3 item list, dot warna).
- Low stock alerts card (border-left merah, tabel mini, badge "RENDAH").

---

## 03. Pricing Engine — Daftar Harga
**Sidebar**: Owner, "Pricing engine > Daftar harga" active, badge kuning. **Breadcrumb**: Pricing Engine > Daftar Harga.
- H1 + subtitle. Filter tabs: Semua/Pending/Locked.
- Tabel: Produk | HPP Baseline | Margin | Harga Jual | Stok | Status. Row pending full bg `#FFFBEB`. Klik row → detail.

---

## 04. Pricing Engine — Detail Pricing
**Sidebar**: "Detail pricing" submenu active. **Breadcrumb**: Pricing Engine > Jeruk Mandarin.
- Link kembali + H1 nama produk + SKU + badge status.
- **Section A**: tabel HPP per toko (row tertinggi bg `#FEF2F2` + badge "TERTINGGI", footer hpp_baseline bold).
- **Section B**: 3 card kalkulator (HPP Baseline | Margin% input editable hijau | Harga Jual preview kuning). HPP Dibulatkan opsional.
- **Section C**: tier cards (Ecer + Grosir) + tombol tambah tier.
- **Section D**: tabel margin aktual per toko (badge "Di atas/bawah target").
- Tombol: "Kunci Harga" primary + "Batal" secondary.

---

## 05. Waste Approval
**Sidebar**: Owner, "Waste approval" active, badge merah. Filter tabs: Semua/Pending/Approved/Rejected.
- List card vertikal. Pending: border-left kuning, info + foto 80px + nilai waste + tombol Approve hijau / Reject merah (expand textarea alasan). Approved: border-left hijau, muted. Rejected: border-left merah, alasan italic.

---

## 06. Kelola Toko
**Sidebar**: Owner, "Kelola toko" active.
- Grid 3 kolom card toko: nama + badge kode + alamat + staff count (mini badge warna per role) + revenue + status + Edit/Nonaktifkan. Warning banner kuning jika staff belum lengkap. Modal tambah toko.

---

## 07. Kelola User
**Sidebar**: Owner, "Kelola user" active.
- Filter dropdown Toko + Role. Tabel: Nama | Username mono | Role badge warna | Toko | Status | Aksi. Row nonaktif opacity 60%. Modal form: Nama, Username, Password, Role, Toko.

---

## 08. Data Master Produk
**Sidebar**: Stockist, "Data master > Produk" active.
- Split view 60/40. Kiri: filter tabs + search + tabel (SKU, Foto 36px, Nama, Kategori, UoM, Status). **TANPA KOLOM HARGA.** Kanan: panel detail (foto 120px, info, konversi satuan, weight safeguard, tombol Edit/Nonaktifkan). Modal tambah buah.

---

## 09. Kategori (Stockist)
**Sidebar**: "Data master > Kategori" active.
- List kategori inline-edit. Tombol tambah. Validasi nama unik.

---

## 10. Supplier (Stockist)
**Sidebar**: "Data master > Supplier" active.
- Tabel: Nama | PIC | Telepon | Alamat | Status. Modal CRUD + toggle aktif.

---

## 11. Purchase Order
**Sidebar**: Stockist, "Purchase order" active.
- **List**: tabel No.PO mono | Supplier | Tanggal | Items | Status (DRAFT/CONFIRMED/COMPLETED) | Aksi.
- **Form**: No.PO readonly auto-gen + dropdown supplier + date picker + tabel item dinamis + total estimasi + tombol Simpan Draft / Simpan & Konfirmasi.

---

## 12. Inbound
**Sidebar**: Stockist, "Inbound" active.
- Form card: dropdown PO + date picker + tabel item (Produk | Qty PO | Qty Diterima input | Harga/Dus input | Isi/Dus input | HPP Mentah auto-calc bold hijau bg `#F0FDF4`). Field ongkir terpisah + hint "Tidak termasuk HPP". Tombol simpan.

---

## 13. POS Offline
**Sidebar**: Kasir, "POS" active, **sidebar auto-collapse 64px**. Hamburger menu pojok kiri.
- **2 kolom full-width** (65% katalog + 35% keranjang).
- Katalog: search besar + filter tabs + grid 3 kolom card produk (foto, nama, harga `#2C6E49`). **TANPA HPP/MARGIN.**
- Keranjang: header + list item (+/- hapus) + modal input gramasi (besar 32px, safeguard error merah) + diskon field expand + total 24px bold + Hold/Bayar.
- Modal bayar: total hijau + pills metode (Cash/Transfer/E-Wallet) + quick-amount + input bayar + kembalian hijau + selesaikan.
- Banner offline kuning: "Mode offline — transaksi tersimpan lokal."

---

## 14. POS Online
**Sidebar**: Admin, "POS online" active, sidebar 240px.
- 4 stacked cards: Pelanggan (nama, telp, alamat, platform dropdown) → Item (tabel item, harga readonly, subtotal) → Pengiriman (kurir, metode, ongkir) → Pembayaran (metode, diskon+catatan, total breakdown). **TANPA HPP/MARGIN.** Tombol simpan primary full-width.

---

## 15. Shift
**Sidebar**: "Shift saya" active.
- **Belum buka**: card center ikon clock + "Belum ada shift aktif" + tombol Buka Shift. Modal: saldo awal.
- **Aktif**: info shift + 4 KPI cards + tabel transaksi ringkas + tombol Tutup Shift danger.
- **Modal tutup**: saldo seharusnya readonly + input aktual + selisih (hijau/merah/biru) + konfirmasi.

---

## 16. Mutasi Stok
**Sidebar**: Stockist, "Mutasi stok" active.
- List tabel + stepper status inline (Preparing→Shipped→Received→Completed). Aksi per status.
- Form buat: Dari readonly + Ke dropdown + tabel item. Form terima: Qty Diterima input + selisih auto + loss keterangan.

---

## 17. Waste Request
**Sidebar**: Stockist, "Waste request" active.
- Form: Produk + Qty + Alasan dropdown + **Foto wajib** (drag-drop, preview). Tombol ajukan. List pengajuan sendiri + status badge.

---

## 18. Stock Opname
**Sidebar**: Stockist, "Stock opname" active.
- Form: Lokasi readonly + Tanggal + Tabel (Stok Sistem readonly | Stok Fisik input | Selisih auto warna: negatif merah, nol hijau, positif biru | Nilai). Total penyusutan merah bold. Tombol Submit ke Owner.

---

## 19. Reorder Point
**Sidebar**: "Reorder point" active, badge merah.
- Tabel: Produk | Stok | Minimum | Status (AMAN/RENDAH/BELUM SET). Row RENDAH bg `#FEF2F2`. Modal set: Produk dropdown + Min Qty. Owner: tambah filter toko + override.

---

## 20. Laporan Laba-Rugi
**Sidebar**: Owner, "Laporan > Laba-rugi" active. Filter Periode + Toko.
- Financial statement card: Revenue, Diskon, COGS, Laba Kotor (bold hijau), Ongkir, Waste, Mutasi Loss, Laba Operasional (extra bold). Baris negatif merah. Clickable drill-down.

---

## 21. Laporan Penjualan per Kanal
**Sidebar**: "Laporan > Penjualan per kanal" active. Filter + donut chart + tabel Kanal | Transaksi | Revenue | Avg.

---

## 22. Laporan Stok & HPP
**Sidebar**: "Laporan > Stok real-time" active.
- Tab 1 Stok: toggle low stock only + tabel pivot Produk×Toko qty. Cell rendah `#FEF2F2`.
- Tab 2 HPP: tabel Produk×Toko avg_cost + hpp_baseline. Cell tertinggi `#FEF2F2` + badge. Insight box kuning.

---

## 23. Laporan Diskon
**Sidebar**: "Laporan > Laporan diskon" active. Summary 4 KPI + tabel detail (catatan truncate+tooltip).

---

## 24. Laporan Shift
**Sidebar**: "Laporan > Laporan shift" active. Owner filter semua, Kasir/Admin hanya sendiri. Tabel + selisih warna + expand detail.

---

## 25. Laporan Ongkir
**Sidebar**: "Laporan > Laporan ongkir" active. Summary + tabel per inbound + bar chart per toko per bulan.

---

## 26. Laporan Waste
**Sidebar**: "Laporan > Laporan waste" active. Summary + line chart tren + tabel detail + insight "Stroberi 53% waste."

---

# BAGIAN 7: CHECKLIST KONSISTENSI

Sebelum menyelesaikan setiap halaman, verifikasi:

- [ ] Sidebar sesuai role, menu active benar, badge relevan tampil.
- [ ] Header bar: breadcrumb + bell + avatar ada.
- [ ] Semua warna dari tabel Bagian 2 (tidak ada warna di luar sistem).
- [ ] Badge menggunakan pasangan bg+teks dari tabel 5.4.
- [ ] Tabel header selalu `#1A3636` teks putih.
- [ ] Input focus ring `#4C956C`.
- [ ] Tombol primary selalu `#2C6E49`.
- [ ] Kasir dan Admin TIDAK melihat HPP, margin, avg_cost di halaman manapun.
- [ ] Semua teks Bahasa Indonesia.
- [ ] Font Inter, ukuran sesuai hierarki.
- [ ] Card tanpa shadow, hanya border `#E5E7EB`.
- [ ] Radius: card 12px, button/input 8px, badge 99px, modal 16px.
- [ ] Data contoh menggunakan nama: Pak Andi (Owner), Budi (Stockist), Rina (Kasir), Dina (Admin).
