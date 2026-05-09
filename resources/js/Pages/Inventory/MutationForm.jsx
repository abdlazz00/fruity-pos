import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function MutationForm({ locations, products, errors }) {
    const [toLocationId, setToLocationId] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ product_id: '', quantity_sent: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter available products for dropdowns (excluding those already selected in other rows)
    const getAvailableProducts = (currentIndex) => {
        const selectedIds = items.map((i, idx) => idx !== currentIndex ? i.product_id : null).filter(Boolean);
        return products.filter(p => !selectedIds.includes(p.product_id.toString()));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        
        // If product changes, reset quantity and cap it if needed later
        if (field === 'product_id') {
            newItems[index].quantity_sent = '';
        }
        
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { product_id: '', quantity_sent: '' }]);
    };

    const removeItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Simple client side validation
        if (items.some(i => !i.product_id || !i.quantity_sent || parseFloat(i.quantity_sent) <= 0)) {
            alert('Pastikan semua produk dan kuantitas telah diisi dengan benar.');
            return;
        }

        // Validate max stock
        for (let i = 0; i < items.length; i++) {
            const product = products.find(p => p.product_id.toString() === items[i].product_id);
            if (product && parseFloat(items[i].quantity_sent) > product.stock) {
                alert(`Kuantitas produk ${product.name} melebihi stok yang tersedia (${product.stock}).`);
                return;
            }
        }

        setIsSubmitting(true);
        router.post('/inventory/mutations', {
            to_location_id: toLocationId,
            items: items,
            notes: notes
        }, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout title="Buat Mutasi" breadcrumbs={[
            { label: 'Inventori' }, 
            { label: 'Mutasi Stok', url: '/inventory/mutations' },
            { label: 'Buat Mutasi Baru' }
        ]}>
            <Head title="Buat Mutasi Stok" />

            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Buat Mutasi Baru</h1>
                    <Link href="/inventory/mutations" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                        &larr; Kembali
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Informasi Tujuan
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Toko Tujuan <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    className={`w-full form-input ${errors.to_location_id ? 'border-red-500' : ''}`}
                                    value={toLocationId}
                                    onChange={(e) => setToLocationId(e.target.value)}
                                >
                                    <option value="">-- Pilih Toko Tujuan --</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                                {errors.to_location_id && <p className="mt-1 text-sm text-red-600">{errors.to_location_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
                                <textarea
                                    rows="2"
                                    className="w-full form-input"
                                    placeholder="Opsional (misal: stok menipis di tujuan)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                Daftar Item Mutasi
                            </h2>
                            <button
                                type="button"
                                onClick={addItem}
                                disabled={items.length >= products.length}
                                className="px-3 py-1.5 text-sm bg-accent text-primary font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Tambah Baris
                            </button>
                        </div>

                        {typeof errors.items === 'string' && <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{errors.items}</p>}

                        <div className="space-y-3">
                            {items.map((item, index) => {
                                const availableProducts = getAvailableProducts(index);
                                const selectedProduct = products.find(p => p.product_id.toString() === item.product_id);

                                return (
                                    <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl items-start md:items-center">
                                        <div className="flex-1 w-full">
                                            <label className="block text-xs font-medium text-gray-500 mb-1 md:hidden">Pilih Produk</label>
                                            <select
                                                required
                                                className={`w-full form-input bg-white ${errors[`items.${index}.product_id`] ? 'border-red-500' : ''}`}
                                                value={item.product_id}
                                                onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                            >
                                                <option value="">-- Pilih Produk --</option>
                                                {/* Selalu tampilkan yang saat ini terpilih */}
                                                {selectedProduct && (
                                                    <option value={selectedProduct.product_id}>{selectedProduct.name} (Stok: {selectedProduct.stock})</option>
                                                )}
                                                {availableProducts.map(p => (
                                                    <option key={p.product_id} value={p.product_id}>{p.name} (Stok: {p.stock})</option>
                                                ))}
                                            </select>
                                            {errors[`items.${index}.product_id`] && <p className="mt-1 text-xs text-red-600">{errors[`items.${index}.product_id`]}</p>}
                                        </div>

                                        <div className="w-full md:w-48">
                                            <label className="block text-xs font-medium text-gray-500 mb-1 md:hidden">Kuantitas Dikirim</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    min="0.01"
                                                    max={selectedProduct ? selectedProduct.stock : ""}
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className={`w-full form-input bg-white pr-12 ${errors[`items.${index}.quantity_sent`] ? 'border-red-500' : ''}`}
                                                    value={item.quantity_sent}
                                                    onChange={(e) => handleItemChange(index, 'quantity_sent', e.target.value)}
                                                    disabled={!item.product_id}
                                                />
                                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-400 pointer-events-none">
                                                    kg
                                                </span>
                                            </div>
                                            {errors[`items.${index}.quantity_sent`] && <p className="mt-1 text-xs text-red-600">{errors[`items.${index}.quantity_sent`]}</p>}
                                        </div>

                                        <div className="w-full md:w-auto flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                disabled={items.length === 1}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                                title="Hapus baris"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <Link 
                            href="/inventory/mutations"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting || items.length === 0}
                            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Draft Mutasi'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
