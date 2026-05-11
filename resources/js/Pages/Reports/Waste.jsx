import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReportFilterBar from '@/Components/Reports/ReportFilterBar';
import ReportMetric from '@/Components/Reports/ReportMetric';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function Waste({ report, locations, filters }) {
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

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 shadow-md rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name === 'total_value' ? 'Nilai Waste: ' + formatRp(entry.value) : 
                             entry.name === 'total_qty' ? 'Kuantitas: ' + formatQty(entry.value) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <AppLayout 
            title="Laporan Waste"
            breadcrumbs={[
                { label: 'Dashboard', url: '/dashboard' },
                { label: 'Laporan' },
                { label: 'Laporan Waste' },
            ]}
        >
            <Head title="Laporan Waste" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Laporan Pembuangan (Waste)</h1>
                <p className="text-gray-500 text-sm">Analisis barang rusak atau tidak layak jual yang telah disetujui.</p>
            </div>

            <ReportFilterBar filters={filters} locations={locations} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <ReportMetric 
                    label="Total Nilai HPP Waste" 
                    value={formatRp(report.total_value)} 
                    color="text-red-600"
                />
                <ReportMetric 
                    label="Total Kuantitas" 
                    value={formatQty(report.total_qty)} 
                    color="text-gray-900"
                    subtext="Unit / Kg"
                />
            </div>

            {/* Tren Bulanan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="font-bold text-gray-800 mb-4">Tren Nilai Waste Bulanan (HPP)</h2>
                {report.monthly_trend.length > 0 ? (
                    <div className="w-full h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={report.monthly_trend}
                                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="month" 
                                    tickFormatter={(val) => {
                                        const [y, m] = val.split('-');
                                        const date = new Date(parseInt(y), parseInt(m) - 1, 1);
                                        return date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
                                    }}
                                    tick={{fontSize: 12, fill: '#6b7280'}}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    yAxisId="left"
                                    tickFormatter={(value) => `Rp${value / 1000}k`}
                                    tick={{fontSize: 12, fill: '#6b7280'}}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Bar yAxisId="left" dataKey="total_value" name="total_value" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="w-full h-48 flex items-center justify-center text-gray-400">
                        Tidak ada data tren pada periode ini.
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tabel per Produk */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800">Top Produk Terbuang</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kuantitas</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai (HPP)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {report.by_product.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">Tidak ada data.</td></tr>
                                ) : (
                                    report.by_product.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.product_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatQty(row.total_qty)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium text-right">{formatRp(row.total_value)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabel per Toko */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800">Rekap per Toko</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toko</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kuantitas</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai (HPP)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {report.by_location.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">Tidak ada data.</td></tr>
                                ) : (
                                    report.by_location.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.location_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatQty(row.total_qty)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium text-right">{formatRp(row.total_value)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
