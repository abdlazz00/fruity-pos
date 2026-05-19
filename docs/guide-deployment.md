# 🚀 Deployment Guide & User Manual — FruityPOS

**Versi:** 1.0  
**Tanggal:** 19 Mei 2026  
**Sprint:** 10 — Integration Testing + Polish + Deploy  
**Author:** Abdul Aziz

---

## 🏗️ 1. Arsitektur Sistem

```
Browser (React + Inertia.js)
    │
    ├── Online Mode  → HTTPS → pos.infokelas.com (Nginx)
    │                              └── Laravel 11 (PHP 8.3)
    │                                      ├── MySQL (Coolify Managed)
    │                                      ├── Redis (Session/Cache/Queue)
    │                                      └── Pusher (Broadcasting)
    │
    └── Offline Mode → IndexedDB (Dexie.js) → Auto-sync saat kembali online
```

---

## ☁️ 2. Infrastruktur Deployment

| Komponen | Detail |
|----------|--------|
| **Platform** | [Coolify](https://coolify.io) (Self-Hosted PaaS) |
| **Hosting** | VPS (Ubuntu 22.04) |
| **Domain** | `https://pos.infokelas.com` |
| **SSL** | Auto-managed oleh Coolify (Let's Encrypt) |
| **Branch Deploy** | `staging` |
| **Build System** | Nixpacks (auto-detect Laravel + Node.js, tanpa Dockerfile manual) |
| **Database** | MySQL 8 (provisioned via Coolify) |
| **Broadcasting** | Pusher (untuk real-time notifikasi low-stock) |

---

## 🔄 3. Alur Deployment via Coolify

Deployment dilakukan secara otomatis oleh Coolify setiap kali ada push ke branch `staging`.

```
Developer push ke branch staging
        │
        ▼
Coolify mendeteksi perubahan (webhook GitHub)
        │
        ▼
Coolify build Docker image (dari Dockerfile)
    ├── composer install --no-dev --optimize-autoloader
    ├── npm install + npm run build (Vite)
    └── chown www-data (storage + bootstrap/cache)
        │
        ▼
Container baru di-deploy (zero-downtime rolling update)
        │
        ▼
Coolify menjalankan startup command:
    ├── php artisan migrate --force
    ├── php artisan config:cache
    ├── php artisan route:cache
    └── php artisan view:cache
        │
        ▼
🟢 Aplikasi aktif di https://pos.infokelas.com
```

> **Catatan:** Seluruh proses build dan deploy ditangani Coolify secara otomatis. Tidak diperlukan intervensi manual ke server.

---

## ⚙️ 4. Konfigurasi Environment (`.env` Production)

Variabel environment dikonfigurasi langsung di panel Coolify (bukan di file `.env` yang di-commit ke Git).

```ini
APP_NAME="FruityPOS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://pos.infokelas.com

LOG_CHANNEL=daily
LOG_LEVEL=error

# Database (provisioned Coolify)
DB_CONNECTION=mysql
DB_HOST=<coolify-internal-mysql-host>
DB_PORT=3306
DB_DATABASE=fruitypos
DB_USERNAME=fruity_user
DB_PASSWORD=<secret>

# Cache, Session & Queue
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120
REDIS_HOST=<coolify-internal-redis-host>
REDIS_PORT=6379

# Broadcasting (Pusher)
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=<app-id>
PUSHER_APP_KEY=<app-key>
PUSHER_APP_SECRET=<app-secret>
PUSHER_APP_CLUSTER=ap1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

> ⚠️ Credentials sensitif **tidak di-commit ke Git**. Seluruhnya diatur melalui panel Environment Variables di Coolify.

---

## 📂 5. Struktur Branch

| Branch | Tujuan | Deploy ke |
|--------|--------|-----------|
| `main` | Kode stabil, production-ready | — |
| `staging` | Branch aktif deployment | `https://pos.infokelas.com` |
| `feature/*` | Pengembangan fitur baru | Lokal |

**Workflow:**
```
feature/* → merge ke staging → auto-deploy ke Coolify → testing → merge ke main
```

---

## 📦 6. Build System — Nixpacks

Coolify menggunakan **Nixpacks** sebagai build system — tidak memerlukan `Dockerfile` manual. Nixpacks secara otomatis mendeteksi bahwa proyek ini adalah aplikasi **Laravel + Node.js** dan melakukan build yang sesuai.

### Proses build Nixpacks secara otomatis:

```
1. Deteksi: composer.json → PHP 8.3
   Deteksi: package.json  → Node.js 20

2. Install PHP deps:  composer install --no-dev --optimize-autoloader
3. Install JS deps:   npm install
4. Build frontend:    npm run build (Vite)
5. Start server:      php artisan serve / Caddy/Nginx proxy
```

### Nixpacks Build Configuration (opsional di `nixpacks.toml`)

Jika diperlukan kustomisasi build, dapat ditambahkan file `nixpacks.toml` di root project:

```toml
[phases.setup]
nixPkgs = ['php83', 'nodejs_20', 'php83Extensions.pdo_mysql', 'php83Extensions.gd', 'php83Extensions.zip']

[phases.build]
cmds = [
    'composer install --no-dev --optimize-autoloader',
    'npm install',
    'npm run build'
]

[start]
cmd = 'php artisan serve --host=0.0.0.0 --port=8080'
```

### Startup Command di Coolify

Di panel Coolify → **Configuration → Start Command**, isi:

```bash
php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan serve --host=0.0.0.0 --port=8080
```

---

## 🔍 7. Verifikasi Setelah Deploy

Setelah Coolify selesai deploy, lakukan smoke test berikut:

| # | Cek | URL | Expected |
|---|-----|-----|----------|
| 1 | Halaman login accessible | `https://pos.infokelas.com/login` | Form login tampil |
| 2 | SSL aktif | Browser padlock | 🔒 Secure |
| 3 | Login sebagai Owner | `/dashboard` | Dashboard KPI tampil |
| 4 | Login sebagai Kasir | `/pos/offline` | Katalog produk tampil |
| 5 | Cek koneksi Pusher | Browser console | Tidak ada error WebSocket |
| 6 | PWA installable | Browser address bar | Install button tersedia |

---

## 📘 8. Panduan Singkat Pengguna

### 👑 Owner
- **Dashboard** `/dashboard` — KPI penjualan, laba kotor, margin real-time
- **Pricing** `/pricing` — Set margin, lock/unlock harga jual, tier grosir
- **Approve Waste** `/inventory/waste` — Review & setujui atau tolak laporan waste
- **Approve Opname** `/inventory/opname` — Validasi hasil stock opname dari Stockist
- **Laporan** `/reports/*` — Laba Rugi, Penjualan, Stok, Waste, Shift, HPP

### 📦 Stockist
- **Purchase Order** `/procurement/purchase-orders` — Buat PO, konfirmasi, batalkan
- **Inbound** `/procurement/inbounds` — Terima barang, stok & WAC otomatis update
- **Mutasi Stok** `/inventory/mutations` — Transfer antar gudang dengan tracking loss
- **Waste** `/inventory/waste` — Laporkan produk rusak/busuk
- **Stock Opname** `/inventory/opname` — Audit fisik stok berkala
- **Reorder Point** `/inventory/reorder-points` — Set batas minimum stok + notifikasi

### 💼 Kasir
- **Buka Shift** `/shift` — Input saldo awal sebelum berjualan
- **POS Offline** `/pos/offline` — Transaksi penjualan (support gramasi desimal & tier harga)
- **Offline Mode** — Tetap bisa bertransaksi saat internet mati; auto-sync saat online kembali
- **Tutup Shift** `/shift` — Input saldo akhir kas, sistem hitung selisih otomatis

### 🛡️ Admin
- **POS Online** `/pos/online` — Transaksi langsung ke server (tanpa antrian sync)

---

## 🚑 9. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Deploy gagal di Coolify | Cek build log di panel Coolify; biasanya karena `npm run build` gagal atau file `.env` belum lengkap |
| Error 500 setelah deploy | Pastikan `php artisan migrate --force` sudah dijalankan via Coolify startup command |
| POS offline tidak sync | Kasir klik tombol 📤 Sync manual; periksa apakah sesi login masih aktif |
| Notifikasi low-stock tidak muncul | Cek queue worker aktif di Coolify; verifikasi kredensial Pusher di Environment Variables |
| Harga tidak muncul di POS | Pastikan produk sudah di-**Lock** di Pricing Engine oleh Owner |
