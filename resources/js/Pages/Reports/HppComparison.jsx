import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReportFilterBar from '@/Components/Reports/ReportFilterBar';
import ReportMetric from '@/Components/Reports/ReportMetric';

export default function HppComparison({ report, locations, filters }) {
    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    return (
        <AppLayout 
            title="Komparasi HPP"
            breadcrumbs={[
                { label: 'Dashboard', url: '/dashboard' },
                { label: 'Laporan' },
                { label: 'Komparasi HPP' },
            ]}
        >
            <Head title="Komparasi HPP" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Perbandingan HPP Antar Toko</h1>
                <p className="text-gray-500 text-sm">Analisis selisih harga rata-rata (WAC) untuk produk yang sama di toko berbeda.</p>
            </div>

            {/* Note: showDateRange is false because HPP is based on current WAC snapshot */}
            <ReportFilterBar filters={filters} locations={locations} showDateRange={false} />

            <div className="mb-6">
                <ReportMetric 
                    label="Total Produk Dianalisis" 
                    value={report.total_items} 
                    color="text-gray-900"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-800">Analisis Spread HPP</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Produk & SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sebaran Toko (HPP saat ini)</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">HPP Termurah</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">HPP Termahal</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Selisih (Spread)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {report.products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada data HPP untuk dianalisis.
                                    </td>
                                </tr>
                            ) : (
                                report.products.map((item) => (
                                    <tr key={item.product_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{item.product_name}</div>
                                            <div className="text-xs text-gray-500">{item.sku}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.category}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex flex-col gap-1">
                                                {item.locations.map(loc => (
                                                    <div key={loc.location_id} className="flex justify-between items-center text-xs bg-gray-50 p-1 rounded">
                                                        <span className="text-gray-600 font-medium">{loc.location_name}</span>
                                                        <span className="text-gray-900 ml-4">{formatRp(loc.avg_cost)} <span className="text-gray-400 font-normal">({loc.quantity})</span></span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-emerald-600">
                                            {formatRp(item.min_cost)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                                            {formatRp(item.max_cost)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                            <span className={item.spread > 5000 ? 'text-red-600' : item.spread > 1000 ? 'text-amber-600' : 'text-emerald-600'}>
                                                {formatRp(item.spread)}
                                            </span>
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
