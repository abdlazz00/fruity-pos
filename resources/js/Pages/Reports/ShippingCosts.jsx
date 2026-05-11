import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReportFilterBar from '@/Components/Reports/ReportFilterBar';
import ReportMetric from '@/Components/Reports/ReportMetric';

export default function ShippingCosts({ report, locations, filters }) {
    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    return (
        <AppLayout 
            title="Laporan Ongkos Kirim"
            breadcrumbs={[
                { label: 'Dashboard', url: '/dashboard' },
                { label: 'Laporan' },
                { label: 'Biaya Ongkir' },
            ]}
        >
            <Head title="Biaya Ongkir" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Laporan Biaya Ongkos Kirim</h1>
                <p className="text-gray-500 text-sm">Rincian beban biaya pengiriman dari transaksi online dan inbound pengadaan.</p>
            </div>

            <ReportFilterBar filters={filters} locations={locations} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <ReportMetric 
                    label="Ongkir Transaksi Online" 
                    value={formatRp(report.transaction_shipping.total)} 
                    color="text-red-500"
                />
                <ReportMetric 
                    label="Ongkir Inbound (Pengadaan)" 
                    value={formatRp(report.inbound_shipping.total)} 
                    color="text-amber-500"
                />
                <ReportMetric 
                    label="Grand Total Beban Ongkir" 
                    value={formatRp(report.grand_total)} 
                    color="text-red-600"
                    prefix="-"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tabel Transaksi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-bold text-gray-800">Beban Ongkir dari Penjualan Online</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Toko</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah Pesanan</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Beban Ongkir</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {report.transaction_shipping.details.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-6 text-center text-gray-500">Tidak ada data.</td></tr>
                                ) : (
                                    report.transaction_shipping.details.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.location_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{row.order_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium text-right">{formatRp(row.total_shipping)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabel Inbound */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-bold text-gray-800">Beban Ongkir dari Inbound (Supplier)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Toko Penerima</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah Inbound</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Beban Ongkir</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {report.inbound_shipping.details.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-6 text-center text-gray-500">Tidak ada data.</td></tr>
                                ) : (
                                    report.inbound_shipping.details.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.location_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{row.inbound_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-500 font-medium text-right">{formatRp(row.total_shipping)}</td>
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
