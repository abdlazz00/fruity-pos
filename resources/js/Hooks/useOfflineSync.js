// resources/js/Hooks/useOfflineSync.js
// S7-F07: Custom React hook untuk mendeteksi status koneksi,
// auto-sync pending transactions saat kembali online,
// dan expose fungsi manual sync + pending count untuk UI indicator.

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

      // Kirim batch ke backend (max 50 per request sesuai backend limit)
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
