<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $table = 'inventories';

    protected $fillable = [
        'product_id', 'location_id', 'quantity', 'avg_cost',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'avg_cost' => 'decimal:2',
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
}
