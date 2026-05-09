import React, { useState, useEffect } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import StatusBadge from '../../Components/Inventory/StatusBadge';

export default function OpnameShow({ opname }) {
    const { auth } = usePage().props;
    const isOwner = auth.user.role === 'owner';
    const isStockist = auth.user.role === 'stockist';
    
    // Initialize items state, fixing BUG-04 by setting empty string if physical_quantity is null or 0 in initial state
    const [items, setItems] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Derived states
    const isInProgress = opname.status === 'in_progress';
    const isSubmitted = opname.status === 'submitted';
    const isApproved = opname.status === 'approved';

    useEffect(() => {
        if (opname.items) {
            setItems(opname.items.map(item => ({
                id: item.id,
                product_name: item.product?.name,
                sku: item.product?.sku,
                system_quantity: parseFloat(item.system_quantity),
                // BUG-04 Fix: Jika 0 atau null dari backend, tampilkan sebagai string kosong di input
                physical_quantity: (item.physical_quantity === null || parseFloat(item.physical_quantity) === 0 && isInProgress) 
                                    ? '' 
                                    : parseFloat(item.physical_quantity),
                difference: parseFloat(item.difference || 0),
                shrinkage_value: parseFloat(item.shrinkage_value || 0),
            })));
        }
    }, [opname]);

    const handleCountChange = (id, value) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                // Jangan paksa parse jika string kosong (agar user bisa hapus teks)
                const val = value === '' ? '' : parseFloat(value);
                const physQty = val === '' ? 0 : val;
                
                return { 
                    ...item, 
                    physical_quantity: value,
                    difference: physQty - item.system_quantity
                };
            }
            return item;
        }));
    };

    const handleSaveCounts = () => {
        setIsProcessing(true);
        // Clean payload: ubah empty string jadi 0
        const payload = {
            counts: items.map(i => ({
                item_id: i.id,
                physical_quantity: i.physical_quantity === '' ? 0 : i.physical_quantity
            }))
        };

        router.put(`/inventory/opname/${opname.id}/counts`, payload, {
            preserveScroll: true,
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleSubmitToOwner = () => {
        if (!confirm('Submit hasil hitung ke Owner? Anda tidak dapat merubah data lagi setelah ini.')) return;
        
        setIsProcessing(true);
        // Kita simpan dulu baru submit (opsional, tapi lebih aman route backend meng-handle-nya dari state terakhir di db)
        // Di sini kita asumsikan Stockist sudah klik save atau submit langsung nge-save
        const payload = {
            counts: items.map(i => ({
                item_id: i.id,
                physical_quantity: i.physical_quantity === '' ? 0 : i.physical_quantity
            }))
        };
        
        router.put(`/inventory/opname/${opname.id}/counts`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                router.patch(`/inventory/opname/${opname.id}/submit`, {}, {
                    preserveScroll: true,
                    onFinish: () => setIsProcessing(false),
                });
            },
            onError: () => setIsProcessing(false),
        });
    };

    const handleApprove = () => {
        if (!confirm('Approve sesi ini? Stok seluruh sistem di toko ini akan DISESUAIKAN menjadi stok fisik.')) return;
        
        setIsProcessing(true);
        router.patch(`/inventory/opname/${opname.id}/approve`, {}, {
            onFinish: () => setIsProcessing(false),
        });
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    return (
        <AppLayout title={`Opname ${opname.opname_number}`} breadcrumbs={[
            { label: 'Inventori' }, 
            { label: 'Stock Opname', url: '/inventory/opname' },
            { label: opname.opname_number }
        ]}>
            <Head title={`Opname ${opname.opname_number}`} />

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/inventory/opname" className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{opname.opname_number}</h1>
                                <StatusBadge status={opname.status} />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(opname.opname_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} di {opname.location?.name}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {isInProgress && isStockist && (
                            <>
                                <button 
                                    onClick={handleSaveCounts}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-white text-primary border border-primary/30 text-sm font-medium rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                    Simpan Hitungan
                                </button>
                                <button 
                                    onClick={handleSubmitToOwner}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    Submit ke Owner
                                </button>
                            </>
                        )}

                        {isSubmitted && isOwner && (
                            <button 
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                Approve & Adjust Stok
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Table */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                                <h2 className="text-lg font-bold text-gray-900">Lembar Hitung Fisik</h2>
                                <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                                    {items.length} Item
                                </span>
                            </div>
                            
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                        <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-4 font-medium">Produk</th>
                                            <th className="px-6 py-4 font-medium text-center">Stok Sistem</th>
                                            <th className="px-6 py-4 font-medium text-center w-32">Stok Fisik</th>
                                            <th className="px-6 py-4 font-medium text-center">Selisih</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {items.map((item) => {
                                            const isNegative = item.difference < 0;
                                            const isPositive = item.difference > 0;

                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-gray-900">{item.product_name}</p>
                                                        <p className="text-xs text-gray-500">{item.sku}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                                                            {item.system_quantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {isInProgress && isStockist ? (
                                                            <input 
                                                                type="number" 
                                                                min="0"
                                                                step="0.01"
                                                                value={item.physical_quantity}
                                                                onChange={(e) => handleCountChange(item.id, e.target.value)}
                                                                className="w-full text-center px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 transition-colors bg-white font-medium"
                                                                placeholder="0"
                                                            />
                                                        ) : (
                                                            <span className="font-bold text-gray-900 text-lg">
                                                                {item.physical_quantity === '' ? 0 : item.physical_quantity}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center justify-center px-3 py-1 font-bold text-sm rounded-full border ${
                                                            isNegative ? 'bg-red-50 text-red-600 border-red-200' :
                                                            isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                            'bg-gray-50 text-gray-400 border-gray-200'
                                                        }`}>
                                                            {item.difference > 0 ? '+' : ''}{item.difference.toFixed(2)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Informasi Sesi</h2>
                            
                            <ul className="space-y-4">
                                <li>
                                    <p className="text-xs text-gray-500 mb-1">Pelaksana (Stockist)</p>
                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        {opname.conductor?.name}
                                    </p>
                                </li>
                                {opname.approver && (
                                    <li className="pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Disetujui Oleh</p>
                                        <p className="font-medium text-gray-900 text-green-700 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            {opname.approver.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Pada {new Date(opname.approved_at).toLocaleString('id-ID')}</p>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Security Rule: HPP/Shrinkage is ONLY for owner */}
                        {isOwner && !isInProgress && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                        Laporan Penyusutan
                                    </h2>
                                </div>
                                <div className="p-5 bg-gradient-to-br from-white to-gray-50">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Total Nilai Barang Hilang</p>
                                    <p className={`text-3xl font-black tracking-tight ${parseFloat(opname.total_shrinkage_value) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {formatCurrency(opname.total_shrinkage_value || 0)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                                        *Hanya selisih negatif yang dihitung sebagai penyusutan nilai (Loss). Dihitung berdasarkan nilai HPP saat sesi dimulai.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
