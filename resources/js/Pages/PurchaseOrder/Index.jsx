import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

export default function Index({ purchaseOrders, filters = {} }) {
    const handleFilterChange = (e) => {
        router.get(
            '/procurement/purchase-orders',
            { status: e.target.value },
            { preserveState: true, replace: true }
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft': return <Badge variant="default">Draft</Badge>;
            case 'confirmed': return <Badge variant="info">Dikonfirmasi</Badge>;
            case 'partially_received': return <Badge variant="warning">Sebagian Diterima</Badge>;
            case 'completed': return <Badge variant="success">Selesai</Badge>;
            case 'cancelled': return <Badge variant="danger">Dibatalkan</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

    const formatDateTime = (dateString, createdAt) => {
        if (!dateString) return '-';
        const datePart = dateString.split(' ')[0];
        if (!createdAt) return `${datePart} 00:00:00`;
        
        const d = new Date(createdAt);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return `${datePart} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <AppLayout
            title="Purchase Order"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Purchase Order' },
            ]}
        >
            <Head title="Purchase Order" />

            <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-[#1C1C1C]">Daftar Purchase Order</h1>
                    <Link href="/procurement/purchase-orders/create">
                        <Button variant="primary">Buat PO Baru</Button>
                    </Link>
                </div>

                <div className="bg-white rounded-xl border border-border overflow-hidden">
                    {/* Toolbar / Filters */}
                    <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-text-secondary">Filter Status:</span>
                            <select 
                                className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                                value={filters.status || ''}
                                onChange={handleFilterChange}
                            >
                                <option value="">Semua Status</option>
                                <option value="draft">Draft</option>
                                <option value="confirmed">Dikonfirmasi</option>
                                <option value="partially_received">Sebagian Diterima</option>
                                <option value="completed">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary text-white uppercase text-xs">
                                    <th className="px-4 py-3 font-medium">No. PO</th>
                                    <th className="px-4 py-3 font-medium">Tanggal</th>
                                    <th className="px-4 py-3 font-medium">Supplier</th>
                                    <th className="px-4 py-3 font-medium">Lokasi</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Total Item</th>
                                    <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-border">
                                {purchaseOrders.data.length > 0 ? (
                                    purchaseOrders.data.map((po, index) => (
                                        <tr 
                                            key={po.id} 
                                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} hover:bg-[#F0FDF4] transition-colors`}
                                        >
                                            <td className="px-4 py-3 font-mono text-text-secondary">{po.po_number}</td>
                                            <td className="px-4 py-3">{formatDateTime(po.order_date, po.created_at)}</td>
                                            <td className="px-4 py-3">{po.supplier?.name}</td>
                                            <td className="px-4 py-3">{po.location?.name}</td>
                                            <td className="px-4 py-3">{getStatusBadge(po.status)}</td>
                                            <td className="px-4 py-3">{po.items?.length || 0} Item</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/procurement/purchase-orders/${po.id}`}>
                                                    <Button variant="secondary" className="!px-3 !py-1 text-xs">Detail</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-text-secondary">
                                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Belum ada data Purchase Order
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Dummy (Assuming Laravel LengthAwarePaginator format) */}
                    {purchaseOrders.last_page > 1 && (
                        <div className="p-4 border-t border-border flex justify-between items-center bg-white">
                            <span className="text-sm text-text-secondary">
                                Menampilkan {purchaseOrders.data.length} dari {purchaseOrders.total} data
                            </span>
                            <div className="flex space-x-1">
                                {purchaseOrders.links?.map((link, idx) => (
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
