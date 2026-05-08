// resources/js/lib/offlineDB.js
// S7-F05 & S7-F06: Dexie.js IndexedDB schema + CRUD operations
// Digunakan untuk menyimpan catalog cache dan transaksi pending saat offline.

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

// ══════════════════════════════════════════
// ── Catalog Cache ──
// ══════════════════════════════════════════

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

// ══════════════════════════════════════════
// ── Pending Transactions ──
// ══════════════════════════════════════════

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
