# 🎨 Sprint 7 Frontend Guideline — POS Online + Offline Sync

Dokumen ini adalah panduan bagi developer frontend untuk mengimplementasikan fitur offline-first pada POS Kasir Sprint 7. Backend sudah siap (`sprint_7_backend_summary.md`).

**Untuk:** Tim Frontend (React + Inertia.js)  
**Tanggal:** 5 Mei 2026  
**Backend Status:** ✅ Semua endpoint siap digunakan  
**Dependency Baru:** `dexie` (IndexedDB wrapper), `uuid` (UUID v4 generation)

---

## 1. Daftar Task & Komponen yang Perlu Dibuat

| ID | Task / Komponen | File | Prioritas | Est |
|----|-----------------|------|-----------|-----|
| S7-F05 | Setup Dexie.js schema | `lib/offlineDB.js` | 🔴 Tinggi | 3h |
| S7-F06 | CRUD operations untuk Dexie | `lib/offlineDB.js` | 🔴 Tinggi | 2h |
| S7-F07 | Hook `useOfflineSync` | `Hooks/useOfflineSync.js` | 🔴 Tinggi | 4h |
| S7-F08 | Service Worker (Workbox) | `public/sw.js` + Vite config | 🟡 Sedang | 3h |
| S7-F09 | Offline Indicator Badge | `Components/OfflineIndicator.jsx` | 🟢 Rendah | 1h |
| S7-F10 | Modifikasi POS Offline (dual-path) | `Pages/Pos/Offline.jsx` | 🔴 Tinggi | 3h |
| S7-F11 | UUID v4 per transaksi offline | Terintegrasi di Offline.jsx | 🟢 Rendah | 1h |

> **Catatan:** Task S7-F01 s/d S7-F04 (halaman POS Online, form pelanggan, pengiriman, pembayaran) **sudah selesai** di Sprint 6 dalam `Pages/Pos/Online.jsx`. Tidak perlu dibangun ulang.

---

## 2. Instalasi Dependency

```bash
npm install dexie uuid
```

| Package | Versi | Fungsi |
|---------|-------|--------|
| `dexie` | ^4.x | Wrapper IndexedDB dengan API Promise |
| `uuid` | ^11.x | UUID v4 generation untuk `offline_uuid` |

---

## 3. S7-F05 & S7-F06: Setup Dexie.js (`lib/offlineDB.js`)

### Schema Definition

```javascript
// resources/js/lib/offlineDB.js
import Dexie from 'dexie';

const db = new Dexie('FruityPOS');

db.version(1).stores({
  // Katalog cache — mirror dari server catalog
  products: 'product_id, name, sku, category',

  // Harga + tiers cache
  prices: 'product_id',

  // Transaksi pending sync
  pendingTransactions: '++id, offline_uuid, shift_id, status, created_at',
});

export default db;
```

### CRUD Operations

