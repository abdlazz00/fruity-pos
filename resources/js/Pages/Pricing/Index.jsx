import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

export default function Index({ prices, unpricedProducts, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    
    // KPI Data - using data from current page + unpriced
    const totalSet = prices?.total || prices?.meta?.total || (prices?.data ? prices.data.length : 0);
    const totalLocked = prices?.data ? prices.data.filter(p => p.status === 'locked').length : 0;
    const totalPending = prices?.data ? prices.data.filter(p => p.status === 'pending').length : 0;
    const totalUnset = unpricedProducts?.length || 0;

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/pricing', { search, status: filters?.status }, { preserveState: true });
    };

    const handleFilter = (status) => {
        router.get('/pricing', { search, status }, { preserveState: true });
    };

    const getStatusBadge = (status) => {
        if (status === 'locked') return <Badge variant="success">Locked</Badge>;
        if (status === 'pending') return <Badge variant="warning">Pending</Badge>;
        return <Badge variant="default">{status}</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Pricing Engine - Daftar Harga" />
            
            <div className="flex flex-col space-y-6">
                {/* Header & Breadcrumb */}
                <div>
                    <div className="flex items-center space-x-2 text-sm text-text-secondary mb-4">
                        <span className="hover:text-primary transition-colors cursor-pointer">Pricing Engine</span>
                        <span>/</span>
                        <span className="text-text-primary font-medium">Daftar Harga</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-text-primary">Daftar Harga & Margin</h1>
                    <p className="text-sm text-text-secondary mt-1">Kelola harga jual dan kunci margin keuntungan untuk didistribusikan ke POS kasir.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="text-sm text-text-secondary">Total Diset</div>
                        <div className="text-24px font-bold text-text-primary mt-1">{totalSet}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-[#16A34A]">
                        <div className="text-sm text-text-secondary">Locked (Aktif)</div>
                        <div className="text-24px font-bold text-text-primary mt-1">{totalLocked}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-[#EAB308]">
                        <div className="text-sm text-text-secondary">Pending</div>
                        <div className="text-24px font-bold text-text-primary mt-1">{totalPending}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-[#DC2626]">
                        <div className="text-sm text-text-secondary">Belum Diset</div>
                        <div className="text-24px font-bold text-text-primary mt-1">{totalUnset}</div>
                    </div>
                </div>

                {/* Main Content: Pricing List */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => handleFilter('')} className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${!filters?.status ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>Semua</button>
                            <button onClick={() => handleFilter('pending')} className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${filters?.status === 'pending' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>Pending</button>
                            <button onClick={() => handleFilter('locked')} className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${filters?.status === 'locked' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>Locked</button>
                        </div>
                        <form onSubmit={handleSearch} className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Cari produk / SKU..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-sm"
                            />
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary text-white text-[12px] uppercase">
                                    <th className="px-4 py-3 font-medium">Produk</th>
                                    <th className="px-4 py-3 font-medium">HPP Baseline</th>
                                    <th className="px-4 py-3 font-medium text-center">Margin</th>
                                    <th className="px-4 py-3 font-medium text-right">Harga Jual</th>
                                    <th className="px-4 py-3 font-medium text-center">Status</th>
                                    <th className="px-4 py-3 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prices?.data && prices.data.length > 0 ? (
                                    prices.data.map((price, index) => (
                                        <tr key={price.id} className={`border-b border-gray-100 ${price.status === 'pending' ? 'bg-[#FFFBEB] hover:bg-yellow-50' : index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} hover:bg-[#F0FDF4] transition-colors`}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-[13px] text-text-primary">{price.product?.name}</div>
                                                <div className="text-[12px] text-text-secondary font-mono mt-0.5">{price.product?.sku}</div>
                                            </td>
                                            <td className="px-4 py-3 text-[13px]">{formatRupiah(price.hpp_baseline)}</td>
                                            <td className="px-4 py-3 text-[13px] font-semibold text-center text-accent">{parseFloat(price.margin_percentage)}%</td>
                                            <td className="px-4 py-3 text-[13px] font-bold text-right">{formatRupiah(price.selling_price)}</td>
                                            <td className="px-4 py-3 text-center">
                                                {getStatusBadge(price.status)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Link href={`/pricing/${price.id}`}>
                                                    <Button variant="secondary" className="!py-1.5 !px-3 !text-xs">Detail</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-12 text-center text-text-secondary text-sm">
                                            Belum ada harga yang dikonfigurasi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {prices?.links && prices.links.length > 3 && (
                        <div className="p-4 border-t border-gray-200 flex justify-center space-x-1">
                            {prices.links.map((link, i) => (
                                <Link 
                                    key={i} 
                                    href={link.url || '#'} 
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg ${link.active ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Unpriced Products Alert Box */}
                {totalUnset > 0 && (
                    <div className="bg-[#FEF2F2] border-l-4 border-l-[#DC2626] border border-y-[#FEF2F2] border-r-[#FEF2F2] rounded-r-xl p-5 mt-4">
                        <div className="flex items-start space-x-3">
                            <div className="p-2 bg-red-100 rounded-full text-[#DC2626] shrink-0 mt-0.5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[15px] font-semibold text-red-800">Perhatian: {totalUnset} Produk Belum Diset Harga</h3>
                                <p className="text-[13px] text-red-700 mt-1 mb-4 leading-relaxed">Produk-produk di bawah ini baru ditambahkan ke Master Data namun belum pernah di-Inbound sehingga tidak memiliki HPP Baseline. Lakukan penerimaan barang (Inbound) pertama kali agar masuk ke antrean *Pricing Engine*.</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {unpricedProducts.slice(0, 8).map(prod => (
                                        <div key={prod.id} className="bg-white px-3 py-2.5 rounded-lg shadow-sm border border-red-100 flex justify-between items-center">
                                            <div>
                                                <div className="font-medium text-[13px] text-text-primary line-clamp-1">{prod.name}</div>
                                                <div className="text-[11px] text-text-secondary font-mono mt-0.5">{prod.sku}</div>
                                            </div>
                                            <Badge variant="default" className="shrink-0 ml-2">No HPP</Badge>
                                        </div>
                                    ))}
                                </div>
                                {unpricedProducts.length > 8 && (
                                    <div className="mt-3 text-[12px] text-red-700 font-medium">
                                        + {unpricedProducts.length - 8} produk lainnya tersembunyi...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
