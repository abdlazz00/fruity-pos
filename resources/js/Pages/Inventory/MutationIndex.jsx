import React from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import StatusBadge from '../../Components/Inventory/StatusBadge';

export default function MutationIndex({ mutations, locations, filters }) {
    const { auth } = usePage().props;
    const isOwner = auth.user.role === 'owner';
    const isStockist = auth.user.role === 'stockist';

    const handleFilterStatus = (status) => {
        router.get('/inventory/mutations', { ...filters, status, page: 1 }, { preserveState: true });
    };

    const handleFilterLocation = (e) => {
        router.get('/inventory/mutations', { ...filters, location_id: e.target.value, page: 1 }, { preserveState: true });
    };

    const statusTabs = [
        { value: '', label: 'Semua' },
        { value: 'preparing', label: 'Preparing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'received', label: 'Received' },
        { value: 'completed', label: 'Completed' },
    ];

    return (
        <AppLayout title="Mutasi Stok" breadcrumbs={[{ label: 'Inventori' }, { label: 'Mutasi Stok', url: '/inventory/mutations' }]}>
            <Head title="Mutasi Stok" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mutasi Stok</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola pergerakan barang antar toko cabang.</p>
                </div>
                
                {isStockist && (
                    <Link href="/inventory/mutations/create" className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Buat Mutasi Baru
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
                                <th className="px-6 py-4 font-medium">No. Mutasi</th>
                                <th className="px-6 py-4 font-medium">Asal → Tujuan</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Pembuat</th>
                                <th className="px-6 py-4 font-medium">Tanggal</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mutations.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                            <p className="text-base font-medium text-gray-900">Tidak ada data mutasi</p>
                                            <p className="text-sm mt-1">Ubah filter atau buat mutasi baru.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                mutations.data.map((mutation) => (
                                    <tr key={mutation.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{mutation.mutation_number}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{mutation.items_count || mutation.items?.length || 0} items</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-700">{mutation.from_location?.name}</span>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                <span className="font-medium text-primary">{mutation.to_location?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={mutation.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{mutation.creator?.name}</div>
                                            {mutation.receiver && (
                                                <div className="text-xs text-gray-500 mt-0.5">Penerima: {mutation.receiver.name}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {new Date(mutation.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={`/inventory/mutations/${mutation.id}`}
                                                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                                            >
                                                Lihat Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {mutations.links && mutations.links.length > 3 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-center gap-1">
                        {mutations.links.map((link, k) => (
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
