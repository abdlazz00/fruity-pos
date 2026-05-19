import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import db, {
    cacheCatalog,
    getOfflineCatalog,
    savePendingTransaction,
    getPendingTransactions,
    updateTransactionStatus,
    removeSyncedTransactions,
    countPending,
} from '@/lib/offlineDB';

// ─────────────────────────────────────────────
// Test Catalog Data
// ─────────────────────────────────────────────

const mockCatalog = [
    {
        product_id: 1,
        name: 'Apel Fuji',
        sku: 'APEL-001',
        category: 'Buah Import',
        image_path: null,
        selling_price: 45000,
        stock: 100,
        in_stock: true,
        tiers: [{ min_qty: 10, tier_price: 40000 }],
    },
    {
        product_id: 2,
        name: 'Mangga Harum Manis',
        sku: 'MGG-001',
        category: 'Buah Lokal',
        image_path: '/img/mangga.jpg',
        selling_price: 35000,
        stock: 50,
        in_stock: true,
        tiers: [],
    },
];

// ─────────────────────────────────────────────
// Reset DB before each test
// ─────────────────────────────────────────────

beforeEach(async () => {
    await db.products.clear();
    await db.prices.clear();
    await db.pendingTransactions.clear();
});

describe('Catalog Cache — offlineDB', () => {
    it('caches catalog products to IndexedDB', async () => {
        await cacheCatalog(mockCatalog);

        const products = await db.products.toArray();
        expect(products).toHaveLength(2);
        expect(products[0].name).toBe('Apel Fuji');
        expect(products[1].name).toBe('Mangga Harum Manis');
    });

    it('caches product prices with tiers', async () => {
        await cacheCatalog(mockCatalog);

        const prices = await db.prices.toArray();
        expect(prices).toHaveLength(2);
        expect(prices[0].selling_price).toBe(45000);
        expect(prices[0].tiers).toHaveLength(1);
        expect(prices[0].tiers[0].tier_price).toBe(40000);
    });

    it('replaces existing catalog on re-cache', async () => {
        await cacheCatalog(mockCatalog);

        // Re-cache with only 1 product
        await cacheCatalog([mockCatalog[0]]);

        const products = await db.products.toArray();
        expect(products).toHaveLength(1);
    });

    it('retrieves offline catalog with merged prices', async () => {
        await cacheCatalog(mockCatalog);

        const catalog = await getOfflineCatalog();
        expect(catalog).toHaveLength(2);

        // Product 1 should have selling_price from prices table
        expect(catalog[0].selling_price).toBe(45000);
        expect(catalog[0].tiers).toHaveLength(1);

        // Product 2 should have empty tiers
        expect(catalog[1].selling_price).toBe(35000);
        expect(catalog[1].tiers).toHaveLength(0);
    });

    it('returns 0 selling_price when no price found', async () => {
        // Insert product directly without price
        await db.products.add({
            product_id: 99,
            name: 'Orphan Product',
            sku: 'ORP-001',
            category: 'Test',
            selling_price: 0,
            stock: 10,
            in_stock: true,
        });

        const catalog = await getOfflineCatalog();
        expect(catalog).toHaveLength(1);
        expect(catalog[0].selling_price).toBe(0);
        expect(catalog[0].tiers).toHaveLength(0);
    });
});

