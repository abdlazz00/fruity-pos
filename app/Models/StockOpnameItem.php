<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockOpnameItem extends Model
{
    protected $fillable = [
        'stock_opname_id', 'product_id',
        'system_quantity', 'physical_quantity',
        'difference', 'shrinkage_value',
    ];

    protected $casts = [
        'system_quantity'   => 'decimal:2',
        'physical_quantity' => 'decimal:2',
        'difference'        => 'decimal:2',
        'shrinkage_value'   => 'decimal:2',
    ];

    // ── Relationships ──

    public function opname()
    {
        return $this->belongsTo(StockOpname::class, 'stock_opname_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
