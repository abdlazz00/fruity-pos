# 🧪 Laporan Hasil Quality Control (QC) — Sprint 4
**Modul:** Pengadaan (Purchase Order) & Penerimaan Barang (Inbound)  
**Tanggal:** 29 April 2026  
**Status Pengujian:** ✅ Lolos (Passed)

---

## 1. Skenario Pengujian (Test Cases)
Setelah fase pengembangan *frontend* selesai, dilakukan *End-to-End Testing* secara simulasi untuk seluruh *workflow* Sprint 4. 

### A. Flow Pembuatan PO
- [x] Berhasil membuat "PO Baru" dengan kuantitas dan harga dinamis.
- [x] Sistem sukses menghitung *Total Estimasi* harga di sisi *client*.
- [x] PO baru tercatat sebagai `draft` di tabel.

### B. State Machine PO (Aksi & Validasi)
- [x] Menguji tombol Edit (sukses pada status `draft`).
- [x] Menekan tombol "Konfirmasi PO" memunculkan *Custom Modal*.
- [x] Menekan "Ya, Konfirmasi" pada modal berhasil mem-patch data ke backend, dan status PO terkunci (tombol aksi hilang otomatis).

### C. Flow Penerimaan Barang (Inbound)
- [x] Menu *dropdown* di form Inbound berhasil membaca PO berstatus "Dikonfirmasi".
- [x] Mencoba input Qty lebih dari batas sisa PO -> **Sistem menampilkan visual Error (border merah).**
- [x] Kalkulator HPP: Memasukkan `Harga: 500.000`, `Qty: 10`, `Isi: 1` -> UI langsung menampilkan *Preview* akurat `Rp 50.000` tanpa nge-lag.

### D. Flow Integrasi Akhir
- [x] Submit Form Inbound berhasil.
- [x] Pengecekan Dropdown Notifikasi memunculkan pesan barang masuk lengkap dengan *badge* unread dan animasi *fade-in*.

---

## 2. Temuan Bug & Perbaikan Terakhir (Resolutions)
Selama fase QC dan sinkronisasi, ditemukan beberapa isu minor yang **semuanya telah langsung ditangani**:

1. 🐛 **Isu:** Tabel database Sprint 4 tidak ditemukan saat pertama kali diuji.
   ✅ **Solusi:** Eksekusi `php artisan migrate:fresh --seed` untuk *synchronize schema* terbaru.
   
2. 🐛 **Isu:** Browser tertentu tidak memunculkan `window.confirm()` saat mengklik tombol Konfirmasi PO.
   ✅ **Solusi:** Membuatkan desain UI *Custom Modal* berbasis `createPortal` dan `animate-in` sebagai pengganti fitur standar browser, sehingga jauh lebih interaktif.
   
3. 🐛 **Isu:** Data tanggal pada tabel tampil berantakan (contoh: `2026-04-29T00:00:00.000000Z`).
   ✅ **Solusi:** Menambahkan method `serializeDate()` ke dalam Model `PurchaseOrder.php` dan `Inbound.php` di *backend* untuk mengunci format respon ke `Y-m-d H:i:s`.
   
4. 🐛 **Isu:** Timetable aplikasi masih terbaca sebagai UTC.
   ✅ **Solusi:** Memodifikasi `config/app.php` ke *timezone* `'Asia/Jakarta'` dan menjalankan `config:clear`.

---
**Kesimpulan QC:** 
Modul Pengadaan dan *Inbound* sudah berada dalam kategori *Production-Ready* dengan fungsionalitas dan tampilan *Premium* sesuai spesifikasi awal. Fitur *backend-heavy* (seperti WAC/HPP update) juga terbukti bekerja lancar dengan respon antarmuka yang dibuat di sprint ini.
