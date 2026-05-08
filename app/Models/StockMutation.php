<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMutation extends Model
{
    protected $fillable = [
        'mutation_number', 'from_location_id', 'to_location_id',
        'created_by', 'received_by', 'status',
        'shipped_at', 'received_at', 'notes',
    ];

    protected $casts = [
        'shipped_at'  => 'datetime',
        'received_at' => 'datetime',
    ];

    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }

    // ── Relationships ──

    public function fromLocation()
    {
        return $this->belongsTo(Location::class, 'from_location_id');
    }

    public function toLocation()
    {
        return $this->belongsTo(Location::class, 'to_location_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function items()
    {
        return $this->hasMany(StockMutationItem::class);
    }

    // ── Auto-generate Mutation Number ──

    /**
     * Generate mutation number: MUT-{STORE_CODE}-YYYYMMDD-XXXX
     */
    public static function generateMutationNumber(int $locationId): string
    {
        $location = Location::findOrFail($locationId);
        $dateStr  = now()->format('Ymd');
        $prefix   = "MUT-{$location->code}-{$dateStr}";

        $last = self::where('mutation_number', 'like', "{$prefix}-%")
            ->orderByRaw("CAST(SUBSTRING(mutation_number, " . (strlen($prefix) + 2) . ") AS UNSIGNED) DESC")
            ->first();

        $nextSeq = $last
            ? ((int) substr($last->mutation_number, strlen($prefix) + 1)) + 1
            : 1;

        return $prefix . '-' . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
    }

    // ── Status helpers ──

    public function isPreparing(): bool { return $this->status === 'preparing'; }
    public function isShipped(): bool   { return $this->status === 'shipped'; }
    public function isReceived(): bool  { return $this->status === 'received'; }
    public function isCompleted(): bool { return $this->status === 'completed'; }
}
