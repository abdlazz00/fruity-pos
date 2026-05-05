<?php

namespace App\Services;

use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\Contracts\ShiftRepositoryInterface;
use Illuminate\Support\Facades\Log;

class OfflineSyncService
{
    protected $transactionRepo;
    protected $transactionService;
    protected $shiftRepo;

    public function __construct(
        TransactionRepositoryInterface $transactionRepo,
        TransactionService $transactionService,
        ShiftRepositoryInterface $shiftRepo
    ) {
        $this->transactionRepo = $transactionRepo;
        $this->transactionService = $transactionService;
        $this->shiftRepo = $shiftRepo;
    }

    /**
     * Sync a batch of offline transactions from Dexie.js (IndexedDB).
     *
     * Each transaction is processed independently within its own DB::transaction
     * so that a failure in one does not roll back the others.
     *
     * Returns an array of results per transaction:
     * [
     *   { offline_uuid, status: 'synced'|'duplicate'|'failed', message?, transaction_number? },
     *   ...
     * ]
     *
     * @param array $transactions   Array of raw transaction payloads from frontend
     * @param int   $userId         Authenticated user ID
     * @return array
     */
    public function syncBatch(array $transactions, int $userId): array
    {
        $results = [];
        $maxBatchSize = 50;

        // Limit batch size to prevent abuse
        $batch = array_slice($transactions, 0, $maxBatchSize);

        foreach ($batch as $index => $txData) {
            $offlineUuid = $txData['offline_uuid'] ?? null;

            // ── Guard: offline_uuid is required ──
            if (empty($offlineUuid)) {
                $results[] = [
                    'index'        => $index,
                    'offline_uuid' => null,
                    'status'       => 'failed',
                    'message'      => 'offline_uuid wajib diisi.',
                ];
                continue;
            }

            // ── Dedup Check (S7-B08) ──
            $existing = $this->transactionRepo->findByOfflineUuid($offlineUuid);
            if ($existing) {
                $results[] = [
                    'index'              => $index,
                    'offline_uuid'       => $offlineUuid,
                    'status'             => 'duplicate',
                    'message'            => 'Transaksi sudah pernah di-sync sebelumnya.',
                    'transaction_number' => $existing->transaction_number,
                ];
                continue;
            }

            // ── Process Transaction (S7-B09) ──
            try {
                $transaction = $this->transactionService->createOfflineTransaction(
                    $txData,
                    $userId
                );

                $results[] = [
                    'index'              => $index,
                    'offline_uuid'       => $offlineUuid,
                    'status'             => 'synced',
                    'message'            => 'Berhasil disinkronkan.',
                    'transaction_number' => $transaction->transaction_number,
                    'transaction_id'     => $transaction->id,
                ];

                Log::info("Offline sync: UUID {$offlineUuid} → {$transaction->transaction_number}");

            } catch (\Illuminate\Validation\ValidationException $e) {
                $results[] = [
                    'index'        => $index,
                    'offline_uuid' => $offlineUuid,
                    'status'       => 'failed',
                    'message'      => collect($e->errors())->flatten()->first() ?? 'Validasi gagal.',
                    'errors'       => $e->errors(),
                ];

                Log::warning("Offline sync failed (validation): UUID {$offlineUuid}", [
                    'errors' => $e->errors(),
                ]);

            } catch (\Exception $e) {
                $results[] = [
                    'index'        => $index,
                    'offline_uuid' => $offlineUuid,
                    'status'       => 'failed',
                    'message'      => 'Terjadi kesalahan saat memproses transaksi.',
                ];

                Log::error("Offline sync error: UUID {$offlineUuid}", [
                    'exception' => $e->getMessage(),
                    'trace'     => $e->getTraceAsString(),
                ]);
            }
        }

        return [
            'total_received' => count($batch),
            'synced'         => collect($results)->where('status', 'synced')->count(),
            'duplicates'     => collect($results)->where('status', 'duplicate')->count(),
            'failed'         => collect($results)->where('status', 'failed')->count(),
            'results'        => $results,
        ];
    }

    /**
     * Sync a single offline transaction.
     * Convenience wrapper for syncBatch with a single item.
     *
     * @param array $txData   Single transaction payload
     * @param int   $userId   Authenticated user ID
     * @return array          Single result entry
     */
    public function syncSingle(array $txData, int $userId): array
    {
        $batchResult = $this->syncBatch([$txData], $userId);
        return $batchResult['results'][0] ?? [
            'status'  => 'failed',
            'message' => 'Tidak ada data yang diproses.',
        ];
    }
}
