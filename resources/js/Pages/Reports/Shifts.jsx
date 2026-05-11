import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReportFilterBar from '@/Components/Reports/ReportFilterBar';
import ReportMetric from '@/Components/Reports/ReportMetric';

export default function Shifts({ report, locations, filters }) {
    const { auth } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';

    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            dateStyle: 'short',
            timeStyle: 'short'
        });
    };

    return (
        <AppLayout 
            title={isOwner ? "Laporan Shift Kasir" : "Laporan Shift Saya"}
            breadcrumbs={[
                { label: 'Dashboard', url: '/dashboard' },
                { label: 'Laporan' },
                { label: isOwner ? 'Shift Kasir' : 'Shift Saya' },
            ]}
        >
            <Head title={isOwner ? "Laporan Shift" : "Shift Saya"} />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{isOwner ? "Laporan Kinerja Shift Kasir" : "Laporan Shift Saya"}</h1>
                <p className="text-gray-500 text-sm">Rekapitulasi penjualan, transaksi, dan selisih kas per shift.</p>
            </div>

            <ReportFilterBar 
                filters={filters} 
                locations={locations}
                showLocation={isOwner} // Non-owner can't change location filter
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <ReportMetric 
                    label="Total Shift Selesai" 
                    value={report.total_shifts} 
                    color="text-gray-900"
                />
                <ReportMetric 
                    label="Total Penjualan Shift" 
                    value={formatRp(report.summary.total_sales)} 
                    color="text-emerald-600"
                    subtext={`${report.summary.total_transactions} total transaksi`}
                />
                <ReportMetric 
                    label="Total Selisih Kas" 
                    value={formatRp(report.summary.total_difference)} 
                    color={report.summary.total_difference < 0 ? 'text-red-600' : report.summary.total_difference > 0 ? 'text-emerald-600' : 'text-gray-900'}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-800">Daftar Sesi Shift</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                {isOwner && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kasir & Toko</th>}
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu Shift</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaksi</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Penjualan</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Kas Harapan</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Kas Aktual</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Selisih</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {report.shifts.length === 0 ? (
                                <tr>
                                    <td colSpan={isOwner ? 8 : 7} className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada data shift pada periode ini.
                                    </td>
                                </tr>
                            ) : (
                                report.shifts.map((shift) => (
                                    <tr key={shift.id} className="hover:bg-gray-50">
                                        {isOwner && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{shift.cashier_name}</div>
                                                <div className="text-xs text-gray-500">{shift.location_name}</div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatDate(shift.opened_at)}</div>
                                            <div className="text-xs text-gray-500">s/d {formatDate(shift.closed_at)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {shift.status === 'closed' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    Selesai
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    Aktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                            {shift.total_transactions}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                            {formatRp(shift.total_sales)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                            {formatRp(shift.expected_balance)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                            {shift.status === 'closed' ? formatRp(shift.actual_balance) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                            {shift.status === 'closed' ? (
                                                <span className={shift.difference < 0 ? 'text-red-600 font-bold' : shift.difference > 0 ? 'text-emerald-600' : 'text-gray-500'}>
                                                    {shift.difference > 0 ? '+' : ''}{formatRp(shift.difference)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
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
