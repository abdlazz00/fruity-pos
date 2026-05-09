import React, { useState, useEffect } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';

const REASON_OPTIONS = [
    { value: 'rotten', label: 'Busuk' },
    { value: 'damaged', label: 'Rusak Fisik' },
    { value: 'expired', label: 'Kadaluarsa' },
    { value: 'failed_qc', label: 'Gagal QC' },
];

export default function WasteForm({ products, errors }) {
    const [items, setItems] = useState([{ product_id: '', quantity: '', reason: 'rotten', photo: null, previewUrl: null }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cleanup object URLs to prevent memory leak
    useEffect(() => {
        return () => {
            items.forEach(item => {
                if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
            });
        };
    }, []);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        
        if (field === 'product_id') {
            newItems[index].quantity = '';
        }
        
        setItems(newItems);
    };

    const handlePhotoChange = (index, file) => {
        if (!file) return;

        // Client-side validation 5MB max
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran foto terlalu besar. Maksimal 5MB.');
            return;
        }

        const newItems = [...items];
        // Cleanup old preview if exists
        if (newItems[index].previewUrl) {
            URL.revokeObjectURL(newItems[index].previewUrl);
        }

        newItems[index].photo = file;
        newItems[index].previewUrl = URL.createObjectURL(file);
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { product_id: '', quantity: '', reason: 'rotten', photo: null, previewUrl: null }]);
    };

    const removeItem = (index) => {
        const newItems = [...items];
        if (newItems[index].previewUrl) {
            URL.revokeObjectURL(newItems[index].previewUrl);
        }
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validasi
        if (items.some(i => !i.product_id || !i.quantity || parseFloat(i.quantity) <= 0 || !i.photo)) {
            alert('Pastikan produk, kuantitas, dan foto bukti telah diisi untuk setiap baris.');
            return;
        }

        for (let i = 0; i < items.length; i++) {
            const product = products.find(p => p.product_id.toString() === items[i].product_id);
            if (product && parseFloat(items[i].quantity) > product.stock) {
                alert(`Kuantitas waste ${product.name} melebihi stok yang tersedia (${product.stock}).`);
                return;
            }
        }

        setIsSubmitting(true);
        const formData = new FormData();
        items.forEach((item, index) => {
            formData.append(`items[${index}][product_id]`, item.product_id);
            formData.append(`items[${index}][quantity]`, item.quantity);
            formData.append(`items[${index}][reason]`, item.reason);
            formData.append(`items[${index}][photo]`, item.photo);
        });

        router.post('/inventory/waste', formData, {
            forceFormData: true, // WAJIB untuk multipart
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout title="Ajukan Waste" breadcrumbs={[
            { label: 'Inventori' }, 
            { label: 'Waste / Rusak', url: '/inventory/waste' },
            { label: 'Pengajuan Baru' }
        ]}>
            <Head title="Ajukan Waste" />

            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Ajukan Laporan Waste</h1>
                    <Link href="/inventory/waste" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                        &larr; Kembali
                    </Link>
                </div>

                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 flex items-start">
                    <svg className="w-5 h-5 mr-3 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <div>
                        <h4 className="font-bold text-sm">Penting:</h4>
                        <p className="text-sm mt-1">Setiap laporan waste wajib menyertakan foto bukti fisik barang secara jelas. Stok Anda baru akan terpotong <strong>setelah</strong> disetujui oleh Owner.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Daftar Barang Rusak
                        </h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className="px-3 py-1.5 text-sm bg-accent text-primary font-medium rounded-lg hover:bg-accent-hover transition-colors flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Tambah Baris
                        </button>
                    </div>

                    {typeof errors.items === 'string' && <p className="m-4 text-sm text-red-600 bg-red-50 p-2 rounded">{errors.items}</p>}

                    <div className="p-6 space-y-6">
                        {items.map((item, index) => {
                            const selectedProduct = products.find(p => p.product_id.toString() === item.product_id);

                            return (
                                <div key={index} className="flex flex-col gap-4 p-5 bg-gray-50/50 border border-gray-100 rounded-xl relative">
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                                            title="Hapus baris"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-6">
                                        <div className="col-span-1 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Produk <span className="text-red-500">*</span></label>
                                            <select
                                                required
                                                className={`w-full form-input bg-white ${errors[`items.${index}.product_id`] ? 'border-red-500' : ''}`}
                                                value={item.product_id}
                                                onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                            >
                                                <option value="">-- Produk --</option>
                                                {products.map(p => (
                                                    <option key={p.product_id} value={p.product_id}>{p.name} (Stok: {p.stock})</option>
                                                ))}
                                            </select>
                                            {errors[`items.${index}.product_id`] && <p className="mt-1 text-xs text-red-600">{errors[`items.${index}.product_id`]}</p>}
                                        </div>

                                        <div className="col-span-1 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kuantitas <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    min="0.01"
                                                    max={selectedProduct ? selectedProduct.stock : ""}
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className={`w-full form-input bg-white pr-12 ${errors[`items.${index}.quantity`] ? 'border-red-500' : ''}`}
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    disabled={!item.product_id}
                                                />
                                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-400 pointer-events-none">kg</span>
                                            </div>
                                            {errors[`items.${index}.quantity`] && <p className="mt-1 text-xs text-red-600">{errors[`items.${index}.quantity`]}</p>}
                                        </div>

                                        <div className="col-span-1 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Alasan <span className="text-red-500">*</span></label>
                                            <select
                                                required
                                                className="w-full form-input bg-white"
                                                value={item.reason}
                                                onChange={(e) => handleItemChange(index, 'reason', e.target.value)}
                                            >
                                                {REASON_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Foto Bukti Fisik <span className="text-red-500">*</span></label>
                                        <div className="flex items-start gap-4">
                                            {item.previewUrl ? (
                                                <div className="relative w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden shrink-0 group">
                                                    <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <label className="cursor-pointer text-white text-xs font-bold px-3 py-1 bg-primary/80 rounded-md hover:bg-primary">
                                                            Ganti
                                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(index, e.target.files[0])} />
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className={`w-32 h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0 ${errors[`items.${index}.photo`] ? 'border-red-400 bg-red-50 hover:bg-red-100' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                                                    <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    <span className="text-xs text-gray-500 font-medium">Upload Foto</span>
                                                    <input type="file" accept="image/*" required className="hidden" onChange={(e) => handlePhotoChange(index, e.target.files[0])} />
                                                </label>
                                            )}
                                            
                                            <div className="text-xs text-gray-500 mt-2">
                                                <ul className="list-disc pl-4 space-y-1">
                                                    <li>Wajib diisi.</li>
                                                    <li>Format: JPG, PNG.</li>
                                                    <li>Maksimal 5MB.</li>
                                                </ul>
                                                {errors[`items.${index}.photo`] && <p className="mt-2 text-red-600 font-medium">{errors[`items.${index}.photo`]}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <Link 
                            href="/inventory/waste"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting || items.length === 0}
                            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? 'Mengupload...' : 'Kirim Laporan Waste'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
