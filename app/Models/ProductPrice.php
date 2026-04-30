<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductPrice extends Model
{
    protected $fillable = [
        'product_id', 'hpp_baseline', 'margin_percentage',
        'selling_price', 'rounding_to', 'status',
        'locked_at', 'locked_by',
    ];

    protected $casts = [
        'hpp_baseline'      => 'decimal:2',
        'margin_percentage' => 'decimal:2',
        'selling_price'     => 'decimal:2',
        'rounding_to'       => 'integer',
        'locked_at'         => 'datetime',
    ];

    // ── Relationships ──

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function locker()
    {
        return $this->belongsTo(User::class, 'locked_by');
    }

    public function tiers()
    {
        return $this->hasMany(PriceTier::class)->orderBy('min_qty');
    }

    // ── Status helpers ──

    public function isLocked(): bool
    {
        return $this->status === 'locked';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
