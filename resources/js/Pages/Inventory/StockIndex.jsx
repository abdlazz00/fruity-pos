import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';

export default function StockIndex({ inventories, locations = [], categories = [], filters = {} }) {
    const { auth } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';

    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/inventory/stocks', {
            ...filters,
            search: search || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleFilterChange = (key, value) => {
        router.get('/inventory/stocks', {
            ...filters,
            [key]: value || undefined,
        }, { preserveState: true, replace: true });
    };

    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <AppLayout
            title={isOwner ? "Semua Stok Produk" : "Stok Produk Saya"}
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Inventaris', url: '#' },
                { label: 'Stok Produk' },
            ]}
        >
            <Head title="Stok Produk" />

            <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#1C1C1C]">
                            {isOwner ? 'Monitoring Semua Stok' : 'Stok Produk Toko'}
                        </h1>
                        <p className="text-sm text-text-secondary mt-1">
                            Pantau jumlah ketersediaan produk secara realtime.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                    {/* Filters & Search */}
                    <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
                        <form onSubmit={handleSearch} className="flex flex-1 max-w-sm relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg text-sm focus:ring-accent focus:border-accent"
                                placeholder="Cari nama atau SKU produk..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit" className="hidden">Search</button>
                        </form>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-text-secondary">Kategori:</span>
                                <select
                                    className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                                    value={filters.category_id || ''}
                                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {isOwner && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-text-secondary">Lokasi:</span>
                                    <select
                                        className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                                        value={filters.location_id || ''}
                                        onChange={(e) => handleFilterChange('location_id', e.target.value)}
                                    >
                                        <option value="">Semua Toko</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
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
                                    <th className="px-4 py-3 font-medium">Produk</th>
                                    <th className="px-4 py-3 font-medium">SKU</th>
                                    <th className="px-4 py-3 font-medium">Kategori</th>
                                    {isOwner && <th className="px-4 py-3 font-medium">Lokasi</th>}
                                    <th className="px-4 py-3 font-medium text-center">Sisa Stok</th>
                                    {isOwner && <th className="px-4 py-3 font-medium text-right">Avg Cost</th>}
                                    {isOwner && <th className="px-4 py-3 font-medium text-right">Total Nilai</th>}
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-border">
                                {inventories.data?.length > 0 ? (
                                    inventories.data.map((inv, index) => {
                                        const qty = parseFloat(inv.quantity);
                                        const avgCost = parseFloat(inv.avg_cost || 0);
                                        const isLowStock = qty <= 5; // Simple indicator

                                        return (
                                            <tr
                                                key={inv.id}
                                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} hover:bg-gray-50 transition-colors`}
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    <div className="flex items-center gap-3">
                                                        {inv.product.image_path ? (
                                                            <img 
                                                                src={`/storage/${inv.product.image_path}`} 
                                                                alt={inv.product.name}
                                                                className="w-8 h-8 rounded object-cover border border-border"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center border border-border">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <span>{inv.product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-text-secondary text-xs">{inv.product.sku || '-'}</td>
                                                <td className="px-4 py-3 text-text-secondary">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                                        {inv.product.category?.name || '-'}
                                                    </span>
                                                </td>
                                                {isOwner && <td className="px-4 py-3 text-text-secondary">{inv.location?.name}</td>}
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`font-mono font-bold ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                                                        {qty.toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-text-muted ml-1">{inv.product.base_uom}</span>
                                                </td>
                                                {isOwner && (
                                                    <td className="px-4 py-3 text-right text-text-secondary font-mono text-xs">
                                                        {formatRp(avgCost)}
                                                    </td>
                                                )}
                                                {isOwner && (
                                                    <td className="px-4 py-3 text-right font-medium text-[#1C1C1C]">
                                                        {formatRp(qty * avgCost)}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={isOwner ? 7 : 5} className="px-4 py-12 text-center text-text-secondary">
                                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            Tidak ada data stok produk ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {inventories.last_page > 1 && (
                        <div className="p-4 border-t border-border flex justify-between items-center bg-white">
                            <span className="text-sm text-text-secondary">
                                Menampilkan {inventories.data.length} dari {inventories.total} data
                            </span>
                            <div className="flex space-x-1">
                                {inventories.links?.map((link, idx) => (
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
