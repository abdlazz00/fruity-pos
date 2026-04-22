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
            'sku' => 'nullable|string|max:50|unique:products,sku,' . $productId,
            'description' => 'nullable|string',
            'type' => 'required|string|in:tunggal,pack',
            'has_sn' => 'boolean',
            'status' => 'required|string|in:active,inactive',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',

            // Validation for Product Units
            'units' => 'nullable|array',
            'units.*.name' => 'required_with:units|string|max:50',
            'units.*.conversion_factor' => 'required_with:units|numeric|min:0.0001',
            'units.*.price_purchase' => 'required_with:units|numeric|min:0',
            'units.*.price_sales' => 'required_with:units|numeric|min:0',
            'units.*.is_default' => 'boolean',

            // Validation for Weight Safeguard
            'safeguard' => 'nullable|array',
            'safeguard.limit_value' => 'required_with:safeguard|numeric|min:0',
            'safeguard.limit_unit' => 'required_with:safeguard|string|in:gram,percentage',
            'safeguard.action' => 'required_with:safeguard|string|in:warning,block',
        ];
    }
}
