# 📋 Dokumen UAT (User Acceptance Testing) — FruityPOS

**Versi:** 1.0  
**Tanggal:** 19 Mei 2026  
**Sprint:** 10 — Testing & Stabilization  
**Prepared by:** Abdul Aziz

---

## 1. Informasi Umum

| Item | Keterangan |
|------|-----------|
| Nama Sistem | FruityPOS — Sistem Kasir Toko Buah |
| Versi | Sprint 10 (Final) |
| Lingkungan | Staging (Coolify) / Localhost |
| Metode | Manual testing dengan skenario tertulis |
| Status Dokumen | Draft |

### Akun Pengujian

| Role | Username | Password | Akses |
|------|----------|----------|-------|
| Owner | owner@fruity.com | (sesuai staging) | Semua modul |
| Stockist | stockist@fruity.com | (sesuai staging) | Inventory, PO, Inbound |
| Kasir | kasir@fruity.com | (sesuai staging) | POS Offline, Shift |
| Admin | admin@fruity.com | (sesuai staging) | POS Online |

### Skala Penilaian

| Kode | Hasil | Keterangan |
|------|-------|-----------|
| ✅ Pass | Lulus | Sesuai ekspektasi |
| ❌ Fail | Gagal | Tidak sesuai, perlu perbaikan |
| ⚠️ Partial | Sebagian | Fungsi berjalan tapi ada catatan minor |
| ⏭️ Skip | Dilewati | Belum bisa diuji di environment ini |

---

## 2. Modul A — Autentikasi

### TC-A01: Login dengan kredensial valid

**Role:** Semua  
**Precondition:** User sudah terdaftar di sistem

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/login` | Halaman login tampil |
| 2 | Isi email & password yang benar | Field terisi |
| 3 | Klik tombol Login | Redirect ke dashboard/halaman sesuai role |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-A02: Login dengan kredensial salah

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Isi email benar, password salah | — |
| 2 | Klik Login | Pesan error "Kredensial tidak sesuai" tampil |
| 3 | Halaman tidak berpindah | User tetap di `/login` |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-A03: Logout

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Klik menu Logout | Session dihapus, redirect ke `/login` |
| 2 | Tekan Back di browser | Tidak bisa akses halaman protected |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-A04: Forgot Password (OTP Flow)

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Klik "Lupa Password" di halaman login | Redirect ke `/forgot-password` |
| 2 | Isi email terdaftar, submit | Pesan "OTP dikirim ke email" |
| 3 | Buka `/verify-otp`, isi kode OTP | Redirect ke form reset password |
| 4 | Isi password baru, konfirmasi, submit | Password berubah, redirect login |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-A05: Role-Based Access Control

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Login sebagai Kasir | Sidebar hanya tampil menu POS & Shift |
| 2 | Akses manual URL `/dashboard` | Redirect / 403 |
| 3 | Login sebagai Owner | Semua menu tampil termasuk Dashboard, Pricing, Reports |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

## 3. Modul B — Master Data

### TC-B01: Manajemen Kategori Produk

**Role:** Owner / Stockist

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/master/categories` | Daftar kategori tampil |
| 2 | Tambah kategori baru | Kategori muncul di list |
| 3 | Edit nama kategori | Nama ter-update |
| 4 | Hapus kategori (tidak ada produk) | Kategori terhapus |
| 5 | Hapus kategori (ada produk) | Error / ditolak |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-B02: Manajemen Produk

**Role:** Owner / Stockist

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/master/products/create` | Form create produk tampil |
| 2 | Isi nama, kategori, UoM, satuan isi, berat | — |
| 3 | Upload gambar produk | Preview gambar tampil |
| 4 | Submit | Produk tersimpan, SKU auto-generate |
| 5 | Edit produk — ubah nama | Perubahan tersimpan |
| 6 | Toggle nonaktif produk | Status jadi "Nonaktif", tidak muncul di POS |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-B03: Manajemen Supplier

**Role:** Owner / Stockist

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/master/suppliers/create` | Form tampil |
| 2 | Isi data supplier, submit | Supplier tersimpan |
| 3 | Toggle status aktif/nonaktif | Status berubah |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-B04: Manajemen Toko & User (Owner Only)

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buat toko baru di `/stores/create` | Toko tersimpan |
| 2 | Buat user baru, assign ke toko | User aktif dengan role yang dipilih |
| 3 | Toggle nonaktif user | User tidak bisa login |
| 4 | Toggle nonaktif toko | Toko tidak muncul di dropdown |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

## 4. Modul C — Purchase Order & Inbound

