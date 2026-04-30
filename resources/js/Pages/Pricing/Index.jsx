import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Tag, Lock, Unlock, Search, ShieldCheck, AlertCircle, ArrowRight, Package } from 'lucide-react';
import Badge from '@/Components/Badge';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR',
        minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
}

export default function PricingIndex({ prices, unpricedProducts, locations }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null, action: '', name: '', price: 0 });

    const tabs = [
        { key: 'all', label: 'Semua' },
        { key: 'pending', label: 'Pending' },
        { key: 'locked', label: 'Locked' },
    ];

    const filteredPrices = (prices?.data || []).filter(p => {
        const matchTab = activeTab === 'all' || p.status === activeTab;
        const matchSearch = search === '' ||
            p.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.product?.sku?.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const totalPriced = prices?.data?.length || 0;
    const totalLocked = (prices?.data || []).filter(p => p.status === 'locked').length;
    const totalPending = (prices?.data || []).filter(p => p.status === 'pending').length;
    const totalUnpriced = unpricedProducts?.length || 0;

    const handleLockUnlock = () => {
        const { id, action } = confirmModal;
        router.patch(`/pricing/${id}/${action}`, {}, {
            preserveScroll: true,
            onSuccess: () => setConfirmModal({ open: false, id: null, action: '', name: '', price: 0 }),
        });
    };

    const breadcrumbs = [
        { label: 'Home', url: '/dashboard' },
        { label: 'Pricing Engine' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pricing Engine - FruityPOS" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Pricing Engine</h1>
                        <p className="text-sm text-slate-500 mt-1">Kelola margin keuntungan, harga jual, dan kunci harga produk untuk POS.</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Tag className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Total Diset</div>
                            <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalPriced}</div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Locked</div>
                            <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalLocked}</div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Pending</div>
                            <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalPending}</div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Belum Diset</div>
                            <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalUnpriced}</div>
                        </div>
                    </div>
                </div>

                {/* Flash */}
                {flash?.status && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium">{flash.status}</p>
                    </div>
                )}

                {/* Main Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden">
                    {/* Filter bar */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="flex gap-1.5">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                                        activeTab === tab.key
                                            ? 'bg-[#1A3636] text-white'
                                            : 'bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F3F4F6]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari produk atau SKU..."
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-[#1A3636] text-white">
                                    <th className="py-3.5 px-6 font-semibold text-xs uppercase tracking-wider">Produk</th>
                                    <th className="py-3.5 px-6 font-semibold text-xs uppercase tracking-wider text-right">HPP Baseline</th>
                                    <th className="py-3.5 px-6 font-semibold text-xs uppercase tracking-wider text-center">Margin</th>
                                    <th className="py-3.5 px-6 font-semibold text-xs uppercase tracking-wider text-right">Harga Jual</th>
                                    <th className="py-3.5 px-6 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                                    <th className="py-3.5 px-6 font-semibold text-xs uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/80">
                                {filteredPrices.length > 0 ? filteredPrices.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className={`group transition-colors ${
                                            item.status === 'pending'
                                                ? 'bg-[#FFFBEB]/40 hover:bg-[#FFFBEB]/70'
                                                : idx % 2 === 0 ? 'bg-white hover:bg-[#F0FDF4]' : 'bg-[#F9FAFB] hover:bg-[#F0FDF4]'
                                        }`}
                                    >
                                        <td className="py-4 px-6">
                                            <div>
                                                <div className="font-bold text-slate-800">{item.product?.name}</div>
                                                <div className="text-xs font-mono text-slate-500 mt-0.5">{item.product?.sku} · {item.product?.category?.name}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right font-mono text-sm text-slate-700">
                                            {formatRupiah(item.hpp_baseline)}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="font-semibold text-[#2C6E49]">{parseFloat(item.margin_percentage).toFixed(1)}%</span>
                                        </td>
                                        <td className="py-4 px-6 text-right font-bold text-slate-800">
                                            {formatRupiah(item.selling_price)}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <Badge variant={item.status === 'locked' ? 'success' : 'warning'}>
                                                {item.status === 'locked' ? 'Locked' : 'Pending'}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/pricing/${item.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                                >
                                                    Detail <ArrowRight className="w-3 h-3" />
                                                </Link>
                                                {item.status === 'pending' ? (
                                                    <button
                                                        onClick={() => setConfirmModal({ open: true, id: item.id, action: 'lock', name: item.product?.name, price: item.selling_price })}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#2C6E49] rounded-lg hover:bg-[#245A3D] transition-colors"
                                                        disabled={parseFloat(item.selling_price) <= 0}
                                                    >
                                                        <Lock className="w-3 h-3" /> Lock
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmModal({ open: true, id: item.id, action: 'unlock', name: item.product?.name, price: item.selling_price })}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
                                                    >
                                                        <Unlock className="w-3 h-3" /> Unlock
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="py-16 text-center">
                                            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500 font-medium">Tidak ada data harga produk ditemukan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {prices?.links && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-sm text-slate-500 font-medium">
                            <div>Menampilkan {filteredPrices.length} dari {prices.total || 0} produk.</div>
                            <div className="flex gap-2">
                                {prices.links.map((link, k) => (
                                    <Link
                                        key={k}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-lg border transition-all ${link.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Unpriced Products Alert */}
                {totalUnpriced > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 border-l-4 border-l-amber-400 overflow-hidden">
                        <div className="p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-800 text-sm">Produk Belum Diset Harga ({totalUnpriced})</h3>
                                <p className="text-xs text-slate-500 mt-1">Produk berikut belum memiliki HPP Baseline. Lakukan Inbound terlebih dahulu, kemudian set harga di halaman detail.</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {unpricedProducts.map(prod => (
                                        <span key={prod.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-full border border-slate-200">
                                            {prod.name}
                                            <span className="text-slate-400 font-mono">{prod.sku}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Lock/Unlock Confirmation Modal */}
            <Modal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, id: null, action: '', name: '', price: 0 })}
                title={confirmModal.action === 'lock' ? 'Kunci Harga Produk' : 'Buka Kunci Harga'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setConfirmModal({ open: false, id: null, action: '', name: '', price: 0 })}>
                            Batal
                        </Button>
                        <Button
                            variant={confirmModal.action === 'lock' ? 'primary' : 'danger'}
                            onClick={handleLockUnlock}
                        >
                            {confirmModal.action === 'lock' ? 'Ya, Kunci Harga' : 'Ya, Buka Kunci'}
                        </Button>
                    </>
                }
            >
                {confirmModal.action === 'lock' ? (
                    <div className="space-y-3">
                        <p>Apakah Anda yakin ingin mengunci harga <strong>{confirmModal.name}</strong> sebesar <strong className="text-[#2C6E49]">{formatRupiah(confirmModal.price)}</strong>?</p>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700">
                            Produk akan langsung tersedia di POS semua toko setelah harga di-lock.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p>Apakah Anda yakin ingin membuka kunci harga <strong>{confirmModal.name}</strong>?</p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                            ⚠️ Produk ini akan dihapus dari POS dan tidak bisa dijual sampai di-lock kembali.
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
