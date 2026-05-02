import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { formatRupiah } from '@/utils/currency';
import { calculateMarginActual, getMarginColor } from '@/utils/pricing';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';

export default function Show({ price, avgCostBreakdown }) {
    const { flash } = usePage().props;

    // Determine highest avg_cost to highlight
    const maxAvgCost = avgCostBreakdown && avgCostBreakdown.length > 0 
        ? Math.max(...avgCostBreakdown.map(b => parseFloat(b.avg_cost))) 
        : parseFloat(price.hpp_baseline || 0);

    // States for Kalkulator
    const [margin, setMargin] = useState(parseFloat(price.margin_percentage) || 0);
    const [rounding, setRounding] = useState(price.rounding_to || 0);
    const [previewPrice, setPreviewPrice] = useState(parseFloat(price.selling_price) || 0);
    const [isCalculating, setIsCalculating] = useState(false);

    // States for Tiers
    const [tiers, setTiers] = useState(price.tiers || []);

    // States for Modals
    const [lockModalOpen, setLockModalOpen] = useState(false);
    const [unlockModalOpen, setUnlockModalOpen] = useState(false);

    // Toast logic
    const [toastMessage, setToastMessage] = useState(null);
    useEffect(() => {
        if (flash?.status) {
            setToastMessage(flash.status);
            setTimeout(() => setToastMessage(null), 5000);
        }
    }, [flash]);

    // Debounce preview API call
    useEffect(() => {
        const fetchPreview = async () => {
            setIsCalculating(true);
            try {
                const response = await axios.post('/api/pricing/preview', {
                    product_id: price.product_id,
                    margin_percentage: margin,
                    rounding_to: rounding
                });
                setPreviewPrice(parseFloat(response.data.selling_price));
            } catch (error) {
                console.error("Failed to fetch preview", error);
            } finally {
                setIsCalculating(false);
            }
        };

        const timer = setTimeout(() => {
            fetchPreview();
        }, 400);

        return () => clearTimeout(timer);
    }, [margin, rounding, price.product_id]);

    const handleSaveMargin = () => {
        router.put(`/pricing/${price.id}`, {
            margin_percentage: margin,
            rounding_to: rounding
        }, { preserveScroll: true });
    };

    const handleAddTier = () => {
        setTiers([...tiers, { label: '', min_qty: 1, selling_price: previewPrice }]);
    };

    const handleTierChange = (index, field, value) => {
        const newTiers = [...tiers];
        newTiers[index][field] = value;
        setTiers(newTiers);
    };

    const handleRemoveTier = (index) => {
        setTiers(tiers.filter((_, i) => i !== index));
    };

    const handleSaveTiers = () => {
        router.put(`/pricing/${price.id}/tiers`, { tiers }, { preserveScroll: true });
    };

    const handleLock = () => {
        router.patch(`/pricing/${price.id}/lock`, {}, {
            onSuccess: () => setLockModalOpen(false)
        });
    };

    const handleUnlock = () => {
        router.patch(`/pricing/${price.id}/unlock`, {}, {
            onSuccess: () => setUnlockModalOpen(false)
        });
    };

    const getStatusBadge = (status) => {
        if (status === 'locked') return <Badge variant="success">Locked</Badge>;
        if (status === 'pending') return <Badge variant="warning">Pending</Badge>;
        return <Badge variant="default">{status}</Badge>;
    };

    return (
        <AppLayout>
            <Head title={`Detail Pricing - ${price?.product?.name || 'Produk'}`} />
            
            <div className="flex flex-col space-y-6 max-w-6xl mx-auto pb-10 relative">
                
                {/* Toast Notification */}
                {toastMessage && (
                    <div className="fixed bottom-6 right-6 bg-white border-l-4 border-l-green-500 shadow-lg rounded-lg px-4 py-3 z-50 animate-in slide-in-from-bottom-5">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium text-gray-800">{toastMessage}</span>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2 text-sm text-text-secondary mb-3">
                            <Link href="/pricing" className="hover:text-primary transition-colors cursor-pointer">Pricing Engine</Link>
                            <span>/</span>
                            <span className="text-text-primary font-medium">{price?.product?.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-semibold text-text-primary">{price?.product?.name}</h1>
                            {getStatusBadge(price.status)}
                        </div>
                        <p className="text-sm text-text-secondary mt-1 font-mono">{price?.product?.sku}</p>
                    </div>
                    {/* Action buttons */}
                    <div className="flex space-x-3">
                        {price.status === 'locked' ? (
                            <Button variant="danger" onClick={() => setUnlockModalOpen(true)}>
                                <span className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                    <span>Buka Kunci (Unlock)</span>
                                </span>
                            </Button>
                        ) : (
                            <Button variant="primary" onClick={() => setLockModalOpen(true)}>
                                <span className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Kunci Harga & Rilis ke POS</span>
                                </span>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Main Kalkulator) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Section B: Margin Calculator & Rounding */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm relative">
                            {price.status === 'locked' && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <div className="bg-white/90 border border-gray-200 px-4 py-2 rounded-lg shadow-sm text-sm text-gray-700 font-medium flex items-center space-x-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        <span>Unlock harga untuk mengubah margin.</span>
                                    </div>
                                </div>
                            )}

                            <div className="px-6 py-4 border-b border-gray-200 bg-[#F9FAFB] flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-semibold text-text-primary">Kalkulator Harga Jual</h2>
                                    <p className="text-xs text-text-secondary mt-0.5">Atur margin dan pembulatan untuk menentukan harga final sebelum di-lock.</p>
                                </div>
                                <Button variant="primary" onClick={handleSaveMargin} className="!py-1.5 !px-4 !text-xs shadow-sm">Simpan Margin</Button>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {/* HPP Baseline */}
                                    <div className="bg-[#F9FAFB] rounded-xl p-5 border border-gray-200 flex flex-col justify-center">
                                        <div className="text-[13px] text-text-secondary mb-1">HPP Baseline (Max)</div>
                                        <div className="text-2xl font-bold text-text-primary">{formatRupiah(price.hpp_baseline)}</div>
                                    </div>
                                    
                                    {/* Margin Input */}
                                    <div className="bg-[#F0FDF4] rounded-xl p-5 border border-green-200 flex flex-col justify-center relative shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[13px] font-medium text-green-800">Target Margin (%)</label>
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={margin}
                                                onChange={(e) => setMargin(e.target.value)}
                                                className="w-full text-2xl font-bold text-green-700 bg-white border border-green-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                step="1"
                                                min="0"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-700 font-bold">%</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" max="100" 
                                            value={margin} 
                                            onChange={(e) => setMargin(e.target.value)}
                                            className="w-full mt-4 accent-green-600"
                                        />
                                    </div>

                                    {/* Preview Harga Jual */}
                                    <div className="bg-[#FFFBEB] rounded-xl p-5 border border-yellow-300 flex flex-col justify-center relative overflow-hidden shadow-sm">
                                        <div className="text-[13px] font-medium text-yellow-800 mb-1">Harga Jual Final</div>
                                        <div className={`text-2xl font-bold text-yellow-900 transition-opacity ${isCalculating ? 'opacity-30' : 'opacity-100'}`}>
                                            {formatRupiah(previewPrice)}
                                        </div>
                                        {isCalculating && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-yellow-50/50">
                                                <svg className="animate-spin h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* HPPRounder */}
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <label className="block text-sm font-medium text-text-primary mb-3">Pembulatan Harga (Opsional)</label>
                                    <div className="flex flex-wrap gap-3">
                                        {[0, 100, 500, 1000].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setRounding(val)}
                                                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                                                    rounding == val 
                                                    ? 'bg-primary border-primary text-white shadow-sm' 
                                                    : 'bg-white border-gray-200 text-text-secondary hover:bg-[#F9FAFB] hover:text-text-primary'
                                                }`}
                                            >
                                                {val === 0 ? 'Tanpa Pembulatan' : `Ke atas Rp ${val}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section C: TierManager */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm relative">
                            {price.status === 'locked' && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                </div>
                            )}
                            
                            <div className="px-6 py-4 border-b border-gray-200 bg-[#F9FAFB] flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-semibold text-text-primary">Multi-Tier Pricing (Grosir)</h2>
                                    <p className="text-xs text-text-secondary mt-0.5">Konfigurasi diskon harga untuk pembelian dalam jumlah besar.</p>
                                </div>
                                <Button variant="primary" onClick={handleSaveTiers} className="!py-1.5 !px-4 !text-xs shadow-sm">Simpan Tiers</Button>
                            </div>

                            <div className="p-6">
                                {tiers.length > 0 ? (
                                    <div className="space-y-4">
                                        {tiers.map((tier, index) => (
                                            <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <div className="w-full md:w-1/3">
                                                    <label className="text-[11px] font-medium text-text-secondary uppercase mb-1 block">Label (Misal: Grosir)</label>
                                                    <input 
                                                        type="text" 
                                                        value={tier.label}
                                                        onChange={(e) => handleTierChange(index, 'label', e.target.value)}
                                                        className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                                        placeholder="Grosir / Reseller"
                                                    />
                                                </div>
                                                <div className="w-full md:w-1/4">
                                                    <label className="text-[11px] font-medium text-text-secondary uppercase mb-1 block">Min. Qty</label>
                                                    <input 
                                                        type="number" 
                                                        value={tier.min_qty}
                                                        onChange={(e) => handleTierChange(index, 'min_qty', e.target.value)}
                                                        className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                                        min="1"
                                                    />
                                                </div>
                                                <div className="w-full md:w-1/3">
                                                    <label className="text-[11px] font-medium text-text-secondary uppercase mb-1 block">Harga Spesial</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                                                        <input 
                                                            type="number" 
                                                            value={tier.selling_price}
                                                            onChange={(e) => handleTierChange(index, 'selling_price', e.target.value)}
                                                            className="w-full pl-8 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-auto mt-4 md:mt-0 flex justify-end">
                                                    <button onClick={() => handleRemoveTier(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors mt-2" title="Hapus Tier">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-sm text-text-secondary border-2 border-dashed border-gray-200 rounded-lg">
                                        Belum ada multi-tier pricing. Harga berlaku sama (ecer) untuk semua kuantitas.
                                    </div>
                                )}
                                
                                <button 
                                    onClick={handleAddTier}
                                    className="mt-4 w-full py-2.5 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:border-primary hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Tambah Tier Harga</span>
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Data HPP & Margin) */}
                    <div className="space-y-6">
                        
                        {/* Section A: Tabel HPP per Toko */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="px-5 py-4 border-b border-gray-200 bg-[#F9FAFB]">
                                <h3 className="text-[15px] font-semibold text-text-primary">Komparasi HPP per Toko</h3>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#1A3636] text-white text-[11px] uppercase">
                                        <tr>
                                            <th className="px-4 py-2.5 font-medium">Toko</th>
                                            <th className="px-4 py-2.5 font-medium text-center">Stok</th>
                                            <th className="px-4 py-2.5 font-medium text-right">Avg Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {avgCostBreakdown && avgCostBreakdown.length > 0 ? (
                                            avgCostBreakdown.map((breakdown, idx) => {
                                                const isMax = parseFloat(breakdown.avg_cost) === maxAvgCost;
                                                return (
                                                    <tr key={idx} className={isMax ? 'bg-[#FEF2F2]' : 'bg-white'}>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-[13px] text-text-primary">{breakdown.location_name}</div>
                                                            <div className="text-[11px] text-text-secondary mt-0.5">{breakdown.location_code}</div>
                                                            {isMax && <Badge variant="danger" className="mt-1.5 !text-[9px] px-1.5 py-0">TERTINGGI</Badge>}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-[13px] text-text-secondary">{parseFloat(breakdown.quantity)}</td>
                                                        <td className="px-4 py-3 text-right font-medium text-[13px] text-text-primary">
                                                            {formatRupiah(breakdown.avg_cost)}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-4 py-6 text-center text-xs text-text-secondary">Belum ada data Inbound di toko manapun.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-[#F3F4F6] border-t-2 border-gray-200">
                                        <tr>
                                            <td colSpan="2" className="px-4 py-3 text-right text-[12px] font-medium text-text-secondary">HPP Baseline:</td>
                                            <td className="px-4 py-3 text-right font-bold text-[14px] text-text-primary">{formatRupiah(price.hpp_baseline)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Section D: Margin Aktual per Toko */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="px-5 py-4 border-b border-gray-200 bg-[#F9FAFB]">
                                <h3 className="text-[15px] font-semibold text-text-primary">Preview Margin Aktual</h3>
                                <p className="text-[11px] text-text-secondary mt-1">Margin yang didapat per toko dengan harga jual {formatRupiah(previewPrice)}</p>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left text-sm">
                                    <tbody className="divide-y divide-gray-100">
                                        {avgCostBreakdown && avgCostBreakdown.length > 0 ? (
                                            avgCostBreakdown.map((breakdown, idx) => {
                                                const actualMargin = calculateMarginActual(previewPrice, breakdown.avg_cost);
                                                const colorClass = getMarginColor(actualMargin);
                                                
                                                return (
                                                    <tr key={idx} className="bg-white hover:bg-[#F9FAFB] transition-colors">
                                                        <td className="px-4 py-3.5">
                                                            <span className="font-medium text-[13px] text-text-primary">{breakdown.location_name}</span>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-right">
                                                            <span className={`font-bold text-[14px] ${colorClass}`}>
                                                                {actualMargin}%
                                                            </span>
                                                            <div className="text-[10px] text-text-secondary mt-0.5">
                                                                Laba: {formatRupiah(previewPrice - breakdown.avg_cost)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td className="px-4 py-6 text-center text-xs text-text-secondary">Data margin belum tersedia.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Modal Lock */}
            <Modal
                isOpen={lockModalOpen}
                onClose={() => setLockModalOpen(false)}
                title="Kunci Harga & Rilis?"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setLockModalOpen(false)}>Batal</Button>
                        <Button variant="primary" onClick={handleLock}>Ya, Kunci Harga</Button>
                    </>
                }
            >
                <div className="flex items-start space-x-3 text-text-primary">
                    <div className="p-2 bg-green-100 text-green-600 rounded-full mt-0.5">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <div>
                        <p className="font-medium text-[15px] mb-1">Apakah Anda yakin ingin mengunci harga <strong>{price?.product?.name}</strong> sebesar <strong>{formatRupiah(previewPrice)}</strong>?</p>
                        <p className="text-text-secondary">Dengan melakukan penguncian ini, margin tidak lagi bisa diubah, dan produk akan <strong>langsung tersedia di katalog POS kasir seluruh toko</strong>.</p>
                    </div>
                </div>
            </Modal>

            {/* Modal Unlock */}
            <Modal
                isOpen={unlockModalOpen}
                onClose={() => setUnlockModalOpen(false)}
                title="Buka Kunci Harga?"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setUnlockModalOpen(false)}>Batal</Button>
                        <Button variant="danger" onClick={handleUnlock}>Ya, Buka Kunci</Button>
                    </>
                }
            >
                <div className="flex items-start space-x-3 text-text-primary">
                    <div className="p-2 bg-red-100 text-red-600 rounded-full mt-0.5">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <div>
                        <p className="font-medium text-[15px] mb-1">Peringatan: Tarik produk dari Kasir!</p>
                        <p className="text-text-secondary">Membuka kunci (unlock) akan memungkinkan Anda mengedit margin kembali. Namun, produk ini <strong>akan ditarik dan dihapus dari POS kasir</strong> sampai Anda menguncinya kembali.</p>
                    </div>
                </div>
            </Modal>

        </AppLayout>
    );
}
