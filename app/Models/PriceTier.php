<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PriceTier extends Model
{
    protected $fillable = [
        'product_price_id', 'label', 'min_qty', 'selling_price',
    ];

    protected $casts = [
        'min_qty'       => 'integer',
        'selling_price' => 'decimal:2',
    ];

    // ── Relationships ──

    public function productPrice()
    {
        return $this->belongsTo(ProductPrice::class);
    }
}
