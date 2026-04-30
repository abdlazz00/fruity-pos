<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inbound extends Model
{
    protected $fillable = [
        'inbound_number', 'purchase_order_id', 'received_by',
        'location_id', 'received_date', 'shipping_cost', 'notes',
    ];

    protected $casts = [
        'received_date'  => 'datetime:Y-m-d H:i:s',
        'shipping_cost'  => 'decimal:2',
    ];

    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }

    // ── Relationships ──

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function items()
    {
        return $this->hasMany(InboundItem::class);
    }

    // ── Auto-generate Inbound Number ──

    /**
     * Generate inbound number: INB-{STORE_CODE}-YYYYMMDD-XXXX
     */
    public static function generateInboundNumber(int $locationId): string
    {
        $location = Location::findOrFail($locationId);
        $dateStr  = now()->format('Ymd');
        $prefix   = "INB-{$location->code}-{$dateStr}";

        $last = self::where('inbound_number', 'like', "{$prefix}-%")
            ->orderByRaw("CAST(SUBSTRING(inbound_number, " . (strlen($prefix) + 2) . ") AS UNSIGNED) DESC")
            ->first();

        $nextSeq = $last
            ? ((int) substr($last->inbound_number, strlen($prefix) + 1)) + 1
            : 1;

        return $prefix . '-' . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
    }
}