describe('Pending Transactions — offlineDB', () => {
    // ─────────────────────────────────────────────
    // Save & Retrieve
    // ─────────────────────────────────────────────

    it('saves a pending transaction', async () => {
        await savePendingTransaction({
            offline_uuid: 'uuid-1234',
            shift_id: 1,
            items: [{ product_id: 1, qty: 2, unit_price: 45000, subtotal: 90000 }],
            payment_method: 'cash',
            payment_amount: 100000,
        });

        const pending = await getPendingTransactions();
        expect(pending).toHaveLength(1);
        expect(pending[0].offline_uuid).toBe('uuid-1234');
        expect(pending[0].status).toBe('pending');
        expect(pending[0].created_at).toBeDefined();
    });

    it('saves multiple pending transactions', async () => {
        await savePendingTransaction({ offline_uuid: 'uuid-001', shift_id: 1, items: [], payment_method: 'cash', payment_amount: 50000 });
        await savePendingTransaction({ offline_uuid: 'uuid-002', shift_id: 1, items: [], payment_method: 'cash', payment_amount: 75000 });
        await savePendingTransaction({ offline_uuid: 'uuid-003', shift_id: 1, items: [], payment_method: 'qris', payment_amount: 100000 });

        const pending = await getPendingTransactions();
        expect(pending).toHaveLength(3);
    });

    // ─────────────────────────────────────────────
    // Count Pending
    // ─────────────────────────────────────────────

    it('counts pending transactions correctly', async () => {
        await savePendingTransaction({ offline_uuid: 'uuid-A', shift_id: 1, items: [], payment_method: 'cash', payment_amount: 50000 });
        await savePendingTransaction({ offline_uuid: 'uuid-B', shift_id: 1, items: [], payment_method: 'cash', payment_amount: 50000 });

        const count = await countPending();
        expect(count).toBe(2);
    });

    it('returns 0 when no pending transactions', async () => {
        const count = await countPending();
        expect(count).toBe(0);
    });

    // ─────────────────────────────────────────────
    // Status Update & Cleanup
    // ─────────────────────────────────────────────

    it('updates transaction status to synced', async () => {
        const id = await savePendingTransaction({ offline_uuid: 'uuid-sync', shift_id: 1, items: [], payment_method: 'cash', payment_amount: 50000 });

        await updateTransactionStatus(id, 'synced');

        const pending = await getPendingTransactions();
        expect(pending).toHaveLength(0); // No longer "pending"

        // But still exists in DB with new status
        const tx = await db.pendingTransactions.get(id);
        expect(tx.status).toBe('synced');
    });

    it('updates transaction status to failed', async () => {
        const id = await savePendingTransaction({ offline_uuid: 'uuid-fail', shift_id: 1, items: [], payment_method: 'cash', payment_amount: 50000 });

        await updateTransactionStatus(id, 'failed');

        const tx = await db.pendingTransactions.get(id);
        expect(tx.status).toBe('failed');

        // Failed transactions are still "pending count" = 0
        // (because getPendingTransactions only queries status='pending')
        const pending = await getPendingTransactions();
        expect(pending).toHaveLength(0);
    });

    it('removes synced and duplicate transactions', async () => {
        const id1 = await savePendingTransaction({ offline_uuid: 'uuid-1', shift_id: 1, items: [], payment_method: 'cash', payment_amount: 50000 });
        const id2 = await savePendingTransaction({ offline_uuid: 'uuid-2', shift_id: 1, items: [], payment_method: 'cash', payment_amount: 50000 });
        const id3 = await savePendingTransaction({ offline_uuid: 'uuid-3', shift_id: 1, items: [], payment_method: 'cash', payment_amount: 50000 });

        // Mark them as different statuses
        await updateTransactionStatus(id1, 'synced');
        await updateTransactionStatus(id2, 'duplicate');
        // id3 stays as 'pending'

        await removeSyncedTransactions();

        const remaining = await db.pendingTransactions.toArray();
        expect(remaining).toHaveLength(1);
        expect(remaining[0].offline_uuid).toBe('uuid-3');
        expect(remaining[0].status).toBe('pending');
    });

    it('keeps failed transactions after cleanup', async () => {
        const id1 = await savePendingTransaction({ offline_uuid: 'uuid-ok', shift_id: 1, items: [], payment_method: 'cash', payment_amount: 50000 });
        const id2 = await savePendingTransaction({ offline_uuid: 'uuid-fail', shift_id: 1, items: [], payment_method: 'cash', payment_amount: 50000 });

        await updateTransactionStatus(id1, 'synced');
        await updateTransactionStatus(id2, 'failed');

        await removeSyncedTransactions();

        const remaining = await db.pendingTransactions.toArray();
        expect(remaining).toHaveLength(1);
        expect(remaining[0].status).toBe('failed');
    });
});
