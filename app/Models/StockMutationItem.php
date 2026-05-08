<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMutationItem extends Model
{
    protected $fillable = [
        'stock_mutation_id', 'product_id',
        'quantity_sent', 'quantity_received', 'loss_quantity',
    ];

    protected $casts = [
        'quantity_sent'     => 'decimal:2',
        'quantity_received' => 'decimal:2',
        'loss_quantity'     => 'decimal:2',
    ];

    // ── Relationships ──

    public function mutation()
    {
        return $this->belongsTo(StockMutation::class, 'stock_mutation_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