### TC-C01: Buat Purchase Order Baru

**Role:** Owner / Stockist  
**Precondition:** Minimal 1 supplier & 1 produk aktif

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/procurement/purchase-orders/create` | Form PO tampil |
| 2 | Pilih supplier, tambah item produk, isi qty & harga | Item masuk ke tabel |
| 3 | Submit | PO tersimpan dengan status **Draft**, nomor PO auto-generate |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-C02: Konfirmasi PO (Draft → Confirmed)

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka detail PO berstatus Draft | Tombol "Konfirmasi" tampil |
| 2 | Klik Konfirmasi | Status berubah jadi **Confirmed** |
| 3 | Coba edit PO yang sudah Confirmed | Tombol edit tidak ada / ditolak |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-C03: Batalkan PO (Draft → Cancelled)

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka PO berstatus Draft | Tombol "Batalkan" tersedia |
| 2 | Klik Batalkan, konfirmasi dialog | Status berubah jadi **Cancelled** |
| 3 | Coba batalkan PO yang sudah Confirmed | Ditolak / error |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-C04: Proses Inbound (Penerimaan Barang)

**Precondition:** Ada PO berstatus **Confirmed**

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/procurement/inbounds/create` | Form inbound tampil |
| 2 | Pilih PO, isi qty diterima & biaya per item | — |
| 3 | Submit | Inbound tersimpan, status PO → **Completed** |
| 4 | Cek `/inventory/stocks` | Stok produk bertambah sesuai qty inbound |
| 5 | Cek `/pricing` | HPP Baseline produk ter-update (WAC dihitung ulang) |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-C05: Validasi WAC Setelah Inbound

**Precondition:** Produk sudah punya stok dengan avg_cost sebelumnya

| # | Skenario | Expected Result |
|---|---------|----------------|
| 1 | Inbound 100 pcs @ HPP 5000 ke stok kosong | avg_cost = 5000 |
| 2 | Inbound lagi 50 pcs @ HPP 8000 | avg_cost = 6000 ((100×5000+50×8000)/150) |
| 3 | Cek di halaman Pricing → breakdown per lokasi | Nilai WAC per lokasi tampil benar |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

## 5. Modul D — Pricing Engine

### TC-D01: Set Margin dan Harga Jual

**Role:** Owner  
**Precondition:** Produk sudah punya data inbound (HPP Baseline > 0)

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/pricing`, pilih produk | Halaman detail pricing tampil |
| 2 | Set margin 20%, rounding 500 | Harga jual = ceil(HPP × 1.2 / 500) × 500 |
| 3 | Verifikasi angka di UI | Harga jual tampil sesuai kalkulasi |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-D02: Lock & Unlock Harga

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Klik "Lock" pada produk dengan harga jual > 0 | Status → **Locked**, harga tampil di POS |
| 2 | Klik "Unlock" | Status → **Pending**, produk hilang dari POS |
| 3 | Coba lock produk dengan harga jual = 0 | Ditolak / pesan error |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-D03: Tier Pricing (Harga Grosir)

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka pricing produk, tambah tier: min qty 10, harga 40000 | Tier tersimpan |
| 2 | Di POS, masukkan produk dengan qty 10 | Harga otomatis pakai tier 40000 |
| 3 | Kurangi qty jadi 9 | Harga kembali ke harga normal |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

## 6. Modul E — POS & Shift

### TC-E01: Buka Shift

**Role:** Kasir  
**Precondition:** Tidak ada shift aktif

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/shift`, klik "Buka Shift" | Modal input saldo awal tampil |
| 2 | Isi saldo awal (mis. Rp 500.000), submit | Shift terbuka, status "Open" |
| 3 | Coba buka shift kedua | Ditolak / error |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-E02: Transaksi POS Offline (Kasir)

