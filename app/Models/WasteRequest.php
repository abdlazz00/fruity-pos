<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WasteRequest extends Model
{
    protected $fillable = [
        'request_number', 'location_id', 'requested_by',
        'approved_by', 'status', 'rejection_reason', 'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
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

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items()
    {
        return $this->hasMany(WasteRequestItem::class);
    }

    // ── Auto-generate Request Number ──

    /**
     * Generate waste request number: WST-{STORE_CODE}-YYYYMMDD-XXXX
     */
    public static function generateRequestNumber(int $locationId): string
    {
        $location = Location::findOrFail($locationId);
        $dateStr  = now()->format('Ymd');
        $prefix   = "WST-{$location->code}-{$dateStr}";

        $last = self::where('request_number', 'like', "{$prefix}-%")
            ->orderByRaw("CAST(SUBSTRING(request_number, " . (strlen($prefix) + 2) . ") AS UNSIGNED) DESC")
            ->first();

        $nextSeq = $last
            ? ((int) substr($last->request_number, strlen($prefix) + 1)) + 1
            : 1;

        return $prefix . '-' . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
    }

    // ── Status helpers ──

    public function isPending(): bool  { return $this->status === 'pending'; }
    public function isApproved(): bool { return $this->status === 'approved'; }
    public function isRejected(): bool { return $this->status === 'rejected'; }
}