```javascript
// ── Catalog Cache ──

/**
 * Simpan seluruh catalog dari server ke IndexedDB.
 * Dipanggil saat halaman POS pertama kali dimuat (online).
 */
export async function cacheCatalog(catalog) {
  await db.products.clear();
  await db.prices.clear();

  const products = catalog.map(item => ({
    product_id: item.product_id,
    name: item.name,
    sku: item.sku,
    category: item.category,
    image_path: item.image_path,
    selling_price: item.selling_price,
    stock: item.stock,
    in_stock: item.in_stock,
  }));

  const prices = catalog.map(item => ({
    product_id: item.product_id,
    selling_price: item.selling_price,
    tiers: item.tiers || [],
  }));

  await db.products.bulkPut(products);
  await db.prices.bulkPut(prices);
}

/**
 * Baca catalog dari IndexedDB (dipakai saat offline).
 */
export async function getOfflineCatalog() {
  const products = await db.products.toArray();
  const prices = await db.prices.toArray();

  return products.map(p => {
    const priceData = prices.find(pr => pr.product_id === p.product_id);
    return {
      ...p,
      selling_price: priceData?.selling_price || 0,
      tiers: priceData?.tiers || [],
    };
  });
}

// ── Pending Transactions ──

/**
 * Simpan transaksi offline ke IndexedDB (queue).
 */
export async function savePendingTransaction(transaction) {
  return db.pendingTransactions.add({
    ...transaction,
    status: 'pending',
    created_at: new Date().toISOString(),
  });
}

/**
 * Ambil semua transaksi yang belum di-sync.
 */
export async function getPendingTransactions() {
  return db.pendingTransactions
    .where('status')
    .equals('pending')
    .toArray();
}

/**
 * Update status transaksi setelah sync (synced/failed/duplicate).
 */
export async function updateTransactionStatus(id, status) {
  return db.pendingTransactions.update(id, { status });
}

/**
 * Hapus transaksi yang sudah berhasil di-sync atau duplicate.
 */
export async function removeSyncedTransactions() {
  return db.pendingTransactions
    .where('status')
    .anyOf(['synced', 'duplicate'])
    .delete();
}

/**
 * Hitung jumlah transaksi pending.
 */
export async function countPending() {
  return db.pendingTransactions
    .where('status')
    .equals('pending')
    .count();
}
```

---

## 4. S7-F07: Hook `useOfflineSync` (`Hooks/useOfflineSync.js`)

### Fitur Utama
- Deteksi status koneksi (online/offline) secara reaktif
- Auto-sync pending transactions saat koneksi kembali pulih
- Expose fungsi manual sync
- Expose pending count untuk UI indicator

### Implementasi

```javascript
// resources/js/Hooks/useOfflineSync.js
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  getPendingTransactions,
  updateTransactionStatus,
  removeSyncedTransactions,
  countPending,
} from '../lib/offlineDB';

export default function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const syncInProgress = useRef(false);

  // ── Listen to online/offline events ──
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // ── Refresh pending count ──
  const refreshPendingCount = useCallback(async () => {
    const count = await countPending();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // ── Core sync function ──
  const syncNow = useCallback(async () => {
    if (syncInProgress.current || !navigator.onLine) return null;

    syncInProgress.current = true;
    setIsSyncing(true);

    try {
      const pending = await getPendingTransactions();

      if (pending.length === 0) {
        setIsSyncing(false);
        syncInProgress.current = false;
        return { synced: 0, message: 'Tidak ada transaksi pending.' };
      }

      // Kirim batch ke backend
      const payload = {
        transactions: pending.map(tx => ({
          offline_uuid: tx.offline_uuid,
          shift_id: tx.shift_id,
          items: tx.items,
          discount_amount: tx.discount_amount || 0,
          discount_note: tx.discount_note || null,
          payment_method: tx.payment_method,
          payment_amount: tx.payment_amount,
        })),
      };

      const response = await axios.post('/pos/offline/sync', payload);
      const result = response.data;

      // Update status per transaksi di IndexedDB
      for (const res of result.results) {
        const match = pending.find(tx => tx.offline_uuid === res.offline_uuid);
        if (match) {
          await updateTransactionStatus(match.id, res.status);
        }
      }

      // Hapus yang sudah synced/duplicate dari IndexedDB
      await removeSyncedTransactions();
      await refreshPendingCount();

      setLastSyncResult(result);
      return result;

    } catch (error) {
      console.error('Sync failed:', error);
      setLastSyncResult({ error: true, message: error.message });
      return null;
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
    }
  }, [refreshPendingCount]);

  // ── Auto-sync saat kembali online ──
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncNow();
    }
  }, [isOnline, pendingCount, syncNow]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncResult,
    syncNow,
    refreshPendingCount,
  };
}
```

---

## 5. S7-F09: Komponen `OfflineIndicator.jsx`

### Desain UI
Badge kecil di header/toolbar POS yang menunjukkan status koneksi.

