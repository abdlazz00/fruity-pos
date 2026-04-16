<p align="center">
  <h1 align="center">FruityPOS</h1>
  <p align="center">Centralized Retail & POS System untuk Toko Buah Multi-Cabang</p>
</p>

## 📖 Tentang FruityPOS

**FruityPOS** adalah sistem web terpusat untuk manajemen operasional ritel buah-buahan multi-toko dengan model **Decentralized Store**. Sistem ini dirancang untuk beroperasi secara mandiri di setiap toko (area gudang + area penjualan) tanpa adanya gudang pusat.

Pemilik bisnis (Owner) memiliki visibilitas penuh ke seluruh cabang melalui dashboard terpusat dan mengendalikan harga jual secara seragam melalui **Pricing Engine** pintar berbasis WAC (Weighted Average Cost).

## ✨ Fitur Utama (11 Modul)

1. **📦 Data Master**: Manajemen produk, kategori, UoM (Unit of Measure), dan supplier.
2. **🚚 Pengadaan & Inbound**: Proses PO per toko, penerimaan barang, kalkulasi HPP Mentah & update WAC secara otomatis.
3. **💰 Pricing Engine**: Penentuan harga terpusat dengan `hpp_baseline` worst-case, set margin, dan multi-tier pricing.
4. **🛒 POS Offline**: Kasir offline-first dengan Dexie.js, timbang gramasi, sinkronisasi background, tutup shift, dan toleransi safeguard.
5. **🌐 POS Online**: Manajemen pesanan digital, pelanggan, diskon, dan kalkulasi ongkir.
6. **🔄 Mutasi Stok**: Transfer horizontal antar-toko secara *peer-to-peer* disertai *WAC recalculation* di lokasi tujuan.
7. **🗑️ Waste Management**: Pengajuan pembuangan buah rusak dengan sistem approval bertingkat ke Owner.
8. **📋 Stock Opname**: Audit inventori fisik secara berkala untuk penyesuaian sistem dengan stok riil.
9. **📈 Dashboard & Laporan**: Laporan P&L (laba-rugi), performa per kanal, stok, HPP, diskon, dan *reorder-points*.
10. **👥 Manajemen Pengguna**: Role-based Access Control (RBAC) dengan 4 level akses.
11. **🏪 Manajemen Toko**: Manajemen multi-cabang dengan isolasi *LocationScope*, memastikan setiap cabang beroperasi di koridor datanya masing-masing.

## 👥 Role Based Access Control (RBAC)

Aplikasi ini mendefinisikan 4 kategori pengguna:
*   **👑 Owner**: Memantau dashboard terpusat, mengontrol harga, approval waste/opname, akses laporan keuangan, dan pengelolaan seluruh cabang.
*   **📦 Stockist**: Mengelola PO, inbound, mutasi, waste, dan inventory di toko spesifiknya (tanpa akses visibilitas ke HPP/margin harga jual).
*   **💵 Kasir**: Menggunakan alat POS Offline untuk melayani transaksi di toko fisik.
*   **💻 Admin Online**: Menerima pesanan dan memproses transaksi yang masuk dari kanal digital.

## 🛠️ Technology Stack

Sistem dibangun menggunakan arsitektur monolit modern dengan implementasi **Service-Repository Pattern** untuk meredam kompleksitas logika bisnis yang rumit (seperti WAC dan sinkronisasi offline).

*   **Backend:** Laravel 11 (PHP)
*   **Frontend:** React 18, Tailwind CSS 3
*   **Bridge Layer:** Inertia.js
*   **Database Engine:** MySQL 8
*   **Cache & Queue:** Redis 7
*   **Offline Mode:** Dexie.js (IndexedDB) + Workbox Service Worker
*   **Realtime Events:** Laravel Echo + Soketi
*   **Bundler:** Vite 5
*   **Auth:** Laravel Sanctum

## 🚀 Instalasi & Setup (Development)

Proses instalasi dibagi ke dalam beberapa langkah sederhana. Pastikan Anda memiliki PHP 8.2+, Node.js (v18+), Composer, MySQL, dan Redis di perangkat Anda.

1. **Clone Repository & Akses Folder**
   ```bash
   git clone <repository_url>
   cd ProjectPWII
   ```
2. **Setup Lingkungan Backend (Laravel)**
   Salin file konfigurasi lingkungan dan pasang dependensi backend:
   ```bash
   cp .env.example .env
   composer install
   php artisan key:generate
   ```
3. **Konfigurasi Environment Database & Email (OTP, Notifikasi)**
   Buka file `.env` yang baru saja dibuat. Hubungkan ke MySQL, Redis, dan SMTP Gmail (Wajib untuk fitur Forgot Password OTP):
   ```dotenv
   # Database
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=fruitypos
   DB_USERNAME=root
   DB_PASSWORD=

   # Queue & Session
   QUEUE_CONNECTION=sync # Ubah ke 'redis' untuk production
   SESSION_DRIVER=database # atau 'redis'

   # SMTP Configuration (Wajib untuk OTP & Notifikasi Sistem)
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=465
   MAIL_USERNAME="<alamat-email-gmail-anda>"
   MAIL_PASSWORD="<app-password-gmail-anda>"
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS="<alamat-email-gmail-anda>"
   MAIL_FROM_NAME="FruityPOS System"
   ```
   > **Catatan:** Untuk `MAIL_PASSWORD`, pastikan Anda menggunakan **App Password** dari rincian keamanan Akun Google Anda jika fitur *2-Step Verification* aktif.

4. **Jalankan Migrasi Database & Seeder Data Awal**
   Proses ini akan membentuk tabel-tabel penting beserta Role, Toko Dummy, dan Akun Owner utama aplikasi.
   ```bash
   php artisan migrate:fresh --seed
   ```
5. **Konfigurasi Penyimpanan (Storage)**
   Tautkan folder penyimpanan publik agar aset-aset produk gambar dapat diakses:
   ```bash
   php artisan storage:link
   ```
6. **Install Dependensi Frontend (React + Vite)**
   ```bash
   npm install
   ```
7. **Jalankan Aplikasi Development Server**
   Anda membutuhkan dua jendela antarmuka perintah (terminal) secara bersamaan.
   - Terminal 1 (Servis Backend PHP):
     ```bash
     php artisan serve
     ```
   - Terminal 2 (Proses HMR Frontend Vite):
     ```bash
     npm run dev
     # (Jika Vite error mengenai path import `@/*`, pastikan terminal berada di root ProjectPWII)
     ```
   Aplikasi secara default dapat diakses melalui browser pada `http://localhost:8000`.

---
*Dokumen ini dikembangkan & diturunkan dari Spesifikasi Kebutuhan Perangkat Lunak (SRS) FruityPOS v2.0 Final Blueprint.*