**Precondition:** Shift aktif, produk dengan harga Locked tersedia

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/pos/offline` | Katalog produk tampil |
| 2 | Klik produk → masuk keranjang | Item muncul di cart dengan subtotal |
| 3 | Ubah qty produk (decimal: 1.5 kg) | Subtotal update otomatis |
| 4 | Klik produk habis stok | Tidak bisa ditambahkan |
| 5 | Klik "Bayar" → pilih metode, isi nominal | Modal pembayaran tampil |
| 6 | Submit transaksi | Transaksi berhasil, struk tampil |
| 7 | Stok produk berkurang | Verifikasi di `/inventory/stocks` |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-E03: Transaksi POS Offline (Offline Mode)

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Matikan koneksi internet (DevTools → Offline) | Indikator "Offline" tampil merah |
| 2 | Lakukan transaksi seperti TC-E02 | Transaksi tersimpan di IndexedDB |
| 3 | Badge "X Pending" muncul | Jumlah transaksi offline tampil |
| 4 | Nyalakan internet kembali | Auto-sync berjalan, badge hilang |
| 5 | Cek data di server | Transaksi tersinkron |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-E04: Tutup Shift & Rekonsiliasi

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Dari halaman shift aktif, klik "Tutup Shift" | Modal input saldo aktual tampil |
| 2 | Isi saldo aktual kas | — |
| 3 | Submit | Shift tertutup, selisih (difference) dihitung otomatis |
| 4 | Lihat ringkasan shift | Total transaksi, saldo ekspektasi, saldo aktual, selisih tampil |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-E05: POS Online (Admin)

**Role:** Admin

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/pos/online` | Katalog produk tampil |
| 2 | Lakukan transaksi | Transaksi langsung masuk ke database |
| 3 | Tidak ada indikator offline | Hanya mode online |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

## 7. Modul F — Manajemen Inventaris

### TC-F01: Mutasi Stok (Transfer Antar Gudang)

**Role:** Stockist / Owner  
**Precondition:** Stok tersedia di lokasi asal

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/inventory/mutations/create` | Form mutasi tampil |
| 2 | Pilih lokasi asal & tujuan, tambah item | — |
| 3 | Submit | Mutasi tersimpan status **Preparing** |
| 4 | Klik "Kirim" (Ship) | Status → **Shipped**, stok asal berkurang |
| 5 | Login sebagai stockist tujuan, klik "Terima" | Input qty diterima, status → **Received** |
| 6 | Klik "Selesai" | Status → **Completed**, stok tujuan bertambah |
| 7 | Jika ada selisih (kirim 10, terima 8) | Loss 2 tercatat di detail mutasi |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-F02: Waste Management

**Role:** Stockist (submit), Owner (approve/reject)

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Stockist buka `/inventory/waste/create` | Form waste tampil |
| 2 | Pilih produk, isi qty rusak, upload foto | — |
| 3 | Submit | Waste request tersimpan status **Pending** |
| 4 | Owner buka detail, klik "Approve" | Status → **Approved**, stok berkurang |
| 5 | Verifikasi stok | Stok sudah dikurangi sesuai qty waste |
| 6 | Ulangi, tapi Owner klik "Reject" | Status → **Rejected**, stok TIDAK berubah |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-F03: Stock Opname

**Role:** Stockist (conduct), Owner (approve)

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Stockist buka `/inventory/opname/start` | Opname dimulai, snapshot stok diambil |
| 2 | Isi jumlah fisik untuk tiap produk | — |
| 3 | Submit opname | Status → **Submitted** |
| 4 | Owner klik "Approve" | Stok disesuaikan ke jumlah fisik |
| 5 | Produk kekurangan stok | Qty dikurangi ke angka fisik |
| 6 | Produk kelebihan stok | Qty ditambah ke angka fisik |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-F04: Reorder Point

**Role:** Owner / Stockist

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/inventory/reorder-points/create` | Form tampil |
| 2 | Pilih produk & lokasi, set min_quantity | — |
| 3 | Submit | Reorder point aktif tersimpan |
| 4 | Kurangi stok produk di bawah min_quantity | Notifikasi low-stock dikirim ke Owner |
| 5 | Toggle nonaktif reorder point | Notifikasi tidak dikirim lagi |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

## 8. Modul G — Laporan (Owner Only)

### TC-G01: Laporan Profit & Loss

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/reports/profit-loss` | Laporan P&L tampil |
| 2 | Filter berdasarkan rentang tanggal | Data ter-filter |
| 3 | Verifikasi rumus: Revenue - HPP - Waste = Profit | Angka konsisten |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-G02: Laporan Penjualan

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/reports/sales` | Grafik & tabel penjualan tampil |
| 2 | Filter per produk / tanggal | Data ter-filter |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-G03: Laporan Inventaris (Stok Realtime)

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/inventory/stocks` | Tabel stok per produk per lokasi tampil |
| 2 | Filter per kategori | Hanya produk kategori tersebut |
| 3 | Filter per lokasi | Stok di lokasi tersebut |
| 4 | Nilai avg_cost tampil | WAC per lokasi benar |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-G04: Laporan Shift

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/reports/shifts` | List semua shift tampil |
| 2 | Klik detail shift | Transaksi dalam shift tampil |
| 3 | Verifikasi selisih kas | Difference = Aktual - Ekspektasi |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-G05: Laporan Waste & HPP Comparison

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Buka `/reports/waste` | Riwayat waste + nilai kerugian tampil |
| 2 | Buka `/reports/hpp-comparison` | Perbandingan HPP antar lokasi tampil |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

