<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id', 'name', 'sku', 'description', 'type', 'has_sn',
        'base_uom', 'image_path', 'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'has_sn' => 'boolean',
    ];

    // Accessor: frontend expects 'status' as 'active'/'inactive'
    public function getStatusAttribute()
    {
        return $this->is_active ? 'active' : 'inactive';
    }

    // Accessor: include 'status' in JSON serialization
    protected $appends = ['status'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function units()
    {
        return $this->hasMany(ProductUnit::class);
    }

    public function safeguard()
    {
        return $this->hasOne(WeightSafeguard::class);
    }

    public function price()
    {
        return $this->hasOne(ProductPrice::class);
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }

    /**
     * Auto-generate SKU berdasarkan kategori dan urutan.
     * Format: [3 huruf kategori]-[5 digit angka], contoh: BLK-00012
     */
    public static function generateSku($categoryId = null): string
    {
        // Buat prefix dari nama kategori
        $prefix = 'PRD';
        if ($categoryId) {
            $category = Category::find($categoryId);
            if ($category) {
                // Ambil 3 huruf pertama dari nama kategori, uppercase
                $prefix = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $category->name), 0, 3));
                if (strlen($prefix) < 3) {
                    $prefix = str_pad($prefix, 3, 'X');
                }
            }
        }

        // Cari nomor urut terbesar untuk prefix ini
        $lastProduct = self::where('sku', 'like', $prefix . '-%')
            ->orderByRaw('CAST(SUBSTRING(sku, ' . (strlen($prefix) + 2) . ') AS UNSIGNED) DESC')
            ->first();

        if ($lastProduct) {
            $lastNumber = (int) substr($lastProduct->sku, strlen($prefix) + 1);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . '-' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }
}
