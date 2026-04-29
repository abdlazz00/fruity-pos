import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';

export default function Form({ purchaseOrder, suppliers, products, locations, userLocationId }) {
    const isEdit = !!purchaseOrder;
    
    const { data, setData, post, put, processing, errors } = useForm({
        supplier_id: purchaseOrder?.supplier_id || '',
        location_id: purchaseOrder?.location_id || userLocationId || '',
        order_date: purchaseOrder?.order_date || new Date().toISOString().split('T')[0],
        notes: purchaseOrder?.notes || '',
        items: purchaseOrder?.items?.map(item => ({
            id: item.id || null, // For edit tracking
            product_id: item.product?.id || item.product_id || '',
            product_unit_id: item.product_unit?.id || item.product_unit_id || '',
            quantity_ordered: item.quantity_ordered || '',
            estimated_price: item.estimated_price || ''
        })) || []
    });

    const [totalEstimate, setTotalEstimate] = useState(0);

    // Calculate total estimate whenever items change
    useEffect(() => {
        const total = data.items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity_ordered) || 0;
            const price = parseFloat(item.estimated_price) || 0;
            return sum + (qty * price);
        }, 0);
        setTotalEstimate(total);
    }, [data.items]);

    const handleAddItem = () => {
        setData('items', [...data.items, { product_id: '', product_unit_id: '', quantity_ordered: '', estimated_price: '' }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        
        // Reset unit if product changes
        if (field === 'product_id') {
            newItems[index].product_unit_id = '';
        }
        
        setData('items', newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/procurement/purchase-orders/${purchaseOrder.id}`);
        } else {
            post('/procurement/purchase-orders');
        }
    };

    // Format Rupiah
    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <AppLayout
            title={isEdit ? 'Edit Purchase Order' : 'Buat PO Baru'}
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Purchase Order', url: '/procurement/purchase-orders' },
                { label: isEdit ? 'Edit PO' : 'Buat PO Baru' },
            ]}
        >
            <Head title={isEdit ? 'Edit Purchase Order' : 'Buat PO Baru'} />

            <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#1C1C1C]">
                            {isEdit ? `Edit PO: ${purchaseOrder.po_number}` : 'Buat Purchase Order'}
                        </h1>
                        {isEdit && purchaseOrder.status !== 'draft' && (
                            <p className="text-danger text-sm mt-1">PO ini tidak dapat diedit karena statusnya {purchaseOrder.status}.</p>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <Link href="/procurement/purchase-orders">
                            <Button variant="ghost">Batal</Button>
                        </Link>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={processing || (isEdit && purchaseOrder?.status !== 'draft')}
                        >
                            {isEdit ? 'Simpan Perubahan' : 'Simpan Draft PO'}
                        </Button>
                    </div>
                </div>

                {/* General Info Card */}
                <div className="bg-white rounded-xl border border-border p-5">
                    <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Informasi Utama</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div>
                            <label className="block text-[13px] text-text-secondary mb-1.5">Supplier <span className="text-danger">*</span></label>
                            <select 
                                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 ${errors.supplier_id ? 'border-danger' : 'border-border focus:border-accent'}`}
                                value={data.supplier_id}
                                onChange={e => setData('supplier_id', e.target.value)}
                                disabled={isEdit && purchaseOrder?.status !== 'draft'}
                            >
                                <option value="">-- Pilih Supplier --</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.supplier_id && <p className="text-danger text-xs mt-1">{errors.supplier_id}</p>}
                        </div>

                        <div>
                            <label className="block text-[13px] text-text-secondary mb-1.5">Tanggal Order <span className="text-danger">*</span></label>
                            <input 
                                type="date" 
                                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 ${errors.order_date ? 'border-danger' : 'border-border focus:border-accent'}`}
                                value={data.order_date}
                                onChange={e => setData('order_date', e.target.value)}
                                disabled={isEdit && purchaseOrder?.status !== 'draft'}
                            />
                            {errors.order_date && <p className="text-danger text-xs mt-1">{errors.order_date}</p>}
                        </div>

                        {/* Location: Only show if user is Owner (userLocationId is null) */}
                        {!userLocationId && (
                            <div>
                                <label className="block text-[13px] text-text-secondary mb-1.5">Lokasi Toko <span className="text-danger">*</span></label>
                                <select 
                                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 ${errors.location_id ? 'border-danger' : 'border-border focus:border-accent'}`}
                                    value={data.location_id}
                                    onChange={e => setData('location_id', e.target.value)}
                                    disabled={isEdit && purchaseOrder?.status !== 'draft'}
                                >
                                    <option value="">-- Pilih Toko --</option>
                                    {locations.map(l => (
                                        <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                                    ))}
                                </select>
                                {errors.location_id && <p className="text-danger text-xs mt-1">{errors.location_id}</p>}
                            </div>
                        )}

                        <div className={!userLocationId ? '' : 'md:col-span-2'}>
                            <label className="block text-[13px] text-text-secondary mb-1.5">Catatan</label>
                            <input 
                                type="text"
                                placeholder="Opsional"
                                className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                disabled={isEdit && purchaseOrder?.status !== 'draft'}
                            />
                            {errors.notes && <p className="text-danger text-xs mt-1">{errors.notes}</p>}
                        </div>
                    </div>
                </div>

                {/* Items Card */}
                <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Daftar Item Pesanan</h2>
                        <Button 
                            variant="secondary" 
                            className="!px-3 !py-1.5 text-xs" 
                            onClick={handleAddItem}
                            disabled={isEdit && purchaseOrder?.status !== 'draft'}
                        >
                            + Tambah Baris
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary text-white text-[12px] uppercase">
                                    <th className="px-4 py-3 font-medium w-1/3">Produk</th>
                                    <th className="px-4 py-3 font-medium w-1/5">Satuan</th>
                                    <th className="px-4 py-3 font-medium w-1/6">Qty</th>
                                    <th className="px-4 py-3 font-medium w-1/5">Estimasi Harga (Satuan)</th>
                                    <th className="px-4 py-3 font-medium w-1/12 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-border bg-white">
                                {data.items.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-text-secondary">
                                            Belum ada item ditambahkan.
                                        </td>
                                    </tr>
                                )}
                                {data.items.map((item, index) => {
                                    const selectedProduct = products.find(p => p.id === parseInt(item.product_id));
                                    const availableUnits = selectedProduct?.units || [];
                                    
                                    return (
                                        <tr key={index} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 align-top">
                                                <select
                                                    className="w-full border border-border rounded text-sm p-2 focus:border-accent focus:ring-1 focus:ring-accent"
                                                    value={item.product_id}
                                                    onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                                                    disabled={isEdit && purchaseOrder?.status !== 'draft'}
                                                >
                                                    <option value="">Pilih Produk</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                                    ))}
                                                </select>
                                                {errors[`items.${index}.product_id`] && <p className="text-danger text-[11px] mt-1">{errors[`items.${index}.product_id`]}</p>}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <select
                                                    className="w-full border border-border rounded text-sm p-2 focus:border-accent focus:ring-1 focus:ring-accent"
                                                    value={item.product_unit_id}
                                                    onChange={e => handleItemChange(index, 'product_unit_id', e.target.value)}
                                                    disabled={!item.product_id || (isEdit && purchaseOrder?.status !== 'draft')}
                                                >
                                                    <option value="">Pilih Satuan</option>
                                                    {availableUnits.map(u => (
                                                        <option key={u.id} value={u.id}>{u.unit_name}</option>
                                                    ))}
                                                </select>
                                                {errors[`items.${index}.product_unit_id`] && <p className="text-danger text-[11px] mt-1">{errors[`items.${index}.product_unit_id`]}</p>}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    className="w-full border border-border rounded text-sm p-2 focus:border-accent focus:ring-1 focus:ring-accent"
                                                    placeholder="Qty"
                                                    value={item.quantity_ordered}
                                                    onChange={e => handleItemChange(index, 'quantity_ordered', e.target.value)}
                                                    disabled={isEdit && purchaseOrder?.status !== 'draft'}
                                                />
                                                {errors[`items.${index}.quantity_ordered`] && <p className="text-danger text-[11px] mt-1">{errors[`items.${index}.quantity_ordered`]}</p>}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <input
                                                    type="number"
                                                    step="1"
                                                    min="0"
                                                    className="w-full border border-border rounded text-sm p-2 focus:border-accent focus:ring-1 focus:ring-accent"
                                                    placeholder="Contoh: 50000"
                                                    value={item.estimated_price}
                                                    onChange={e => handleItemChange(index, 'estimated_price', e.target.value)}
                                                    disabled={isEdit && purchaseOrder?.status !== 'draft'}
                                                />
                                                {errors[`items.${index}.estimated_price`] && <p className="text-danger text-[11px] mt-1">{errors[`items.${index}.estimated_price`]}</p>}
                                            </td>
                                            <td className="px-4 py-3 align-top text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="p-1.5 text-text-muted hover:text-danger hover:bg-red-50 rounded transition-colors"
                                                    title="Hapus Baris"
                                                    disabled={isEdit && purchaseOrder?.status !== 'draft'}
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Total Summary */}
                    <div className="p-4 bg-gray-50 border-t border-border flex justify-end">
                        <div className="text-right">
                            <span className="text-sm text-text-secondary mr-4">Total Estimasi Harga:</span>
                            <span className="text-lg font-bold text-[#1C1C1C]">{formatRp(totalEstimate)}</span>
                        </div>
                    </div>
                </div>
                
                {errors.items && typeof errors.items === 'string' && (
                    <div className="p-3 bg-danger-bg border-l-4 border-danger text-danger text-sm rounded">
                        {errors.items}
                    </div>
                )}
            </form>
        </AppLayout>
    );
}
