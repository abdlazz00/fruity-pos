# Laporan Pengerjaan Frontend Sprint 5: Pricing Engine

## 1. Ringkasan Eksekutif
Sprint 5 difokuskan pada pengembangan UI/UX dari modul **Pricing Engine**, yang menjadi "jantung" operasional finansial bagi role `owner`. Modul ini mengontrol HPP, persentase target margin, pembulatan harga jual final, serta skema diskon grosir (multi-tier). Seluruh target fitur berdasarkan panduan `sprint_5_frontend_guideline.md` telah dirampungkan tepat waktu.

## 2. Detail Implementasi Fitur
- **S5-F01 (Daftar Harga - Index)**
  - Diimplementasikan pada `resources/js/Pages/Pricing/Index.jsx`.
  - Menampilkan *4 KPI Cards*: Total Diset, Locked, Pending, Belum Diset.
  - Tabel Daftar Harga memiliki *row highlight* warna kuning (`#FFFBEB`) untuk produk berstatus `pending`.
  - Fitur *Alert Box* dinamis berwarna merah untuk menampilkan daftar produk yang baru terdaftar di Master Data tapi belum pernah di-Inbound.
- **S5-F02 (Detail Harga - Show)**
  - Diimplementasikan pada `resources/js/Pages/Pricing/Show.jsx`.
  - **Section A:** Tabel *Komparasi HPP per Toko* dilengkapi sistem deteksi otomatis untuk memberi indikator *background* merah muda (`#FEF2F2`) dan *Badge* "TERTINGGI" pada toko dengan `avg_cost` paling tinggi.
  - **Section D:** Tabel *Margin Aktual per Toko* melengkapi laporan dengan warna dinamis (Hijau > 20%, Kuning > 10%, Merah < 10%).
- **S5-F03 & S5-F04 (Margin Calculator & Rounding)**
  - Kalkulator terintegrasi langsung dengan API backend `/api/pricing/preview`. Proses interaktif berjalan transparan dengan metode `debounce` *(delay 400ms)* sehingga harga jual berubah otomatis ketika persentase (%) target margin diketik, tanpa me-reload halaman.
  - Tersedia pula tombol praktis untuk Pembulatan (Tanpa Pembulatan, Rp 100, Rp 500, Rp 1.000).
- **S5-F05 (Tier Manager / Harga Grosir)**
  - Fitur penambahan tier harga (Grosir/Reseller/Ecer) secara dinamis menggunakan *Array State* React.
- **S5-F06 (Lock/Unlock Mechanism)**
  - Dilengkapi *Modal Component* konfirmasi untuk mencegah ketidaksengajaan klik.
  - Memiliki fitur proteksi antarmuka (*UI Guard*). Ketika status produk di-*Lock*, seluruh komponen form Kalkulator dan form Tiers ditutupi lapisan *glassmorphism* (blur) putih dan dinonaktifkan secara interaktif. Tombol "Kunci Harga" berubah wujud menjadi tombol "Buka Kunci" berwarna merah.

## 3. Utility yang Dibangun
- `resources/js/utils/currency.js`: Berisi helper `formatRupiah` murni dengan standard `Intl.NumberFormat` agar UI selalu stabil menampilkan format IDR.
- `resources/js/utils/pricing.js`: Berisi *pure function* `calculateMarginActual()` dan pewarnaan `getMarginColor()` yang dapat digunakan ulang di komponen lain ke depannya.
