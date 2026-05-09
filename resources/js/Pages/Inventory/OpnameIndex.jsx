import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import StatusBadge from '../../Components/Inventory/StatusBadge';

export default function OpnameIndex({ opnames, locations, filters, has_active_opname }) {
    const { auth } = usePage().props;
    const isOwner = auth.user.role === 'owner';
    const isStockist = auth.user.role === 'stockist';
    const [isStarting, setIsStarting] = useState(false);

    const handleFilterStatus = (status) => {
        router.get('/inventory/opname', { ...filters, status, page: 1 }, { preserveState: true });
    };

    const handleFilterLocation = (e) => {
        router.get('/inventory/opname', { ...filters, location_id: e.target.value, page: 1 }, { preserveState: true });
    };

    const startOpnameSession = () => {
        if (!confirm('Mulai sesi opname baru? Sistem akan menyimpan snapshot stok saat ini.')) return;
        
        setIsStarting(true);
        router.post('/inventory/opname/start', {}, {
            onFinish: () => setIsStarting(false),
        });
    };

    const statusTabs = [
        { value: '', label: 'Semua' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'submitted', label: 'Menunggu Approval' },
        { value: 'approved', label: 'Selesai' },
    ];

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    return (
        <AppLayout title="Stock Opname" breadcrumbs={[{ label: 'Inventori' }, { label: 'Stock Opname', url: '/inventory/opname' }]}>
            <Head title="Stock Opname" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Stock Opname</h1>
                    <p className="text-sm text-gray-500 mt-1">Lakukan audit fisik rutin untuk menyelaraskan stok sistem dan gudang.</p>
                </div>
                
                {isStockist && (
                    <button 
                        onClick={startOpnameSession}
                        disabled={has_active_opname || isStarting}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={has_active_opname ? "Selesaikan sesi aktif terlebih dahulu." : "Mulai sesi baru"}
                    >
                        {isStarting ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        )}
                        Mulai Sesi Opname Baru
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex space-x-1 overflow-x-auto p-1 bg-gray-200/50 rounded-lg">
                        {statusTabs.map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => handleFilterStatus(tab.value)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                                    (filters.status || '') === tab.value 
                                        ? 'bg-white text-primary shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Location Filter for Owner */}
                    {isOwner && (
                        <div className="min-w-[200px]">
                            <select 
                                className="w-full form-input bg-white"
                                value={filters.location_id || ''}
                                onChange={handleFilterLocation}
                            >
                                <option value="">Semua Toko</option>
                                {locations?.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                                <th className="px-6 py-4 font-medium">No. Sesi</th>
                                <th className="px-6 py-4 font-medium">Lokasi / Pelaksana</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                {isOwner && <th className="px-6 py-4 font-medium text-right">Nilai Penyusutan</th>}
                                <th className="px-6 py-4 font-medium">Tanggal Sesi</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {opnames.data.length === 0 ? (
                                <tr>
                                    <td colSpan={isOwner ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p className="text-base font-medium text-gray-900">Tidak ada sesi opname</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                opnames.data.map((opname) => (
                                    <tr key={opname.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{opname.opname_number}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{opname.items_count || opname.items?.length || 0} items</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-700">{opname.location?.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{opname.conductor?.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={opname.status} />
                                        </td>
                                        {isOwner && (
                                            <td className="px-6 py-4 text-right">
                                                {opname.status !== 'in_progress' ? (
                                                    <span className={`font-medium ${parseFloat(opname.total_shrinkage_value) > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                                        {formatCurrency(opname.total_shrinkage_value || 0)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">Dalam proses</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {new Date(opname.opname_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={`/inventory/opname/${opname.id}`}
                                                className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                    opname.status === 'in_progress' && isStockist
                                                        ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-sm'
                                                        : opname.status === 'submitted' && isOwner
                                                            ? 'text-white bg-accent hover:bg-accent-hover shadow-sm'
                                                            : 'text-primary bg-primary/10 hover:bg-primary/20'
                                                }`}
                                            >
                                                {opname.status === 'in_progress' && isStockist ? 'Lanjut Hitung' : 
                                                 opname.status === 'submitted' && isOwner ? 'Review' : 'Detail'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {opnames.links && opnames.links.length > 3 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-center gap-1">
                        {opnames.links.map((link, k) => (
                            <Link
                                key={k}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    link.active 
                                        ? 'bg-primary text-white font-medium shadow-sm' 
                                        : !link.url 
                                            ? 'text-gray-400 cursor-not-allowed' 
                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                preserveState
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
