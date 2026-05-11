import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReportFilterBar from '@/Components/Reports/ReportFilterBar';
import ReportMetric from '@/Components/Reports/ReportMetric';

export default function ProfitLoss({ report, locations, filters }) {
    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    return (
        <AppLayout 
            title="Laporan Laba Rugi"
            breadcrumbs={[
                { label: 'Dashboard', url: '/dashboard' },
                { label: 'Laporan' },
                { label: 'Laba Rugi' },
            ]}
        >
            <Head title="Laba Rugi" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Laporan Laba Rugi</h1>
                <p className="text-gray-500 text-sm">Ringkasan pendapatan, pengeluaran, dan laba operasional.</p>
            </div>

            <ReportFilterBar 
                filters={filters} 
                locations={locations} 
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                <ReportMetric 
                    label="Pendapatan" 
                    value={formatRp(report.revenue)} 
                    color="text-emerald-600"
                />
                <ReportMetric 
                    label="HPP (COGS)" 
                    value={formatRp(report.cogs)} 
                    color="text-amber-600"
                    prefix="-"
                />
                <ReportMetric 
                    label="Laba Kotor" 
                    value={formatRp(report.gross_profit)} 
                    color="text-emerald-500"
                />
                <ReportMetric 
                    label="Total Diskon" 
                    value={formatRp(report.discount)} 
                    color="text-amber-500"
                    prefix="-"
                />
                <ReportMetric 
                    label="Beban Ongkir" 
                    value={formatRp(report.shipping_cost)} 
                    color="text-red-500"
                    prefix="-"
                />
                <ReportMetric 
                    label="Nilai Waste" 
                    value={formatRp(report.waste_value)} 
                    color="text-red-600"
                    prefix="-"
                />
                <ReportMetric 
                    label="Laba Bersih" 
                    value={formatRp(report.net_profit)} 
                    color="text-blue-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* P&L Breakdown Card */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800">Rincian Laba Rugi</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Revenue line */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="font-medium text-gray-700">Pendapatan Kotor (Revenue)</span>
                                <span className="font-bold text-gray-900">{formatRp(report.revenue)}</span>
                            </div>
                            
                            {/* COGS line */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Dikurangi: Harga Pokok Penjualan (COGS)</span>
                                <span className="text-amber-600">-{formatRp(report.cogs)}</span>
                            </div>
                            
                            {/* Gross Profit */}
                            <div className="flex justify-between items-center py-3 border-b-2 border-gray-200 bg-gray-50 px-3 -mx-3 rounded">
                                <span className="font-bold text-gray-800">Laba Kotor</span>
                                <span className="font-bold text-emerald-600">{formatRp(report.gross_profit)}</span>
                            </div>

                            {/* Deductions */}
                            <div className="pt-2">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Beban Operasional & Pengurangan</span>
                                
                                <div className="flex justify-between items-center py-2 mt-2 border-b border-gray-100">
                                    <span className="text-gray-600 pl-4">Diskon Diberikan</span>
                                    <span className="text-amber-500">-{formatRp(report.discount)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 pl-4">Beban Ongkos Kirim (Subsidi/Inbound)</span>
                                    <span className="text-red-500">-{formatRp(report.shipping_cost)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 pl-4">Nilai Barang Rusak/Waste (HPP)</span>
                                    <span className="text-red-600">-{formatRp(report.waste_value)}</span>
                                </div>
                            </div>

                            {/* Net Profit */}
                            <div className="flex justify-between items-center py-4 mt-4 border-t-2 border-blue-200 bg-blue-50 px-4 -mx-4">
                                <span className="text-lg font-bold text-gray-900">Laba Operasional (Net Profit)</span>
                                <span className="text-xl font-black text-blue-700">{formatRp(report.net_profit)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Stats Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800">Statistik Kinerja</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Margin Laba Operasional</p>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-black text-gray-900">
                                    {report.margin_percentage}%
                                </span>
                                {report.margin_percentage > 30 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mb-1">Sangat Baik</span>
                                ) : report.margin_percentage > 15 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">Normal</span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-1">Perlu Perhatian</span>
                                )}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                <div 
                                    className={`h-2 rounded-full ${report.margin_percentage > 30 ? 'bg-emerald-500' : report.margin_percentage > 15 ? 'bg-blue-500' : 'bg-red-500'}`} 
                                    style={{ width: `${Math.min(Math.max(report.margin_percentage, 0), 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Total Transaksi</p>
                            <span className="text-2xl font-bold text-gray-900">
                                {report.total_transactions} <span className="text-sm font-normal text-gray-500">struk</span>
                            </span>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Rata-rata Nilai Transaksi</p>
                            <span className="text-2xl font-bold text-gray-900">
                                {formatRp(report.total_transactions > 0 ? report.revenue / report.total_transactions : 0)}
                            </span>
                        </div>

                        {report.mutation_loss_qty > 0 && (
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Kehilangan saat Mutasi (Loss Qty)</p>
                                <span className="text-xl font-bold text-amber-600">
                                    {report.mutation_loss_qty} <span className="text-sm font-normal text-gray-500">unit/kg</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
