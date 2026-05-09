# 📝 Sprint 7 Execution Plan: POS Offline Sync

Berikut adalah perencanaan fase (*step-by-step*) yang akan kita lakukan untuk membangun fitur POS Offline-first di Sprint 7 ini, berdasarkan *blueprint* dan instruksi pada `sprint_7_frontend_guideline.md`.

---

## 🏗️ Fase 1: Instalasi & Infrastruktur Database Lokal
Pada fase pertama, kita akan menyiapkan fondasi penyimpanan lokal menggunakan IndexedDB.
- **Tugas Utama:**
  1. Melakukan instalasi pustaka `dexie` dan `uuid` melalui NPM.
  2. Membuat *file* `resources/js/lib/offlineDB.js`.
  3. Mendefinisikan skema tabel IndexedDB (`products`, `prices`, `pendingTransactions`).
  4. Menyusun fungsi *helper* CRUD (*cacheCatalog*, *getOfflineCatalog*, *savePendingTransaction*, *countPending*, dll).

---

## ⚙️ Fase 2: Logic Engine & Sinkronisasi
Fase ini berfokus pada otak di balik fitur sinkronisasi, di mana aplikasi harus pintar mendeteksi mati/nyalanya internet.
- **Tugas Utama:**
  1. Membuat *Custom Hook* di `resources/js/Hooks/useOfflineSync.js`.
  2. Memasang *event listener* `window.addEventListener('online'/'offline')` untuk bereaksi secara *real-time*.
  3. Menyusun algoritma *auto-sync* yang akan menembak *endpoint* `POST /pos/offline/sync` setiap kali aplikasi mendeteksi internet kembali pulih.
  4. Menangani respon server (mencatat log, mengubah status `synced`/`duplicate`, dan membersihkan antrean IndexedDB).

---

## 🎨 Fase 3: Komponen Indikator UI
Membangun elemen visual agar Kasir tetap tenang dan paham dengan situasi koneksi sistem.
- **Tugas Utama:**
  1. Membuat *file* komponen `resources/js/Components/OfflineIndicator.jsx`.
  2. Merakit *badge* dinamis berdasarkan *state* (`Online`, `Offline`, `Syncing`, `Pending Count`).
  3. Memastikan pewarnaan konsisten dengan panduan *design system* (Merah untuk *offline*, Hijau untuk *online*, Amber untuk antrean).

---

## 🔄 Fase 4: Modifikasi Dual-Path POS Offline (Inti Aplikasi)
Menyatukan semua *tools* yang dibuat pada Fase 1-3 ke dalam halaman kerja Kasir yang sebenarnya.
- **Tugas Utama:**
  1. Membuka `resources/js/Pages/Pos/Offline.jsx`.
  2. Menanamkan hook `useOfflineSync` dan komponen `OfflineIndicator` di *header* halaman.
  3. Menambahkan logika *fallback* keranjang: Jika aplikasi dibuka saat offline, tarik data katalog dari IndexedDB (`getOfflineCatalog()`).
  4. **Modifikasi Kritis:** Mengubah fungsi `handlePaymentConfirm`. Jika *online*, transaksi langsung dikirim ke server. Jika *offline*, transaksi dibungkus dengan ID `uuidv4()` dan diinjeksi ke IndexedDB.

---

## 🚀 Fase 5: PWA Service Worker & Testing (Stretch Goal)
Menyempurnakan ketahanan aplikasi dan melakukan simulasi QC E2E.
- **Tugas Utama:**
  1. Instalasi `vite-plugin-pwa` untuk *caching asset static* HTML/JS/CSS agar *browser* tetap bisa me-render halaman POS saat internet diputus total sejak awal.
  2. Memodifikasi `vite.config.js` untuk registrasi *Service Worker*.
  3. Menjalankan skenario E2E Simulation (Matikan koneksi -> Jual Barang -> Simpan Lokal -> Nyalakan Koneksi -> Pantau proses Auto-Sync).

---
