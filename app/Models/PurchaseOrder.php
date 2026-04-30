<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'po_number', 'supplier_id', 'location_id', 'created_by',
        'order_date', 'status', 'notes',
    ];

    protected $casts = [
        'order_date' => 'datetime:Y-m-d H:i:s',
    ];

    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }

    // ── Relationships ──

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function inbounds()
    {
        return $this->hasMany(Inbound::class);
    }

    // ── Auto-generate PO Number ──

    /**
     * Generate PO number: PO-{STORE_CODE}-YYYYMMDD-XXXX
     * e.g. PO-SRP-20260428-0001
     */
    public static function generatePoNumber(int $locationId): string
    {
        $location = Location::findOrFail($locationId);
        $dateStr  = now()->format('Ymd');
        $prefix   = "PO-{$location->code}-{$dateStr}";

        $lastPo = self::where('po_number', 'like', "{$prefix}-%")
            ->orderByRaw("CAST(SUBSTRING(po_number, " . (strlen($prefix) + 2) . ") AS UNSIGNED) DESC")
            ->first();

        $nextSeq = $lastPo
            ? ((int) substr($lastPo->po_number, strlen($prefix) + 1)) + 1
            : 1;

        return $prefix . '-' . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
    }

    // ── Status helpers ──

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isConfirmed(): bool
    {
        return in_array($this->status, ['confirmed', 'partially_received']);
    }

    public function isEditable(): bool
    {
        return $this->isDraft();
    }
}
