import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReportFilterBar from '@/Components/Reports/ReportFilterBar';
import ReportMetric from '@/Components/Reports/ReportMetric';

export default function Discounts({ report, locations, filters }) {
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
            title="Laporan Transaksi Diskon"
            breadcrumbs={[
                { label: 'Dashboard', url: '/dashboard' },
                { label: 'Laporan' },
                { label: 'Laporan Diskon' },
            ]}
        >
            <Head title="Laporan Diskon" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Laporan Transaksi dengan Diskon</h1>
                <p className="text-gray-500 text-sm">Rincian transaksi yang memiliki potongan harga.</p>
            </div>

            <ReportFilterBar filters={filters} locations={locations} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <ReportMetric 
                    label="Total Transaksi Diskon" 
                    value={report.count} 
                    color="text-gray-900"
                    subtext="Jumlah struk dengan diskon"
                />
                <ReportMetric 
                    label="Total Nilai Diskon Diberikan" 
                    value={formatRp(report.total_discount)} 
                    color="text-amber-500"
                    prefix="-"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-800">Daftar Transaksi</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No. TRX & Waktu</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Toko & Kasir</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Catatan Diskon</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Diskon</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Akhir</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {report.transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada transaksi dengan diskon pada periode ini.
                                    </td>
                                </tr>
                            ) : (
                                report.transactions.map((trx) => (
                                    <tr key={trx.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{trx.transaction_number}</div>
                                            <div className="text-xs text-gray-500">{formatDate(trx.created_at)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{trx.location_name}</div>
                                            <div className="text-xs text-gray-500">{trx.cashier_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                trx.type === 'offline' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {trx.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {trx.discount_note || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                            {formatRp(trx.subtotal)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-amber-500">
                                            -{formatRp(trx.discount_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                            {formatRp(trx.total)}
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
