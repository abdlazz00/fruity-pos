<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user !== null && in_array($user->role->value, ['owner', 'stockist']);
    }

    public function rules(): array
    {
        $productId = $this->route('product') ? $this->route('product') : null;

        return [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:150|unique:products,name,' . $productId,
            'sku' => 'required|string|max:50|unique:products,sku,' . $productId,
            'base_uom' => 'required|string|max:20',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // 2MB max
            'is_active' => 'boolean',
            
            // Validation for Product Units
            'units' => 'nullable|array',
            'units.*.unit_name' => 'required_with:units|string|max:30',
            'units.*.conversion_to_base' => 'required_with:units|numeric|min:0.0001',

            // Validation for Weight Safeguard
            'safeguard' => 'nullable|array',
            'safeguard.min_weight_gram' => 'required_with:safeguard|integer|min:1',
            'safeguard.max_weight_gram' => 'required_with:safeguard|integer|gt:safeguard.min_weight_gram',
        ];
    }
}
