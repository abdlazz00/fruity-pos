<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeightSafeguard extends Model
{
    protected $fillable = ['product_id', 'min_weight_gram', 'max_weight_gram'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
