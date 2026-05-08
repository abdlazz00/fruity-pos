import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

const statusConfig = {
    in_progress: { label: 'Sedang Berjalan', variant: 'info' },
    submitted:   { label: 'Menunggu Approval', variant: 'warning' },
    approved:    { label: 'Selesai', variant: 'success' },
};

export default function OpnameIndex({ opnames, locations = [], filters = {}, has_active_opname }) {
    const { auth } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';
    const isStockist = auth?.user?.role === 'stockist';

    // Check if there's an active opname for disable logic
    const hasActiveOpname = has_active_opname;

    const handleStatusFilter = (e) => {
        router.get('/inventory/opname', {
            status: e.target.value || undefined,
            location_id: filters.location_id || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleLocationFilter = (e) => {
        router.get('/inventory/opname', {
            status: filters.status || undefined,
            location_id: e.target.value || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleStartOpname = () => {
        router.post('/inventory/opname/start');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
        });
    };

    const formatRp = (value) => {
        if (!value) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <AppLayout
            title="Stock Opname"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Stock Opname' },
            ]}
        >
            <Head title="Stock Opname" />

            <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#1C1C1C]">Stock Opname</h1>
                        <p className="text-sm text-text-secondary mt-1">
                            Audit stok fisik dan bandingkan dengan data sistem
                        </p>
                    </div>
                    {isStockist && (
                        <Button
                            variant="primary"
                            onClick={handleStartOpname}
                            disabled={hasActiveOpname}
                            title={hasActiveOpname ? 'Selesaikan opname aktif terlebih dahulu' : ''}
                        >
                            {hasActiveOpname ? '⏳ Ada Opname Aktif' : '+ Mulai Opname Baru'}
                        </Button>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-border overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-border bg-gray-50/50 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-text-secondary">Status:</span>
                            <select
                                className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                                value={filters.status || ''}
                                onChange={handleStatusFilter}
                            >
                                <option value="">Semua</option>
                                <option value="in_progress">Sedang Berjalan</option>
                                <option value="submitted">Menunggu Approval</option>
                                <option value="approved">Selesai</option>
                            </select>
                        </div>

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
                                    <th className="px-4 py-3 font-medium">No. Opname</th>
                                    <th className="px-4 py-3 font-medium">Lokasi</th>
                                    <th className="px-4 py-3 font-medium">Pelaksana</th>
                                    <th className="px-4 py-3 font-medium">Tanggal</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    {isOwner && <th className="px-4 py-3 font-medium text-right">Nilai Penyusutan</th>}
                                    <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-border">
                                {opnames.data?.length > 0 ? (
                                    opnames.data.map((opname, index) => {
                                        const cfg = statusConfig[opname.status] || { label: opname.status, variant: 'default' };
                                        return (
                                            <tr
                                                key={opname.id}
                                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} hover:bg-[#F0FDF4] transition-colors`}
                                            >
                                                <td className="px-4 py-3 font-mono text-text-secondary text-xs">{opname.opname_number}</td>
                                                <td className="px-4 py-3 font-medium">{opname.location?.name}</td>
                                                <td className="px-4 py-3 text-text-secondary">{opname.conductor?.name}</td>
                                                <td className="px-4 py-3 text-text-secondary">{formatDate(opname.opname_date)}</td>
                                                <td className="px-4 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                                                {isOwner && (
                                                    <td className="px-4 py-3 text-right font-medium text-[#DC2626]">
                                                        {opname.total_shrinkage_value ? formatRp(opname.total_shrinkage_value) : '-'}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-right">
                                                    <Link href={`/inventory/opname/${opname.id}`}>
                                                        <Button variant="secondary" className="!px-3 !py-1 text-xs">
                                                            {opname.status === 'in_progress' ? 'Lanjutkan' : opname.status === 'submitted' && isOwner ? 'Review' : 'Detail'}
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={isOwner ? 7 : 6} className="px-4 py-12 text-center text-text-secondary">
                                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                            Belum ada sesi stock opname
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {opnames.last_page > 1 && (
                        <div className="p-4 border-t border-border flex justify-between items-center bg-white">
                            <span className="text-sm text-text-secondary">
                                Menampilkan {opnames.data.length} dari {opnames.total} data
                            </span>
                            <div className="flex space-x-1">
                                {opnames.links?.map((link, idx) => (
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
