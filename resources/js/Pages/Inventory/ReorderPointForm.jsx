import React, { useState, useEffect } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function ReorderPointForm({ products, locations, filters, errors }) {
    const { auth } = usePage().props;
    const isOwner = auth.user.role === 'owner';

    // State for the form
    const [data, setData] = useState({
        location_id: filters?.location_id || (isOwner ? '' : auth.user.location_id) || '',
        product_id: '',
        min_quantity: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter available products based on selected location
    // Currently, backend might already filter products if location_id is provided in URL.
    const selectedProduct = products?.find(p => p.id.toString() === data.product_id.toString());

    // When location changes, reload page to fetch products for that location
    const handleLocationChange = (e) => {
        const newLocationId = e.target.value;
        setData({ ...data, location_id: newLocationId, product_id: '', min_quantity: '' });
        
        if (newLocationId) {
            router.get('/inventory/reorder-points/create', { location_id: newLocationId }, { preserveState: true, replace: true });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!data.location_id || !data.product_id || !data.min_quantity) {
            alert('Semua kolom harus diisi.');
            return;
        }

        setIsSubmitting(true);
        router.post('/inventory/reorder-points', data, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout title="Set Reorder Point" breadcrumbs={[
            { label: 'Inventori' }, 
            { label: 'Reorder Point', url: '/inventory/reorder-points' },
            { label: 'Set Reorder Point' }
        ]}>
            <Head title="Set Reorder Point" />

            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Set Reorder Point</h1>
                    <Link href="/inventory/reorder-points" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                        &larr; Kembali
                    </Link>
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl mb-6 flex items-start">
                    <svg className="w-5 h-5 mr-3 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                        <h4 className="font-bold text-sm">Informasi:</h4>
                        <p className="text-sm mt-1">Jika reorder point untuk kombinasi produk dan toko sudah ada, form ini akan <strong>memperbarui</strong> batas minimum stok tersebut.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            Detail Reorder Point
                        </h2>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Lokasi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Toko / Lokasi <span className="text-red-500">*</span></label>
                            <select
                                required
                                disabled={!isOwner}
                                className={`w-full form-input bg-white ${errors?.location_id ? 'border-red-500' : ''} ${!isOwner ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                value={data.location_id}
                                onChange={handleLocationChange}
                            >
                                <option value="">-- Pilih Toko --</option>
                                {locations?.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                            {errors?.location_id && <p className="mt-1 text-xs text-red-600">{errors.location_id}</p>}
                            {!isOwner && <p className="mt-1 text-xs text-gray-500">Anda hanya dapat mengatur untuk toko tempat Anda ditugaskan.</p>}
                        </div>

                        {/* Produk */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Produk <span className="text-red-500">*</span></label>
                            <select
                                required
                                disabled={!data.location_id || products?.length === 0}
                                className={`w-full form-input bg-white ${errors?.product_id ? 'border-red-500' : ''}`}
                                value={data.product_id}
                                onChange={(e) => setData({ ...data, product_id: e.target.value })}
                            >
                                <option value="">-- Pilih Produk --</option>
                                {products?.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} - {p.sku} {p.current_stock !== undefined ? `(Stok Saat Ini: ${p.current_stock} ${p.base_uom})` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors?.product_id && <p className="mt-1 text-xs text-red-600">{errors.product_id}</p>}
                            {data.location_id && products?.length === 0 && (
                                <p className="mt-1 text-xs text-amber-600">Tidak ada produk yang tersedia di lokasi ini.</p>
                            )}
                        </div>

                        {/* Min Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batas Minimum Stok <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={`w-full form-input bg-white pr-16 ${errors?.min_quantity ? 'border-red-500' : ''}`}
                                    value={data.min_quantity}
                                    onChange={(e) => setData({ ...data, min_quantity: e.target.value })}
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sm font-medium text-gray-500 pointer-events-none border-l border-gray-200 pl-3">
                                    {selectedProduct ? selectedProduct.base_uom : 'satuan'}
                                </span>
                            </div>
                            {errors?.min_quantity && <p className="mt-1 text-xs text-red-600">{errors.min_quantity}</p>}
                            <p className="mt-1 text-xs text-gray-500">
                                Sistem akan mengirimkan notifikasi saat stok produk mencapai angka ini atau di bawahnya.
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <Link 
                            href="/inventory/reorder-points"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting || !data.location_id || !data.product_id || !data.min_quantity}
                            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Reorder Point'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
