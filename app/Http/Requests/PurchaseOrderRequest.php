<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id'                   => 'required|exists:suppliers,id',
            'location_id'                   => 'required|exists:locations,id',
            'order_date'                    => 'required|date',
            'notes'                         => 'nullable|string|max:1000',

            // Items
            'items'                         => 'required|array|min:1',
            'items.*.product_id'            => 'required|exists:products,id',
            'items.*.product_unit_id'       => 'required|exists:product_units,id',
            'items.*.quantity_ordered'       => 'required|numeric|min:0.01',
            'items.*.estimated_price'       => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'supplier_id.required'              => 'Supplier wajib dipilih.',
            'location_id.required'              => 'Toko wajib dipilih.',
            'order_date.required'               => 'Tanggal pesanan wajib diisi.',
            'items.required'                    => 'Minimal 1 item produk harus ditambahkan.',
            'items.min'                         => 'Minimal 1 item produk harus ditambahkan.',
            'items.*.product_id.required'       => 'Produk wajib dipilih.',
            'items.*.product_unit_id.required'  => 'Satuan produk wajib dipilih.',
            'items.*.quantity_ordered.required'  => 'Jumlah pesanan wajib diisi.',
            'items.*.quantity_ordered.min'       => 'Jumlah pesanan minimal 0.01.',
        ];
    }
}
