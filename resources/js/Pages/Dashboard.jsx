import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import KpiCard from '../Components/Dashboard/KpiCard';
import RevenueChart from '../Components/Dashboard/RevenueChart';
import RevenueTrendChart from '../Components/Dashboard/RevenueTrendChart';
import SalesChannelChart from '../Components/Dashboard/SalesChannelChart';
import TopProductsTable from '../Components/Dashboard/TopProductsTable';
import RecentTransactions from '../Components/Dashboard/RecentTransactions';
import LowStockWidget from '../Components/Dashboard/LowStockWidget';

export default function Dashboard({ 
    kpi, 
    revenueByStore, 
    revenueTrend, 
    topProducts, 
    salesByChannel, 
    recentTransactions, 
    locations, 
    filters 
}) {
    const { auth } = usePage().props;
    const user = auth?.user || {};

    const [currentFilters, setCurrentFilters] = useState(filters);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...currentFilters, [key]: value };
        setCurrentFilters(newFilters);
        router.get('/dashboard', newFilters, { preserveState: true, replace: true });
    };

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AppLayout title="Dashboard Executive">
            <Head title="Dashboard" />
            
            {/* Header & Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Executive</h1>
                    <p className="text-gray-500 text-sm">Ringkasan performa dan metrik hari ini.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                    <input 
                        type="date" 
                        className="form-input text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                        value={currentFilters.start_date}
                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    />
                    <div className="flex items-center text-gray-400 px-1">-</div>
                    <input 
                        type="date" 
                        className="form-input text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                        value={currentFilters.end_date}
                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    />
                    <div className="hidden sm:block w-px bg-gray-200 mx-1"></div>
                    <select 
                        className="form-input text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary min-w-[150px]"
                        value={currentFilters.location_id || ''}
                        onChange={(e) => handleFilterChange('location_id', e.target.value)}
                    >
                        <option value="">Semua Toko</option>
                        {locations?.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* KPI Cards (Baris 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <KpiCard 
                    label="Pendapatan" 
                    value={formatRupiah(kpi.revenue)} 
                    colorClass="border-emerald-500 text-emerald-600 bg-emerald-50"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <KpiCard 
                    label="Laba Operasional" 
                    value={formatRupiah(kpi.net_profit)} 
                    colorClass="border-blue-500 text-blue-600 bg-blue-50"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                />
                <KpiCard 
                    label="Total Transaksi" 
                    value={kpi.total_transactions} 
                    colorClass="border-purple-500 text-purple-600 bg-purple-50"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                />
                <KpiCard 
                    label="Waste Pending" 
                    value={kpi.waste_pending} 
                    colorClass="border-amber-500 text-amber-600 bg-amber-50"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                    subtext={kpi.waste_pending > 0 ? "Menunggu Approval" : "Aman"}
                />
                <KpiCard 
                    label="Stok Rendah" 
                    value={kpi.low_stock_count} 
                    colorClass={kpi.low_stock_count > 0 ? "border-red-500 text-red-600 bg-red-50" : "border-gray-300 text-gray-500 bg-gray-50"}
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    subtext={kpi.low_stock_count > 0 ? "Butuh Reorder!" : "Stok Aman"}
                />
            </div>

            {/* KPI Cards (Baris 2 - Rincian Finansial) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Rincian Finansial (Sesuai Filter)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    <div>
                        <p className="text-xs text-gray-500 font-medium">HPP (COGS)</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">{formatRupiah(kpi.cogs)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Laba Kotor</p>
                        <p className="text-lg font-bold text-emerald-600 mt-1">{formatRupiah(kpi.gross_profit)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Total Diskon</p>
                        <p className="text-lg font-bold text-amber-600 mt-1">-{formatRupiah(kpi.discount)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Ongkos Kirim</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">{formatRupiah(kpi.shipping_cost)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Nilai Waste (HPP)</p>
                        <p className="text-lg font-bold text-red-600 mt-1">-{formatRupiah(kpi.waste_value)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Rata-rata / TRX</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">{formatRupiah(kpi.avg_transaction)}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Tren Pendapatan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800">Tren Pendapatan (7 Hari Terakhir)</h2>
                    </div>
                    <div className="p-6 flex-1">
                        <RevenueTrendChart data={revenueTrend} />
                    </div>
                </div>

                {/* Pendapatan per Toko */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800">Pendapatan per Toko</h2>
                    </div>
                    <div className="p-6 flex-1">
                        <RevenueChart data={revenueByStore} />
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom 1 & 2: Produk & Penjualan Channel */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="font-bold text-gray-800">Penjualan per Channel</h2>
                            </div>
                            <div className="p-6">
                                <SalesChannelChart data={salesByChannel} />
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Peringatan Stok Rendah
                                </h2>
                            </div>
                            <div className="overflow-y-auto max-h-[290px]">
                                <LowStockWidget locationId={currentFilters.location_id} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800">Top 5 Produk Terlaris</h2>
                        </div>
                        <TopProductsTable products={topProducts} />
                    </div>
                </div>

                {/* Kolom 3: Transaksi Terakhir */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full max-h-[800px]">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800">Transaksi Terbaru</h2>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <RecentTransactions transactions={recentTransactions} />
                    </div>
                </div>
            </div>

        </AppLayout>
    );
}
