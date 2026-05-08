import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';

export default function MutationForm({ locations, products }) {
    const { data, setData, post, processing, errors } = useForm({
        to_location_id: '',
        notes: '',
        items: [],
    });

    const handleAddItem = () => {
        setData('items', [...data.items, { product_id: '', quantity_sent: '' }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const getMaxStock = (productId) => {
        const p = products.find(p => p.product_id === parseInt(productId));
        return p ? parseFloat(p.stock) : 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Check for duplicates
        const productIds = data.items.map(i => i.product_id).filter(id => id);
        const uniqueProductIds = new Set(productIds);
        if (uniqueProductIds.size !== productIds.length) {
            alert('Terdapat produk yang duplikat. Silakan gabungkan qty atau hapus baris yang sama.');
            return;
        }

        post('/inventory/mutations');
    };

    return (
        <AppLayout
            title="Buat Mutasi Stok"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Mutasi Stok', url: '/inventory/mutations' },
                { label: 'Buat Mutasi' },
            ]}
        >
            <Head title="Buat Mutasi Stok" />

            <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-[#1C1C1C]">Buat Mutasi Stok Baru</h1>
                    <div className="flex space-x-3">
                        <Link href="/inventory/mutations">
                            <Button variant="ghost">Batal</Button>
                        </Link>
                        <Button type="submit" variant="primary" disabled={processing || data.items.length === 0}>
                            Simpan Mutasi
                        </Button>
                    </div>
                </div>

                {/* General Info */}
                <div className="bg-white rounded-xl border border-border p-5">
                    <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Informasi Mutasi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[13px] text-text-secondary mb-1.5">
                                Toko Tujuan <span className="text-danger">*</span>
                            </label>
                            <select
                                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 ${errors.to_location_id ? 'border-danger' : 'border-border focus:border-accent'}`}
                                value={data.to_location_id}
                                onChange={e => setData('to_location_id', e.target.value)}
                            >
                                <option value="">-- Pilih Toko Tujuan --</option>
                                {locations.map(l => (
                                    <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                                ))}
                            </select>
                            {errors.to_location_id && <p className="text-danger text-xs mt-1">{errors.to_location_id}</p>}
                        </div>

                        <div>
                            <label className="block text-[13px] text-text-secondary mb-1.5">Catatan</label>
                            <input
                                type="text"
                                placeholder="Opsional — alasan mutasi"
                                className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Daftar Item Mutasi</h2>
                        <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={handleAddItem}>
                            + Tambah Baris
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary text-white text-[12px] uppercase">
                                    <th className="px-4 py-3 font-medium w-2/5">Produk</th>
                                    <th className="px-4 py-3 font-medium w-1/6">Stok Saat Ini</th>
                                    <th className="px-4 py-3 font-medium w-1/5">Qty Kirim</th>
                                    <th className="px-4 py-3 font-medium w-1/12 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-border bg-white">
                                {data.items.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-text-secondary">
                                            Belum ada item ditambahkan. Klik "+ Tambah Baris" untuk mulai.
                                        </td>
                                    </tr>
                                )}
                                {data.items.map((item, index) => {
                                    const maxStock = getMaxStock(item.product_id);
                                    return (
                                        <tr key={index} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 align-top">
                                                <select
                                                    className="w-full border border-border rounded text-sm p-2 focus:border-accent focus:ring-1 focus:ring-accent"
                                                    value={item.product_id}
                                                    onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                                                >
                                                    <option value="">Pilih Produk</option>
                                                    {products.map(p => (
                                                        <option key={p.product_id} value={p.product_id}>
                                                            {p.name} ({p.sku})
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[`items.${index}.product_id`] && (
                                                    <p className="text-danger text-[11px] mt-1">{errors[`items.${index}.product_id`]}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-top text-text-secondary">
                                                {item.product_id ? (
                                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                                        {maxStock}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    max={maxStock}
                                                    placeholder="Qty"
                                                    className="w-full border border-border rounded text-sm p-2 focus:border-accent focus:ring-1 focus:ring-accent"
                                                    value={item.quantity_sent}
                                                    onChange={e => handleItemChange(index, 'quantity_sent', e.target.value)}
                                                />
                                                {errors[`items.${index}.quantity_sent`] && (
                                                    <p className="text-danger text-[11px] mt-1">{errors[`items.${index}.quantity_sent`]}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-top text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="p-1.5 text-text-muted hover:text-danger hover:bg-red-50 rounded transition-colors"
                                                    title="Hapus Baris"
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
                </div>

                {errors.items && typeof errors.items === 'string' && (
                    <div className="p-3 bg-red-50 border-l-4 border-danger text-danger text-sm rounded">
                        {errors.items}
                    </div>
                )}
            </form>
        </AppLayout>
    );
}
