<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WasteRequestItem extends Model
{
    protected $fillable = [
        'waste_request_id', 'product_id',
        'quantity', 'reason', 'photo_path', 'hpp_value',
    ];

    protected $casts = [
        'quantity'  => 'decimal:2',
        'hpp_value' => 'decimal:2',
    ];

    // ── Relationships ──

    public function wasteRequest()
    {
        return $this->belongsTo(WasteRequest::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
