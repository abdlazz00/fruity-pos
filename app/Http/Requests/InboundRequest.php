<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InboundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'purchase_order_id'                => 'required|exists:purchase_orders,id',
            'received_date'                    => 'required|date',
            'shipping_cost'                    => 'nullable|numeric|min:0',
            'notes'                            => 'nullable|string|max:1000',

            // Items
            'items'                            => 'required|array|min:1',
            'items.*.product_id'               => 'required|exists:products,id',
            'items.*.product_unit_id'          => 'required|exists:product_units,id',
            'items.*.quantity_received'        => 'required|numeric|min:0.01',
            'items.*.total_buy_price'          => 'required|numeric|min:0',
            'items.*.content_per_unit'         => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'purchase_order_id.required'            => 'Purchase Order wajib dipilih.',
            'purchase_order_id.exists'              => 'Purchase Order tidak ditemukan.',
            'received_date.required'                => 'Tanggal penerimaan wajib diisi.',
            'items.required'                        => 'Minimal 1 item harus diterima.',
            'items.min'                             => 'Minimal 1 item harus diterima.',
            'items.*.product_id.required'           => 'Produk wajib dipilih.',
            'items.*.quantity_received.required'    => 'Jumlah penerimaan wajib diisi.',
            'items.*.quantity_received.min'         => 'Jumlah penerimaan minimal 0.01.',
            'items.*.total_buy_price.required'      => 'Harga beli total wajib diisi.',
            'items.*.content_per_unit.required'     => 'Isi per unit wajib diisi.',
            'items.*.content_per_unit.min'          => 'Isi per unit minimal 1.',
        ];
    }
}
