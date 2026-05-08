import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';

const reasonOptions = [
    { value: 'rotten',    label: 'Busuk' },
    { value: 'damaged',   label: 'Rusak Fisik' },
    { value: 'expired',   label: 'Kadaluarsa' },
    { value: 'failed_qc', label: 'Gagal QC' },
];

export default function WasteForm({ products }) {
    const [items, setItems] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleAddItem = () => {
        setItems([...items, { product_id: '', quantity: '', reason: '', photo: null, photoPreview: null }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handlePhotoChange = (index, file) => {
        if (file && file.size > 5 * 1024 * 1024) {
            alert('Ukuran foto maksimal adalah 5MB.');
            return;
        }
        const newItems = [...items];
        if (newItems[index].photoPreview) {
            URL.revokeObjectURL(newItems[index].photoPreview);
        }
        newItems[index].photo = file;
        newItems[index].photoPreview = file ? URL.createObjectURL(file) : null;
        setItems(newItems);
    };

    React.useEffect(() => {
        return () => {
            items.forEach(item => {
                if (item.photoPreview) {
                    URL.revokeObjectURL(item.photoPreview);
                }
            });
        };
    }, [items]);

    const getMaxStock = (productId) => {
        const p = products.find(p => p.product_id === parseInt(productId));
        return p ? parseFloat(p.stock) : 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        items.forEach((item, index) => {
            formData.append(`items[${index}][product_id]`, item.product_id);
            formData.append(`items[${index}][quantity]`, item.quantity);
            formData.append(`items[${index}][reason]`, item.reason);
            if (item.photo) {
                formData.append(`items[${index}][photo]`, item.photo);
            }
        });

        router.post('/inventory/waste', formData, {
            forceFormData: true,
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout
            title="Ajukan Waste"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Waste', url: '/inventory/waste' },
                { label: 'Ajukan Waste Baru' },
            ]}
        >
            <Head title="Ajukan Waste Baru" />

            <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#1C1C1C]">Ajukan Waste Baru</h1>
                        <p className="text-sm text-text-secondary mt-1">
                            Foto bukti <strong>wajib</strong> dilampirkan untuk setiap item
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link href="/inventory/waste">
                            <Button variant="ghost">Batal</Button>
                        </Link>
                        <Button type="submit" variant="primary" disabled={processing || items.length === 0}>
                            Kirim Pengajuan
                        </Button>
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                    {items.length === 0 && (
                        <div className="bg-white rounded-xl border border-border p-8 text-center">
                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                            </svg>
                            <p className="text-text-secondary mb-4">Belum ada item ditambahkan</p>
                            <Button variant="secondary" onClick={handleAddItem}>+ Tambah Item Waste</Button>
                        </div>
                    )}

                    {items.map((item, index) => (
                        <div key={index} className="bg-white rounded-xl border border-border p-5 relative">
                            <div className="absolute top-3 right-3">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-1.5 text-text-muted hover:text-danger hover:bg-red-50 rounded transition-colors"
                                    title="Hapus Item"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <h3 className="text-sm font-bold text-text-secondary uppercase mb-4">Item #{index + 1}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Product */}
                                <div>
                                    <label className="block text-[13px] text-text-secondary mb-1.5">
                                        Produk <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                                            errors[`items.${index}.product_id`] ? 'border-danger' : 'border-border focus:border-accent'
                                        }`}
                                        value={item.product_id}
                                        onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                                    >
                                        <option value="">-- Pilih Produk --</option>
                                        {products.map(p => (
                                            <option key={p.product_id} value={p.product_id}>
                                                {p.name} ({p.sku}) — Stok: {p.stock}
                                            </option>
                                        ))}
                                    </select>
                                    {errors[`items.${index}.product_id`] && (
                                        <p className="text-danger text-xs mt-1">{errors[`items.${index}.product_id`]}</p>
                                    )}
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label className="block text-[13px] text-text-secondary mb-1.5">
                                        Jumlah <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={getMaxStock(item.product_id)}
                                        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                                            errors[`items.${index}.quantity`] ? 'border-danger' : 'border-border focus:border-accent'
                                        }`}
                                        value={item.quantity}
                                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                        placeholder="Qty"
                                    />
                                    {errors[`items.${index}.quantity`] && (
                                        <p className="text-danger text-xs mt-1">{errors[`items.${index}.quantity`]}</p>
                                    )}
                                </div>

                                {/* Reason */}
                                <div>
                                    <label className="block text-[13px] text-text-secondary mb-1.5">
                                        Alasan <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                                            errors[`items.${index}.reason`] ? 'border-danger' : 'border-border focus:border-accent'
                                        }`}
                                        value={item.reason}
                                        onChange={e => handleItemChange(index, 'reason', e.target.value)}
                                    >
                                        <option value="">-- Pilih Alasan --</option>
                                        {reasonOptions.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                    {errors[`items.${index}.reason`] && (
                                        <p className="text-danger text-xs mt-1">{errors[`items.${index}.reason`]}</p>
                                    )}
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <label className="block text-[13px] text-text-secondary mb-1.5">
                                        Foto Bukti <span className="text-danger">* (max 5MB)</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className={`w-full border rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-[#F0FDF4] file:text-[#2C6E49] hover:file:bg-[#DCFCE7] ${
                                            errors[`items.${index}.photo`] ? 'border-danger' : 'border-border'
                                        }`}
                                        onChange={e => handlePhotoChange(index, e.target.files[0])}
                                    />
                                    {errors[`items.${index}.photo`] && (
                                        <p className="text-danger text-xs mt-1">{errors[`items.${index}.photo`]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Photo Preview */}
                            {item.photoPreview && (
                                <div className="mt-4">
                                    <img
                                        src={item.photoPreview}
                                        alt={`Preview item #${index + 1}`}
                                        className="w-32 h-32 object-cover rounded-lg border border-border shadow-sm"
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    {items.length > 0 && (
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm text-text-secondary hover:border-accent hover:text-accent transition-colors"
                        >
                            + Tambah Item Waste Lainnya
                        </button>
                    )}
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
