<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InboundItem extends Model
{
    protected $fillable = [
        'inbound_id', 'product_id', 'product_unit_id',
        'quantity_received', 'total_buy_price', 'content_per_unit',
        'hpp_raw_calculated',
    ];

    protected $casts = [
        'quantity_received'   => 'decimal:2',
        'total_buy_price'     => 'decimal:2',
        'hpp_raw_calculated'  => 'decimal:2',
    ];

    // ── Relationships ──

    public function inbound()
    {
        return $this->belongsTo(Inbound::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function productUnit()
    {
        return $this->belongsTo(ProductUnit::class);
    }
}