## 9. Modul H — Notifikasi Real-Time

### TC-H01: Notifikasi Low Stock

| # | Langkah | Expected Result |
|---|---------|----------------|
| 1 | Set reorder point produk: min 50 pcs | — |
| 2 | Lakukan transaksi POS hingga stok < 50 | — |
| 3 | Cek notifikasi bell di header | Badge notifikasi muncul |
| 4 | Klik notifikasi | Detail produk yang low stock tampil |
| 5 | Tunggu 1 jam, stok masih rendah | Notifikasi dikirim lagi (cooldown 1 jam) |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

## 10. Skenario End-to-End

### TC-E2E-01: Siklus Penuh Operasional

Simulasi alur lengkap dari pengadaan hingga penjualan:

| # | Langkah | Module | Expected |
|---|---------|--------|----------|
| 1 | Buat PO untuk 100 pcs Apel Fuji @ Rp 40.000/pcs | C | PO Draft |
| 2 | Konfirmasi PO | C | Status Confirmed |
| 3 | Proses Inbound: terima 100 pcs, biaya total Rp 4.000.000 | C | HPP Mentah = 40.000/pcs |
| 4 | Cek HPP Baseline di Pricing | D | Baseline = 40.000 |
| 5 | Set margin 25%, rounding 1000 | D | Harga Jual = 50.000 |
| 6 | Lock harga | D | Status Locked |
| 7 | Kasir buka shift (saldo awal Rp 500.000) | E | Shift Open |
| 8 | Jual 5 pcs Apel Fuji | E | Subtotal = Rp 250.000 |
| 9 | Jual lagi 3 pcs (total 8 pcs dalam shift) | E | Total revenue = Rp 400.000 |
| 10 | Kasir tutup shift (saldo aktual Rp 900.000) | E | Diff = 900.000 - (500.000+400.000) = 0 |
| 11 | Cek laporan P&L | G | Revenue 400.000, HPP 320.000, Profit 80.000 |
| 12 | Cek stok Apel Fuji | G | Sisa = 92 pcs |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

### TC-E2E-02: Siklus Mutasi Stok

| # | Langkah | Expected |
|---|---------|----------|
| 1 | Gudang A punya 100 pcs Mangga | — |
| 2 | Buat mutasi: kirim 30 pcs ke Gudang B | Stok A = 70 pcs |
| 3 | Gudang B terima 28 pcs (selisih 2) | Loss = 2 pcs, Stok B = 28 pcs |
| 4 | Selesaikan mutasi | Status Completed |
| 5 | Cek laporan inventaris | Stok sesuai di masing-masing lokasi |

**Hasil:** `[ ]` Pass `[ ]` Fail  **Catatan:** _______________

---

## 11. Ringkasan Hasil UAT

| Modul | Total TC | Pass | Fail | Partial | Notes |
|-------|----------|------|------|---------|-------|
| A — Autentikasi | 5 | | | | |
| B — Master Data | 4 | | | | |
| C — PO & Inbound | 5 | | | | |
| D — Pricing Engine | 3 | | | | |
| E — POS & Shift | 5 | | | | |
| F — Inventaris | 4 | | | | |
| G — Laporan | 5 | | | | |
| H — Notifikasi | 1 | | | | |
| E2E Scenarios | 2 | | | | |
| **Total** | **34** | | | | |

---

## 12. Defect Log

| ID | TC | Severity | Deskripsi | Status |
|----|----|----------|-----------|--------|
| DEF-001 | | 🔴 Critical | | Open |
| DEF-002 | | 🟡 Major | | Open |

**Severity:**
- 🔴 Critical — sistem tidak bisa digunakan
- 🟡 Major — fitur utama terganggu
- 🟠 Minor — fitur berjalan tapi ada ketidaksesuaian UI/UX
- 🔵 Trivial — catatan kosmetik

---

## 13. Sign-off

| Peran | Nama | Tanggal | Tanda Tangan |
|-------|------|---------|-------------|
| Developer | Abdul Aziz | | |
| Tester | | | |
| Reviewer / Dosen | | | |

**Kesimpulan UAT:**
- [ ] **Accepted** — Sistem siap go-live
- [ ] **Accepted with conditions** — Ada minor issues yang perlu diperbaiki
- [ ] **Rejected** — Ada critical issues yang harus diselesaikan dulu
