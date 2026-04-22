import React, { useRef, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Save, Image as ImageIcon, Plus, Trash2, ShieldAlert, Edit } from 'lucide-react';

export default function ProductForm({ categories, uoms, product }) {
    const isEdit = !!product;
    const fileInputRef = useRef(null);

    const [imagePreview, setImagePreview] = useState(
        product?.image_path ? `/storage/${product.image_path}` : null
    );

    const { data, setData, processing, errors, setError, clearErrors } = useForm({
        category_id: product?.category_id || '',
        sku: product?.sku || '',
        name: product?.name || '',
        description: product?.description || '',
        type: product?.type || 'tunggal',
        has_sn: product?.has_sn ?? false,
        status: product?.status || 'active',
        image: null,
        
        // Initial Unit Row - map DB fields (unit_name, conversion_to_base) to frontend fields (name, conversion_factor)
        units: product?.units?.length > 0 ? product.units.map(u => ({
            id: u.id || null,
            name: u.unit_name || u.name,
            conversion_factor: u.conversion_to_base || u.conversion_factor || 1,
            price_purchase: u.price_purchase || 0,
            price_sales: u.price_sales || 0,
            is_default: u.is_default ?? false
        })) : [{
            name: '',
            conversion_factor: 1,
            price_purchase: 0,
            price_sales: 0,
            is_default: true
        }],

        safeguard: {
            limit_value: product?.safeguard?.limit_value || '',
            limit_unit: product?.safeguard?.limit_unit || 'gram',
            action: product?.safeguard?.action || 'warning'
        }
    });

    const [enableSafeguard, setEnableSafeguard] = useState(!!product?.safeguard);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [skuPreview, setSkuPreview] = useState(product?.sku || '');

    const handleCategoryChange = async (e) => {
        const value = e.target.value;
        setData('category_id', value);

        if (!isEdit && value) {
            try {
                const response = await axios.get(`/master/products/preview-sku?category_id=${value}`);
                setSkuPreview(response.data.sku);
            } catch (error) {
                console.error("Error fetching SKU preview:", error);
            }
        } else if (!isEdit && !value) {
            setSkuPreview('');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        clearErrors();
        setIsSubmitting(true);
        
        // Build clean payload — strip safeguard if not enabled
        const payload = {
            category_id: data.category_id,
            sku: data.sku,
            name: data.name,
            description: data.description || '',
            type: data.type,
            has_sn: data.has_sn,
            status: data.status,
            image: data.image,
            units: data.units,
            safeguard: enableSafeguard ? data.safeguard : null,
        };

        const url = isEdit 
            ? `/master/products/${product.id}` 
            : '/master/products';

        router.post(url, payload, {
            preserveScroll: true,
            forceFormData: true,
            onError: (err) => {
                setError(err);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    // Dynamic Unit Row operations
    const addUnit = () => {
        setData('units', [...data.units, {
            name: '',
            conversion_factor: '',
            price_purchase: 0,
            price_sales: 0,
            is_default: false
        }]);
    };

    const removeUnit = (index) => {
        if (data.units.length === 1) return; // Prevent removing the last item
        const newUnits = [...data.units];
        newUnits.splice(index, 1);
        
        // If we removed the default, make the first one default
        if (!newUnits.some(u => u.is_default) && newUnits.length > 0) {
            newUnits[0].is_default = true;
        }
        setData('units', newUnits);
    };

    const updateUnit = (index, field, value) => {
        const newUnits = [...data.units];
        if (field === 'is_default' && value === true) {
            newUnits.forEach(u => u.is_default = false); // Only 1 default allowed
        }
        newUnits[index][field] = value;
        setData('units', newUnits);
    };

    return (
        <AppLayout 
            title={isEdit ? "Edit Produk" : "Tambah Produk"}
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Data Produk', url: '/master/products' },
                { label: isEdit ? 'Edit Produk' : 'Tambah Produk' }
            ]}
        >
            <Head title={isEdit ? "Edit Produk - FruityPOS" : "Tambah Produk - FruityPOS"} />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header Navigation */}
                <div className="flex items-center gap-4">
                    <Link href="/master/products" className="p-2 bg-white rounded-xl shadow-sm border border-slate-100/50 hover:bg-slate-50 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                            {isEdit ? "Edit Data Produk" : "Tambah Produk Baru"}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {isEdit ? `Mengubah spesifikasi untuk ${product.name}` : "Lengkapi form master data untuk memasukkan produk baru."}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                    
                    {/* Block: Info Dasar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100">Informasi Dasar</h2>
                        <div className="flex flex-col md:flex-row gap-8">
                            
                            {/* Left: Image Upload */}
                            <div className="shrink-0 w-full md:w-64 flex flex-col items-center">
                                <div 
                                    className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white font-medium shadow-sm flex items-center gap-2"><Edit className="w-4 h-4"/> Ubah Foto</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-emerald-500">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-600 group-hover:text-emerald-600">Klik untuk unggah foto</p>
                                            <p className="text-xs text-slate-400 mt-1">JPG/PNG maks 2MB</p>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/jpeg, image/png, image/webp"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                {errors.image && <p className="text-red-500 text-xs mt-2 font-medium">{errors.image}</p>}
                            </div>

                            {/* Right: Core Fields */}
                            <div className="w-full space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Produk <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'} focus:ring-2 focus:ring-opacity-20 outline-none transition-all`}
                                            placeholder="Cth: Apel Fuji Super..."
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">SKU (Kode Unik)</label>
                                        <input
                                            type="text"
                                            value={isEdit ? data.sku : skuPreview}
                                            readOnly
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-500 cursor-not-allowed outline-none"
                                            placeholder="Otomatis dibuat..."
                                        />
                                        <p className="text-xs text-slate-500 mt-1 font-medium">{isEdit ? 'SKU tidak dapat diubah.' : 'SKU akan di-generate otomatis saat disimpan.'}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori Produk <span className="text-red-500">*</span></label>
                                        <select
                                            value={data.category_id}
                                            onChange={handleCategoryChange}
                                            className={`w-full px-4 py-2.5 rounded-xl border ${errors.category_id ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'} focus:ring-2 focus:ring-opacity-20 outline-none transition-all text-slate-700`}
                                        >
                                            <option value="">-- Pilih Kategori --</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        {errors.category_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.category_id}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi Produk</label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:ring-2 focus:ring-opacity-20 outline-none transition-all resize-none"
                                        placeholder="Keterangan fisik, asal produk, atau catatan supplier..."
                                    ></textarea>
                                    {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Block: Konfigurasi Logistik */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tipe Pengepakan <span className="text-red-500">*</span></label>
                            <div className="flex bg-slate-100/80 p-1 rounded-xl">
                                <button type="button" onClick={() => setData('type', 'tunggal')} className={`w-1/2 py-2 rounded-lg text-sm font-medium transition-all ${data.type === 'tunggal' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>Tunggal</button>
                                <button type="button" onClick={() => setData('type', 'pack')} className={`w-1/2 py-2 rounded-lg text-sm font-medium transition-all ${data.type === 'pack' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>Kardus / Pack</button>
                            </div>
                            {errors.type && <p className="text-red-500 text-xs mt-1 font-medium">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Perlu Barcode SN?</label>
                            <label className="flex items-center gap-3 cursor-pointer py-2">
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={data.has_sn} onChange={e => setData('has_sn', e.target.checked)} />
                                    <div className={`block w-12 h-6 rounded-full transition-colors ${data.has_sn ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.has_sn ? 'transform translate-x-6' : ''}`}></div>
                                </div>
                                <span className="text-sm font-medium text-slate-600">{data.has_sn ? 'Ya, Catat SN Pemasok' : 'Tidak Perlu'}</span>
                            </label>
                            {errors.has_sn && <p className="text-red-500 text-xs mt-1 font-medium">{errors.has_sn}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Status Produk</label>
                            <label className="flex items-center gap-3 cursor-pointer py-2">
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={data.status === 'active'} onChange={e => setData('status', e.target.checked ? 'active' : 'inactive')} />
                                    <div className={`block w-12 h-6 rounded-full transition-colors ${data.status === 'active' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.status === 'active' ? 'transform translate-x-6' : ''}`}></div>
                                </div>
                                <span className="text-sm font-medium text-slate-600">{data.status === 'active' ? 'Ditampilkan (Aktif)' : 'Disembunyikan (Nonaktif)'}</span>
                            </label>
                            {errors.status && <p className="text-red-500 text-xs mt-1 font-medium">{errors.status}</p>}
                        </div>
                    </div>

                    {/* Block: Penentuan Satuan & Harga */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 p-6">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Unit Konversi & Harga</h2>
                                <p className="text-xs text-slate-500 mt-1">Tambahkan satuan terkecil hingga terbesar beserta nominal Rupiah-nya.</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={addUnit}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                                <Plus className="w-4 h-4"/> Tambah Level Satuan
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {data.units.map((unit, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border ${unit.is_default ? 'bg-emerald-50/30 border-emerald-300 shadow-sm' : 'bg-slate-50 border-slate-200'} relative`}>
                                    {unit.is_default && (
                                        <span className="absolute -top-3 -left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Satuan Dasar</span>
                                    )}
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                                        <div className="lg:col-span-3">
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Satuan</label>
                                            <select value={unit.name} onChange={e => updateUnit(idx, 'name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white" required>
                                                <option value="" disabled>Pilih UoM</option>
                                                {uoms && uoms.map(uom => (
                                                    <option key={uom.id} value={uom.name}>{uom.name} {uom.symbol ? `(${uom.symbol})` : ''}</option>
                                                ))}
                                                {(!uoms || uoms.length === 0) && (
                                                    <option value="Pcs">Pcs</option>
                                                )}
                                            </select>
                                            {errors[`units.${idx}.name`] && <p className="text-red-500 text-[10px] mt-1">{errors[`units.${idx}.name`]}</p>}
                                        </div>
                                        <div className="lg:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Rasio / Faktor</label>
                                            <input type="number" step="0.01" min="0.01" value={unit.conversion_factor} onChange={e => updateUnit(idx, 'conversion_factor', e.target.value)} disabled={unit.is_default} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none disabled:bg-slate-100" required/>
                                            {errors[`units.${idx}.conversion_factor`] && <p className="text-red-500 text-[10px] mt-1">{errors[`units.${idx}.conversion_factor`]}</p>}
                                        </div>
                                        <div className="lg:col-span-3">
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Beli Dasar (Rp)</label>
                                            <input type="number" min="0" value={unit.price_purchase} onChange={e => updateUnit(idx, 'price_purchase', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" required/>
                                        </div>
                                        <div className="lg:col-span-3">
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Jual Pokok (Rp)</label>
                                            <input type="number" min="0" value={unit.price_sales} onChange={e => updateUnit(idx, 'price_sales', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" required/>
                                        </div>
                                        <div className="lg:col-span-1 flex items-center justify-end gap-2 pb-1">
                                            {!unit.is_default && (
                                                <>
                                                    <button type="button" onClick={() => updateUnit(idx, 'is_default', true)} className="text-xs font-semibold px-2 py-1.5 bg-white border rounded text-emerald-600 hover:bg-emerald-50">Set Dasar</button>
                                                    <button type="button" onClick={() => removeUnit(idx)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Block: Weight Safeguard Toleransi (Opsional) */}
                    <div className="bg-slate-50 rounded-2xl shadow-inner border border-slate-200/60 p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-orange-500" /> Pengamanan Penyusutan Bobot (Safeguard)
                                </h2>
                                <p className="text-xs text-slate-500 mt-1 max-w-lg">Gunakan fitur ini untuk produk curah (Sayur/Buah Segar) guna melindungi margin dari batas wajar susut/busuk timbangan di toko.</p>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm">
                                <span className="text-xs font-semibold text-slate-600 mb-0.5">Aktifkan?</span>
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={enableSafeguard} onChange={e => setEnableSafeguard(e.target.checked)} />
                                    <div className={`block w-8 h-4 rounded-full transition-colors ${enableSafeguard ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                                    <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${enableSafeguard ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                            </label>
                        </div>

                        {enableSafeguard && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nilai Maks. Penyusutan</label>
                                    <input type="number" step="0.01" value={data.safeguard?.limit_value || ''} onChange={e => setData('safeguard', {...data.safeguard, limit_value: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all text-sm" placeholder="Contoh: 100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Metrik (Satuan/Persentase)</label>
                                    <select value={data.safeguard?.limit_unit || 'gram'} onChange={e => setData('safeguard', {...data.safeguard, limit_unit: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all text-sm bg-white">
                                        <option value="gram">Gram (gr)</option>
                                        <option value="percentage">Persentase (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tindakan Sistem</label>
                                    <select value={data.safeguard?.action || 'warning'} onChange={e => setData('safeguard', {...data.safeguard, action: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all text-sm bg-white">
                                        <option value="warning">Peringatan (Cetak Laporan)</option>
                                        <option value="block">Blokir / Konfirmasi Manajer</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Validation Errors Summary */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                            <p className="text-sm font-semibold mb-1">Terdapat kesalahan pada formulir:</p>
                            <ul className="list-disc list-inside text-xs space-y-0.5">
                                {Object.entries(errors).map(([key, msg]) => (
                                    <li key={key}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
                        <Link href="/master/products" className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                            Batal
                        </Link>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:to-emerald-600 shadow-emerald-500/25 shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70"
                        >
                            <Save className="w-5 h-5"/>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Produk Secara Penuh'}
                        </button>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}
