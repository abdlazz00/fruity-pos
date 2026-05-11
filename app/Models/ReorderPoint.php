<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReorderPoint extends Model
{
    protected $fillable = [
        'product_id',
        'location_id',
        'min_quantity',
        'is_active',
        'last_notified_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'min_quantity'      => 'decimal:2',
        'is_active'         => 'boolean',
        'last_notified_at'  => 'datetime',
    ];

    // ── Relationships ──

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // ── Helpers ──

    /**
     * Check if the cooldown period (1 hour) has elapsed since last notification (FR-1214).
     */
    public function isCooldownExpired(): bool
    {
        if (is_null($this->last_notified_at)) {
            return true;
        }

        return $this->last_notified_at->addHour()->isPast();
    }
}
