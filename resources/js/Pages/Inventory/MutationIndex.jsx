import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

const statusConfig = {
    preparing: { label: 'Preparing', variant: 'warning' },
    shipped:   { label: 'Shipped',   variant: 'info' },
    received:  { label: 'Received',  variant: 'success' },
    completed: { label: 'Completed', variant: 'success' },
};

export default function MutationIndex({ mutations, locations = [], filters = {} }) {
    const { auth } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';

    const handleStatusFilter = (status) => {
        router.get('/inventory/mutations', {
            status: status || undefined,
            location_id: filters.location_id || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleLocationFilter = (e) => {
        router.get('/inventory/mutations', {
            status: filters.status || undefined,
            location_id: e.target.value || undefined,
        }, { preserveState: true, replace: true });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const statusTabs = [
        { key: '',          label: 'Semua' },
        { key: 'preparing', label: 'Preparing' },
        { key: 'shipped',   label: 'Shipped' },
        { key: 'received',  label: 'Received' },
        { key: 'completed', label: 'Completed' },
    ];

    return (
        <AppLayout
            title="Mutasi Stok"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Mutasi Stok' },
            ]}
        >
            <Head title="Mutasi Stok" />

            <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-[#1C1C1C]">Mutasi Stok Antar Toko</h1>
                    {!isOwner && (
                        <Link href="/inventory/mutations/create">
                            <Button variant="primary">+ Buat Mutasi</Button>
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-border overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-border bg-gray-50/50">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* Status Tabs */}
                            <div className="flex items-center gap-1 bg-white border border-border rounded-lg p-0.5">
                                {statusTabs.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleStatusFilter(tab.key)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                            (filters.status || '') === tab.key
                                                ? 'bg-[#2C6E49] text-white shadow-sm'
                                                : 'text-text-secondary hover:text-[#1C1C1C] hover:bg-gray-100'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Location filter (Owner only) */}
                            {isOwner && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-text-secondary">Lokasi:</span>
                                    <select
                                        className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                                        value={filters.location_id || ''}
                                        onChange={handleLocationFilter}
                                    >
                                        <option value="">Semua Toko</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary text-white uppercase text-xs">
                                    <th className="px-4 py-3 font-medium">No. Mutasi</th>
                                    <th className="px-4 py-3 font-medium">Asal → Tujuan</th>
                                    <th className="px-4 py-3 font-medium">Pembuat</th>
                                    <th className="px-4 py-3 font-medium text-center">Items</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Tanggal</th>
                                    <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-border">
                                {mutations.data?.length > 0 ? (
                                    mutations.data.map((mut, index) => {
                                        const cfg = statusConfig[mut.status] || { label: mut.status, variant: 'default' };
                                        return (
                                            <tr
                                                key={mut.id}
                                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} hover:bg-[#F0FDF4] transition-colors`}
                                            >
                                                <td className="px-4 py-3 font-mono text-text-secondary text-xs">{mut.mutation_number}</td>
                                                <td className="px-4 py-3">
                                                    <span className="font-medium">{mut.from_location?.name}</span>
                                                    <span className="text-text-muted mx-1.5">→</span>
                                                    <span className="font-medium">{mut.to_location?.name}</span>
                                                </td>
                                                <td className="px-4 py-3 text-text-secondary">{mut.creator?.name}</td>
                                                <td className="px-4 py-3 text-center">{mut.items?.length || 0}</td>
                                                <td className="px-4 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                                                <td className="px-4 py-3 text-text-secondary text-xs">{formatDate(mut.created_at)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link href={`/inventory/mutations/${mut.id}`}>
                                                        <Button variant="secondary" className="!px-3 !py-1 text-xs">Detail</Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-text-secondary">
                                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                            Belum ada data mutasi stok
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {mutations.last_page > 1 && (
                        <div className="p-4 border-t border-border flex justify-between items-center bg-white">
                            <span className="text-sm text-text-secondary">
                                Menampilkan {mutations.data.length} dari {mutations.total} data
                            </span>
                            <div className="flex space-x-1">
                                {mutations.links?.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm rounded ${
                                            link.active
                                                ? 'bg-primary text-white'
                                                : 'text-text-secondary hover:bg-gray-100'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
