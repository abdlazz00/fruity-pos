<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductUnit extends Model
{
    protected $fillable = [
        'product_id', 'unit_name', 'conversion_to_base',
        'price_purchase', 'price_sales', 'is_default'
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'price_purchase' => 'decimal:2',
        'price_sales' => 'decimal:2',
        'conversion_to_base' => 'decimal:4',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
