import React from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function ReorderPointIndex({ reorderPoints, lowStockAlerts, locations, filters }) {
    const { auth } = usePage().props;
    const isOwner = auth.user.role === 'owner';

    const handleFilterLocation = (e) => {
        router.get('/inventory/reorder-points', { ...filters, location_id: e.target.value, page: 1 }, { preserveState: true });
    };

    const handleToggle = (id) => {
        if (confirm('Yakin ingin mengubah status reorder point ini?')) {
            router.patch(`/inventory/reorder-points/${id}/toggle`, {}, { preserveScroll: true });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus reorder point ini?')) {
            router.delete(`/inventory/reorder-points/${id}`, { preserveScroll: true });
        }
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) return `${diffMins} menit lalu`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} jam lalu`;
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    };

    return (
        <AppLayout title="Reorder Point" breadcrumbs={[{ label: 'Inventori' }, { label: 'Reorder Point', url: '/inventory/reorder-points' }]}>
            <Head title="Reorder Point" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reorder Point</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola batas minimum stok produk untuk peringatan stok habis.</p>
                </div>
                
                <Link href="/inventory/reorder-points/create" className="btn-primary flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Set Reorder Point
                </Link>
            </div>

            {/* Low Stock Alert Banner */}
            {lowStockAlerts && lowStockAlerts.length > 0 && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                    <div className="flex">
                        <div className="shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Peringatan Stok Rendah
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>Terdapat {lowStockAlerts.length} produk yang stoknya di bawah batas minimum. Segera lakukan pengadaan!</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">Daftar Reorder Point</span>
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
                                <th className="px-6 py-4 font-medium">Produk</th>
                                <th className="px-6 py-4 font-medium">Toko</th>
                                <th className="px-6 py-4 font-medium text-right">Min. Stok</th>
                                <th className="px-6 py-4 font-medium text-center">Status</th>
                                <th className="px-6 py-4 font-medium">Terakhir Alert</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reorderPoints.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <p className="text-base font-medium text-gray-900">Tidak ada reorder point</p>
                                            <p className="text-sm mt-1">Belum ada batas minimum stok yang diatur.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reorderPoints.data.map((item) => {
                                    const isLowStock = lowStockAlerts.some(alert => alert.id === item.id);
                                    
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{item.product?.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{item.product?.sku}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-700">{item.location?.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-semibold text-gray-900 text-lg">
                                                    {parseFloat(item.min_quantity).toString()}
                                                </div>
                                                <div className="text-xs text-gray-500">{item.product?.base_uom}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {isLowStock ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                        ⚠️ Stok Rendah
                                                    </span>
                                                ) : item.is_active ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {formatRelativeTime(item.last_notified_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button 
                                                    onClick={() => handleToggle(item.id)}
                                                    className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                        item.is_active 
                                                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' 
                                                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                                    }`}
                                                >
                                                    {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {reorderPoints.links && reorderPoints.links.length > 3 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-center gap-1">
                        {reorderPoints.links.map((link, k) => (
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
