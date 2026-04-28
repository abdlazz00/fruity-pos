<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id', 'product_id', 'product_unit_id',
        'quantity_ordered', 'estimated_price',
    ];

    protected $casts = [
        'quantity_ordered' => 'decimal:2',
        'estimated_price'  => 'decimal:2',
    ];

    // ── Relationships ──

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
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