```javascript
// resources/js/Components/OfflineIndicator.jsx
import React from 'react';

export default function OfflineIndicator({ isOnline, pendingCount, isSyncing, onSyncClick }) {
  return (
    <div className="flex items-center gap-2">
      {/* Connection Status Dot */}
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
        isOnline 
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
          : 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
        {isOnline ? 'Online' : 'Offline'}
      </div>

      {/* Pending Sync Badge */}
      {pendingCount > 0 && (
        <button
          onClick={onSyncClick}
          disabled={isSyncing || !isOnline}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            isSyncing
              ? 'bg-blue-50 text-blue-600 border border-blue-200 cursor-wait'
              : isOnline
                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer'
                : 'bg-gray-50 text-gray-500 border border-gray-200 cursor-not-allowed'
          }`}
        >
          {isSyncing ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Syncing...
            </>
          ) : (
            <>📤 {pendingCount} Pending</>
          )}
        </button>
      )}
    </div>
  );
}
```

### Penempatan
Letakkan di **banner atas halaman POS**, menggantikan atau di samping banner kuning yang sudah ada:

```jsx
// Di Pos/Offline.jsx, di dalam return, sebelum 2-column layout:
<OfflineIndicator 
  isOnline={isOnline}
  pendingCount={pendingCount}
  isSyncing={isSyncing}
  onSyncClick={syncNow}
