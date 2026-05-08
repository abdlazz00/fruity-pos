<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockOpname extends Model
{
    protected $fillable = [
        'opname_number', 'location_id', 'conducted_by',
        'approved_by', 'opname_date', 'status',
        'total_shrinkage_value', 'approved_at',
    ];

    protected $casts = [
        'opname_date'           => 'date',
        'approved_at'           => 'datetime',
        'total_shrinkage_value' => 'decimal:2',
    ];

    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }

    // ── Relationships ──

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function conductor()
    {
        return $this->belongsTo(User::class, 'conducted_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items()
    {
        return $this->hasMany(StockOpnameItem::class);
    }

    // ── Auto-generate Opname Number ──

    /**
     * Generate opname number: OPN-{STORE_CODE}-YYYYMMDD-XXXX
     */
    public static function generateOpnameNumber(int $locationId): string
    {
        $location = Location::findOrFail($locationId);
        $dateStr  = now()->format('Ymd');
        $prefix   = "OPN-{$location->code}-{$dateStr}";

        $last = self::where('opname_number', 'like', "{$prefix}-%")
            ->orderByRaw("CAST(SUBSTRING(opname_number, " . (strlen($prefix) + 2) . ") AS UNSIGNED) DESC")
            ->first();

        $nextSeq = $last
            ? ((int) substr($last->opname_number, strlen($prefix) + 1)) + 1
            : 1;

        return $prefix . '-' . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
    }

    // ── Status helpers ──

    public function isInProgress(): bool { return $this->status === 'in_progress'; }
    public function isSubmitted(): bool  { return $this->status === 'submitted'; }
    public function isApproved(): bool   { return $this->status === 'approved'; }
}
