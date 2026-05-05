<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'transaction_number', 'shift_id', 'location_id', 'user_id', 'type',
        'customer_name', 'customer_phone', 'customer_address',
        'platform', 'courier', 'shipping_method', 'shipping_cost',
        'subtotal', 'discount_amount', 'discount_note', 'total',
        'payment_method', 'payment_amount', 'change_amount', 'status',
        'offline_uuid',
    ];

    protected $casts = [
        'shipping_cost'   => 'decimal:2',
        'subtotal'        => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total'           => 'decimal:2',
        'payment_amount'  => 'decimal:2',
        'change_amount'   => 'decimal:2',
    ];

    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d H:i:s');
    }

    // ── Relationships ──

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    // ── Auto-generate Transaction Number ──

    /**
     * Generate nomor transaksi: TRX-{LOC_CODE}-{YYYYMMDD}-{NNNN}
     */
    public static function generateNumber(string $locationCode): string
    {
        $prefix = 'TRX-' . strtoupper($locationCode) . '-' . now()->format('Ymd');

        $last = self::where('transaction_number', 'like', $prefix . '-%')
            ->orderByRaw('CAST(SUBSTRING(transaction_number, ' . (strlen($prefix) + 2) . ') AS UNSIGNED) DESC')
            ->first();

        $nextNumber = 1;
        if ($last) {
            $lastNumber = (int) substr($last->transaction_number, strlen($prefix) + 1);
            $nextNumber = $lastNumber + 1;
        }

        return $prefix . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    // ── Helpers ──

    public function isVoided(): bool
    {
        return $this->status === 'voided';
    }
}
