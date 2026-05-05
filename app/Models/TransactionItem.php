<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    protected $fillable = [
        'transaction_id', 'product_id', 'product_name',
        'unit_price', 'hpp_at_sale', 'qty', 'subtotal',
    ];

    protected $casts = [
        'unit_price'   => 'decimal:2',
        'hpp_at_sale'  => 'decimal:2',
        'qty'          => 'decimal:2',
        'subtotal'     => 'decimal:2',
    ];

    // ── Relationships ──

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