/>
```

---

## 6. S7-F10 & S7-F11: Modifikasi `Pages/Pos/Offline.jsx`

### Konsep Dual-Path
POS sekarang memiliki dua jalur penyimpanan:
- **Online:** Kirim langsung ke `POST /pos/offline` (seperti sebelumnya)
- **Offline:** Simpan ke Dexie.js IndexedDB + generate `offline_uuid`

### Perubahan yang Dibutuhkan

#### A. Import Dependencies Baru
```javascript
import { v4 as uuidv4 } from 'uuid';
import useOfflineSync from '../../Hooks/useOfflineSync';
import { cacheCatalog, savePendingTransaction, getOfflineCatalog } from '../../lib/offlineDB';
import OfflineIndicator from '../../Components/OfflineIndicator';
```

#### B. Setup Hook & Cache
```javascript
export default function PosOffline({ shift, catalog: serverCatalog }) {
    const { isOnline, isSyncing, pendingCount, syncNow, refreshPendingCount } = useOfflineSync();
    const [catalog, setCatalog] = useState(serverCatalog);

    // Cache catalog ke IndexedDB saat online
    useEffect(() => {
        if (serverCatalog && serverCatalog.length > 0) {
            cacheCatalog(serverCatalog);
        }
    }, [serverCatalog]);

    // Jika page load gagal (offline reload), load dari IndexedDB
    useEffect(() => {
        if (!serverCatalog || serverCatalog.length === 0) {
            getOfflineCatalog().then(offlineCatalog => {
                if (offlineCatalog.length > 0) {
                    setCatalog(offlineCatalog);
                }
            });
        }
    }, [serverCatalog]);

    // ... existing state (cart, searchQuery, dll.)
```

#### C. Modifikasi `handlePaymentConfirm` (Dual-Path)

```javascript
const handlePaymentConfirm = async (paymentData) => {
    const transactionData = {
        shift_id: shift.id,
        items: cart.map(item => ({ product_id: item.product_id, qty: item.qty })),
        discount_amount: numDiscount,
        discount_note: discountNote || null,
        payment_method: paymentData.payment_method,
        payment_amount: paymentData.payment_amount,
    };

    if (isOnline) {
        // ── PATH A: Online → kirim langsung ke server ──
        router.post('/pos/offline', {
            ...transactionData,
            offline_uuid: uuidv4(),   // Tetap kirim UUID untuk idempotency
        }, {
            preserveScroll: true,
            onSuccess: () => {
                resetCart();
                setResultModalState({
                    isOpen: true,
                    status: 'success',
                    transaction: {
                        transaction_number: 'Baru Saja',
                        total: cartTotal,
                        payment_method: paymentData.payment_method,
                        change_amount: paymentData.payment_method === 'cash' 
                            ? Math.max(0, paymentData.payment_amount - cartTotal) 
                            : 0
                    }
                });
            },
            onError: () => {
                setResultModalState({ isOpen: true, status: 'error', transaction: null });
            }
        });

    } else {
        // ── PATH B: Offline → simpan ke IndexedDB ──
        try {
            await savePendingTransaction({
                offline_uuid: uuidv4(),
                ...transactionData,
            });

            await refreshPendingCount();
            resetCart();

            setResultModalState({
                isOpen: true,
                status: 'success',
                transaction: {
                    transaction_number: '⏳ Tersimpan Offline',
                    total: cartTotal,
                    payment_method: paymentData.payment_method,
                    change_amount: paymentData.payment_method === 'cash'
                        ? Math.max(0, paymentData.payment_amount - cartTotal)
                        : 0,
                }
            });
        } catch (err) {
            console.error('Failed to save offline transaction:', err);
            setResultModalState({ isOpen: true, status: 'error', transaction: null });
        }
    }
};

// Helper function
const resetCart = () => {
    setCart([]);
    setDiscountAmount('');
    setDiscountNote('');
    setIsPaymentModalOpen(false);
};
```

#### D. Tambah OfflineIndicator di UI
Ganti atau tambahkan di sebelah banner kuning yang sudah ada:

```jsx
{/* Offline/Online Status Banner */}
<div className="flex items-center justify-between mb-4">
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg flex items-center flex-1 mr-4">
        <p className="text-sm text-yellow-700">
            {isOnline 
                ? 'Mode Kasir Fisik — Transaksi langsung tersimpan ke server.'
                : '⚡ Mode Offline — Transaksi disimpan lokal, otomatis sync saat online.'}
        </p>
    </div>
    <OfflineIndicator 
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onSyncClick={syncNow}
    />
</div>
```

---

## 7. S7-F08: Service Worker (Stretch Goal)

### Fungsi
Cache asset frontend (JS/CSS/images) agar halaman POS bisa diakses meskipun internet mati total (bukan hanya API yang offline).

### Setup Dasar (Workbox via Vite Plugin)

```bash
npm install -D vite-plugin-pwa
```

```javascript
// vite.config.js — tambahkan:
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        // ... existing plugins
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https?:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: { cacheName: 'google-fonts' },
                    },
                ],
            },
            manifest: {
                name: 'FruityPOS',
                short_name: 'FruityPOS',
                theme_color: '#1A3636',
                background_color: '#F3F4F6',
                display: 'standalone',
                icons: [
                    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
                ],
            },
        }),
    ],
});
```

> ⚠️ **Catatan:** Service Worker ini bersifat **stretch goal**. Fitur offline sync via Dexie.js sudah bisa berjalan tanpa PWA penuh. PWA hanya menambahkan kemampuan agar halaman POS bisa di-load saat internet benar-benar mati (bukan hanya API-nya).

---

## 8. API Contract — Sync Endpoint

### Request
```http
POST /pos/offline/sync
Content-Type: application/json
```

```json
{
  "transactions": [
    {
      "offline_uuid": "550e8400-e29b-41d4-a716-446655440000",
      "shift_id": 12,
      "items": [
        { "product_id": 5, "qty": 2.5 },
        { "product_id": 8, "qty": 1.0 }
      ],
      "discount_amount": 0,
      "discount_note": null,
      "payment_method": "cash",
      "payment_amount": 50000
    }
  ]
}
```

### Response
```json
{
  "total_received": 1,
  "synced": 1,
  "duplicates": 0,
  "failed": 0,
  "results": [
    {
      "index": 0,
      "offline_uuid": "550e8400-e29b-41d4-a716-446655440000",
      "status": "synced",
      "message": "Berhasil disinkronkan.",
      "transaction_number": "TRX-SRP-20260505-0001",
      "transaction_id": 42
    }
  ]
}
```

### Status per Transaksi

| Status | Artinya | Aksi Frontend |
|:-------|:--------|:-------------|
| `synced` | Berhasil tersimpan di server | Hapus dari IndexedDB |
| `duplicate` | UUID sudah ada di server | Hapus dari IndexedDB (sudah aman) |
| `failed` | Validasi gagal / stok habis | Tetap di IndexedDB, bisa retry nanti |

---

## 9. Aturan Keamanan UI (Tetap Berlaku)

| Rule | Keterangan |
|------|------------|
| ❌ HPP | TIDAK BOLEH ditampilkan di halaman POS manapun |
| ❌ Margin | TIDAK BOLEH ditampilkan di halaman POS manapun |
| ❌ avg_cost | TIDAK BOLEH ditampilkan di halaman POS manapun |
| ✅ Harga Jual | Yang ditampilkan hanya `selling_price` |
| ✅ Stok | Boleh ditampilkan sebagai indikator ketersediaan |
| ✅ offline_uuid | Internal only, TIDAK ditampilkan ke user |

---

## 10. Komponen yang Dipakai

| Komponen | Status | Catatan |
|----------|--------|---------|
| `AppLayout` | ✅ Sudah ada | Wrapper halaman |
| `ProductCard` | ✅ Sudah ada | Grid katalog POS |
| `CartItem` | ✅ Sudah ada | List item keranjang |
| `PaymentModal` | ✅ Sudah ada | Modal checkout |
| `TransactionResultModal` | ✅ Sudah ada | Popup sukses/gagal |
| `OfflineIndicator` | **🆕 Baru** | Badge status online/offline + pending count |

---

## 11. Flow Diagram

```
┌──────────────────────────────────────────────────────┐
│                   KASIR KLIK "BAYAR"                 │
└──────────────────────┬───────────────────────────────┘
                       │
              ┌────────▼────────┐
              │  navigator.onLine?  │
              └────────┬────────┘
                 ┌─────┴─────┐
                 │           │
            ╔════▼════╗  ╔═══▼════╗
            ║ ONLINE  ║  ║ OFFLINE║
            ╚════╤════╝  ╚═══╤════╝
                 │           │
        POST /pos/offline    savePendingTransaction()
        (+ offline_uuid)     ke IndexedDB
                 │           │
           ┌─────▼─────┐   ┌▼──────────────────┐
           │  Server    │   │  Tersimpan Lokal   │
           │  Langsung  │   │  (status: pending) │
           └─────┬─────┘   └──────┬─────────────┘
                 │                │
           SUKSES ✅         ┌────▼──────────┐
                             │ Internet Pulih │
                             └────┬──────────┘
                                  │
                          POST /pos/offline/sync
                          (batch semua pending)
                                  │
                         ┌────────▼────────┐
                         │  Per-transaksi: │
                         │  synced → hapus │
                         │  duplicate → hapus│
                         │  failed → retry  │
                         └─────────────────┘
```

---

## 12. Color Token Reference

| Elemen | Hex / Token |
|--------|-------------|
| Badge Online | `bg-emerald-50` text `#047857` |
| Badge Offline | `bg-red-50` text `#B91C1C` + `animate-pulse` |
| Badge Pending Sync | `bg-amber-50` text `#A16207` |
| Badge Syncing | `bg-blue-50` text `#2563EB` + spinner |
| Banner Offline Mode | `bg-yellow-50` border `#FBBF24` |

---

## 🔑 Environment Checklist

Sebelum mulai develop frontend Sprint 7, pastikan:

- [ ] MySQL aktif, `php artisan migrate` berhasil (termasuk 2 migration baru Sprint 7)
- [ ] `npm install dexie uuid` berhasil
- [ ] Minimal 1 Kasir dengan shift aktif
- [ ] Minimal 1 Produk aktif dengan harga yang sudah di-lock
- [ ] Jalankan `composer run dev` untuk start server + queue + vite
- [ ] Test di browser: buka DevTools → Network → centang "Offline" untuk simulasi
