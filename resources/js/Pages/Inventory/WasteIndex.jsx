import React from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import StatusBadge from '../../Components/Inventory/StatusBadge';

export default function WasteIndex({ wastes, filters }) {
    const { auth } = usePage().props;
    const isOwner = auth.user.role === 'owner';
    const isStockist = auth.user.role === 'stockist';

    const handleFilterStatus = (status) => {
        router.get('/inventory/waste', { ...filters, status, page: 1 }, { preserveState: true });
    };

    const statusTabs = [
        { value: '', label: 'Semua' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
    ];

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    return (
        <AppLayout title="Waste Management" breadcrumbs={[{ label: 'Inventori' }, { label: 'Waste / Rusak', url: '/inventory/waste' }]}>
            <Head title="Waste Management" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Waste Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Catat dan laporkan barang rusak, busuk, atau kadaluarsa.</p>
                </div>
                
                {isStockist && (
                    <Link href="/inventory/waste/create" className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Ajukan Waste Baru
                    </Link>
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
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                                <th className="px-6 py-4 font-medium">No. Request</th>
                                <th className="px-6 py-4 font-medium">Lokasi / Pengaju</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                {isOwner && <th className="px-6 py-4 font-medium text-right">Nilai HPP (Loss)</th>}
                                <th className="px-6 py-4 font-medium">Tanggal</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {wastes.data.length === 0 ? (
                                <tr>
                                    <td colSpan={isOwner ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <p className="text-base font-medium text-gray-900">Tidak ada data waste</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                wastes.data.map((waste) => {
                                    // Hitung total HPP jika role owner
                                    const totalHpp = waste.items?.reduce((sum, item) => sum + parseFloat(item.hpp_value || 0), 0) || 0;

                                    return (
                                        <tr key={waste.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{waste.request_number}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{waste.items_count || waste.items?.length || 0} items</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-700">{waste.location?.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{waste.requester?.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={waste.status} />
                                            </td>
                                            {isOwner && (
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-medium text-red-600">{formatCurrency(totalHpp)}</span>
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(waste.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link 
                                                    href={`/inventory/waste/${waste.id}`}
                                                    className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                        isOwner && waste.status === 'pending' 
                                                            ? 'text-white bg-accent hover:bg-accent-hover shadow-sm'
                                                            : 'text-primary bg-primary/10 hover:bg-primary/20'
                                                    }`}
                                                >
                                                    {isOwner && waste.status === 'pending' ? 'Review' : 'Detail'}
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {wastes.links && wastes.links.length > 3 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-center gap-1">
                        {wastes.links.map((link, k) => (
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
