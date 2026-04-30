<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PricingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id'        => 'required|exists:products,id',
            'margin_percentage' => 'required|numeric|min:0|max:999',
            'rounding_to'       => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required'        => 'Produk wajib dipilih.',
            'product_id.exists'          => 'Produk tidak ditemukan.',
            'margin_percentage.required' => 'Persentase margin wajib diisi.',
            'margin_percentage.min'      => 'Margin tidak boleh negatif.',
        ];
    }
}
