import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReportFilterBar from '@/Components/Reports/ReportFilterBar';
import ReportMetric from '@/Components/Reports/ReportMetric';

export default function Inventory({ report, locations, filters }) {
    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    const formatQty = (qty) => {
        return parseFloat(qty || 0).toString();
    };

    // Low stock toggle checkbox for the extraFilters prop
    const lowStockFilter = (handleChange) => (
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 ml-2">
            <input 
                type="checkbox" 
                className="rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                checked={filters.lowStockOnly === '1' || filters.lowStockOnly === true}
                onChange={(e) => handleChange('low_stock_only', e.target.checked ? '1' : '')} 
            />
            Hanya Tampilkan Stok Rendah
        </label>
    );

    return (
        <AppLayout 
            title="Laporan Stok Inventori"
            breadcrumbs={[
                { label: 'Dashboard', url: '/dashboard' },
                { label: 'Laporan' },
                { label: 'Laporan Stok' },
            ]}
        >
            <Head title="Laporan Stok" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Laporan Stok Inventori</h1>
                <p className="text-gray-500 text-sm">Status real-time ketersediaan dan nilai HPP persediaan.</p>
            </div>

            <ReportFilterBar 
                filters={filters} 
                locations={locations} 
                showDateRange={false} 
                extraFilters={lowStockFilter}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <ReportMetric 
                    label="Total Produk Terdaftar" 
                    value={report.total_items} 
                    color="text-gray-900"
                    subtext="Jumlah SKU per toko"
                />
                <ReportMetric 
                    label="Total Estimasi Nilai Stok (HPP)" 
                    value={formatRp(report.total_stock_value)} 
                    color="text-emerald-600"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-800">Daftar Inventori</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Produk</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU & Kategori</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lokasi Toko</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Kuantitas</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga Rata-rata (WAC)</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Nilai Stok</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {report.items.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        Tidak ada data inventori yang sesuai filter.
                                    </td>
                                </tr>
                            ) : (
                                report.items.map((item) => (
                                    <tr key={`${item.product_id}-${item.location_id}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{item.product_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.sku}</div>
                                            <div className="text-xs text-gray-500">{item.category_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.location_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <span className={`font-bold ${item.quantity <= 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                                {formatQty(item.quantity)}
                                            </span>
                                            <span className="text-gray-500 text-xs ml-1">{item.base_uom}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                            {formatRp(item.avg_cost)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                            {formatRp(item.stock_value)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
