import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReportFilterBar from '@/Components/Reports/ReportFilterBar';
import ReportMetric from '@/Components/Reports/ReportMetric';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Sales({ report, locations, filters }) {
    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    const pieData = [
        { name: 'Offline (Walk-in)', value: report.summary.offline.revenue },
        { name: 'Online (Delivery)', value: report.summary.online.revenue }
    ].filter(d => d.value > 0);

    const COLORS = ['#3b82f6', '#a855f7']; // Blue for offline, Purple for online

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 shadow-md rounded-lg">
                    <p className="font-medium text-gray-900">{payload[0].name}</p>
                    <p className="text-gray-600 font-bold">{formatRp(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <AppLayout 
            title="Laporan Penjualan"
            breadcrumbs={[
                { label: 'Dashboard', url: '/dashboard' },
                { label: 'Laporan' },
                { label: 'Penjualan Kanal' },
            ]}
        >
            <Head title="Penjualan Per Kanal" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Penjualan per Channel</h1>
                <p className="text-gray-500 text-sm">Komparasi transaksi offline vs online di setiap toko.</p>
            </div>

            <ReportFilterBar filters={filters} locations={locations} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <ReportMetric 
                    label="Total Penjualan Offline" 
                    value={formatRp(report.summary.offline.revenue)} 
                    color="text-blue-600"
                    subtext={`${report.summary.offline.transactions} transaksi`}
                />
                <ReportMetric 
                    label="Total Penjualan Online" 
                    value={formatRp(report.summary.online.revenue)} 
                    color="text-purple-600"
                    subtext={`${report.summary.online.transactions} transaksi`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center">
                    <h2 className="font-bold text-gray-800 self-start mb-4">Proporsi Pendapatan</h2>
                    {pieData.length > 0 ? (
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="w-full h-64 flex items-center justify-center text-gray-400">
                            Tidak ada data penjualan
                        </div>
                    )}
                </div>

                {/* Detail Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800">Rincian per Toko & Platform</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toko</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jml Transaksi</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Diskon</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {report.details.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada data transaksi pada periode ini.
                                        </td>
                                    </tr>
                                ) : (
                                    report.details.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {row.location_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {row.type === 'offline' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Offline
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        Online
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                {row.platform || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                {row.total_transactions}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 text-right">
                                                {row.total_discount > 0 ? `-${formatRp(row.total_discount)}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                                                {formatRp(row.revenue)}
                                            </td>
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
