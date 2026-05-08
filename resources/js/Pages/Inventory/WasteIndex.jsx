import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

const statusConfig = {
    pending:  { label: 'Pending',  variant: 'warning' },
    approved: { label: 'Approved', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'danger' },
};

const reasonLabels = {
    rotten: 'Busuk', damaged: 'Rusak Fisik', expired: 'Kadaluarsa', failed_qc: 'Gagal QC',
};

export default function WasteIndex({ wastes, locations = [], filters = {} }) {
    const { auth } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';
    const isStockist = auth?.user?.role === 'stockist';

    const handleStatusFilter = (e) => {
        router.get('/inventory/waste', {
            status: e.target.value || undefined,
        }, { preserveState: true, replace: true });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <AppLayout
            title="Waste Management"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Waste Management' },
            ]}
        >
            <Head title="Waste Management" />

            <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#1C1C1C]">
                            {isOwner ? 'Approval Waste Request' : 'Pengajuan Waste'}
                        </h1>
                        <p className="text-sm text-text-secondary mt-1">
                            {isOwner
                                ? 'Daftar pengajuan waste yang menunggu persetujuan Anda'
                                : 'Kelola pengajuan barang rusak/kadaluarsa di toko Anda'
                            }
                        </p>
                    </div>
                    {isStockist && (
                        <Link href="/inventory/waste/create">
                            <Button variant="primary">+ Ajukan Waste Baru</Button>
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-border overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-border flex items-center gap-3 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-text-secondary">Filter Status:</span>
                            <select
                                className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                                value={filters.status || ''}
                                onChange={handleStatusFilter}
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        
                        {isOwner && (
                            <div className="flex items-center gap-2 ml-4">
                                <span className="text-sm text-text-secondary">Lokasi:</span>
                                <select
                                    className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                                    value={filters.location_id || ''}
                                    onChange={(e) => {
                                        router.get('/inventory/waste', {
                                            status: filters.status || undefined,
                                            location_id: e.target.value || undefined,
                                        }, { preserveState: true, replace: true });
                                    }}
                                >
                                    <option value="">Semua Toko</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary text-white uppercase text-xs">
                                    <th className="px-4 py-3 font-medium">No. Request</th>
                                    {isOwner && <th className="px-4 py-3 font-medium">Lokasi</th>}
                                    <th className="px-4 py-3 font-medium">Pengaju</th>
                                    <th className="px-4 py-3 font-medium text-center">Items</th>
                                    {isOwner && <th className="px-4 py-3 font-medium text-right">Total HPP</th>}
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Tanggal</th>
                                    <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-border">
                                {wastes.data?.length > 0 ? (
                                    wastes.data.map((waste, index) => {
                                        const cfg = statusConfig[waste.status] || { label: waste.status, variant: 'default' };
                                        const totalHpp = waste.items?.reduce((sum, i) => sum + parseFloat(i.hpp_value || 0), 0) || 0;
                                        return (
                                            <tr
                                                key={waste.id}
                                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} hover:bg-[#F0FDF4] transition-colors`}
                                            >
                                                <td className="px-4 py-3 font-mono text-text-secondary text-xs">{waste.request_number}</td>
                                                {isOwner && <td className="px-4 py-3 font-medium">{waste.location?.name}</td>}
                                                <td className="px-4 py-3 text-text-secondary">{waste.requester?.name}</td>
                                                <td className="px-4 py-3 text-center">{waste.items?.length || 0}</td>
                                                {isOwner && (
                                                    <td className="px-4 py-3 text-right font-medium text-[#DC2626]">
                                                        {formatRp(totalHpp)}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                                                <td className="px-4 py-3 text-text-secondary text-xs">{formatDate(waste.created_at)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link href={`/inventory/waste/${waste.id}`}>
                                                        <Button variant="secondary" className="!px-3 !py-1 text-xs">
                                                            {isOwner && waste.status === 'pending' ? 'Review' : 'Detail'}
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={isOwner ? 8 : 6} className="px-4 py-12 text-center text-text-secondary">
                                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            {isOwner ? 'Tidak ada waste request yang menunggu approval' : 'Belum ada pengajuan waste'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {wastes.last_page > 1 && (
                        <div className="p-4 border-t border-border flex justify-between items-center bg-white">
                            <span className="text-sm text-text-secondary">
                                Menampilkan {wastes.data.length} dari {wastes.total} data
                            </span>
                            <div className="flex space-x-1">
                                {wastes.links?.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm rounded ${
                                            link.active ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'
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
