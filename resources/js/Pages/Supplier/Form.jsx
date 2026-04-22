import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Truck, Info, Phone, MapPin, User as UserIcon } from 'lucide-react';

export default function SupplierForm({ supplier }) {
    const isEdit = !!supplier;

    const { data, setData, post, put, errors, clearErrors } = useForm({
        name: supplier?.name || '',
        contact_person: supplier?.contact_person || '',
        phone: supplier?.phone || '',
        address: supplier?.address || '',
        is_active: supplier?.is_active ?? true,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();

        const options = {
            onFinish: () => setIsSubmitting(false),
            preserveScroll: true
        };

        if (isEdit) {
            put(`/master/suppliers/${supplier.id}`, options);
        } else {
            post('/master/suppliers', options);
        }
    };

    return (
        <AppLayout 
            title={isEdit ? "Edit Supplier" : "Tambah Supplier"}
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Data Supplier', url: '/master/suppliers' },
                { label: isEdit ? 'Edit Supplier' : 'Tambah Supplier' }
            ]}
        >
            <Head title={`${isEdit ? "Edit" : "Tambah"} Supplier - FruityPOS`} />

            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50">
                    <Link 
                        href="/master/suppliers" 
                        className="p-2.5 bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors border border-slate-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                            {isEdit ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Lengkapi form master data untuk memasukkan supplier buah-buahan.
                        </p>
                    </div>
                </div>

                {/* Global Error Summary */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-full shrink-0 text-red-600 mt-0.5">
                            <Info className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-red-800">Terdapat Kesalahan Input</h3>
                            <ul className="mt-1 list-disc list-inside text-sm text-red-700">
                                {Object.values(errors).map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <Truck className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Informasi Supplier</h2>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Supplier / Perusahaan <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Truck className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.name ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-slate-200 focus:ring-emerald-500'} focus:ring-2 focus:ring-opacity-20 outline-none transition-all`}
                                        placeholder="Cth: PT. Agro Buah Nusantara"
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kontak Person</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.contact_person}
                                            onChange={e => setData('contact_person', e.target.value)}
                                            className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.contact_person ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-slate-200 focus:ring-emerald-500'} focus:ring-2 focus:ring-opacity-20 outline-none transition-all`}
                                            placeholder="Cth: Bapak Joko"
                                        />
                                    </div>
                                    {errors.contact_person && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.contact_person}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">No. Handphone / Telepon</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.phone ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-slate-200 focus:ring-emerald-500'} focus:ring-2 focus:ring-opacity-20 outline-none transition-all`}
                                            placeholder="Cth: 08123456789"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alamat Lengkap</label>
                                <div className="relative">
                                    <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none">
                                        <MapPin className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <textarea
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        rows="4"
                                        className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.address ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-slate-200 focus:ring-emerald-500'} focus:ring-2 focus:ring-opacity-20 outline-none transition-all resize-none`}
                                        placeholder="Tuliskan alamat lengkap kantor atau gudang supplier..."
                                    />
                                </div>
                                {errors.address && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.address}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-slate-800">Status Supplier</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Tentukan apakah supplier ini masih aktif untuk dipesan.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                            <span className="ml-3 text-sm font-semibold text-slate-700">
                                {data.is_active ? 'Ditampilkan (Aktif)' : 'Disembunyikan (Nonaktif)'}
                            </span>
                        </label>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-8">
                        <Link 
                            href="/master/suppliers"
                            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors text-center"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Data Supplier'}
                        </button>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}
