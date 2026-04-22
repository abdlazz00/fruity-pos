<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductUnit extends Model
{
    protected $fillable = ['product_id', 'unit_name', 'conversion_to_base'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
