import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Lock, Unlock, Plus, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR',
        minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
}

function calculateMarginActual(sellingPrice, avgCost) {
    if (avgCost <= 0) return 0;
    return ((sellingPrice - avgCost) / avgCost * 100).toFixed(2);
}

// ─── Margin Calculator (S5-F03 + S5-F04) ───
function MarginCalculator({ price, productId, onSaved }) {
    const [margin, setMargin] = useState(parseFloat(price?.margin_percentage || 0));
    const [rounding, setRounding] = useState(price?.rounding_to || 0);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchPreview = useCallback(async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const res = await fetch('/api/pricing/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ product_id: productId, margin_percentage: margin, rounding_to: rounding })
            });
            const data = await res.json();
            setPreview(data);
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [productId, margin, rounding]);

    useEffect(() => {
        const timer = setTimeout(fetchPreview, 400);
        return () => clearTimeout(timer);
    }, [fetchPreview]);

    const handleSave = () => {
        setSaving(true);
        const method = price?.id ? 'put' : 'post';
        const url = price?.id ? `/pricing/${price.id}` : '/pricing';
        router[method](url, {
            product_id: productId,
            margin_percentage: margin,
            rounding_to: rounding,
        }, {
            preserveScroll: true,
            onSuccess: () => { setSaving(false); onSaved?.(); },
            onError: () => setSaving(false),
        });
    };

    const baseline = preview?.hpp_baseline ?? parseFloat(price?.hpp_baseline || 0);
    const marginAmount = baseline * margin / 100;
    const subtotal = baseline + marginAmount;
    const finalPrice = preview?.selling_price ?? parseFloat(price?.selling_price || 0);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-base font-bold text-slate-800">Kalkulator Margin</h2>
                <p className="text-xs text-slate-500 mt-0.5">Atur margin dan pembulatan untuk menentukan harga jual.</p>
            </div>
            <div className="p-6 space-y-5">
                {/* 3 Calculator Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">HPP Baseline</div>
                        <div className="text-2xl font-bold text-slate-800 mt-2">{formatRupiah(baseline)}</div>
                        <div className="text-[11px] text-slate-400 mt-1">MAX avg_cost semua toko</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                        <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Margin (%)</div>
                        <div className="mt-2 flex items-center justify-center gap-3">
                            <input
                                type="range"
                                min="0" max="100" step="0.5"
                                value={margin}
                                onChange={e => setMargin(parseFloat(e.target.value))}
                                className="w-24 accent-[#2C6E49]"
                            />
                            <input
                                type="number"
                                min="0" max="999" step="0.5"
                                value={margin}
                                onChange={e => setMargin(parseFloat(e.target.value) || 0)}
                                className="w-20 text-center text-lg font-bold text-emerald-700 border border-emerald-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none"
                            />
                        </div>
                        <div className="text-xs text-emerald-600 mt-2 font-medium">+ {formatRupiah(marginAmount)}</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                        <div className="text-xs font-medium text-amber-600 uppercase tracking-wider">Harga Jual</div>
                        <div className={`text-2xl font-bold mt-2 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'} text-amber-700`}>
                            {formatRupiah(finalPrice)}
                        </div>
                        <div className="text-[11px] text-amber-500 mt-1">Setelah pembulatan</div>
                    </div>
                </div>

                {/* Rounding + Breakdown */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="flex-1">
                        <label className="block text-[13px] text-[#6B7280] mb-1.5 font-medium">Pembulatan ke atas</label>
                        <select
                            value={rounding}
                            onChange={e => setRounding(parseInt(e.target.value))}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-slate-700"
                        >
                            <option value="0">Tidak ada</option>
                            <option value="100">Rp 100</option>
                            <option value="500">Rp 500</option>
                            <option value="1000">Rp 1.000</option>
                        </select>
                    </div>
                    <div className="flex-1 text-sm text-slate-500 space-y-1">
                        <div className="flex justify-between"><span>HPP Baseline</span><span className="font-mono">{formatRupiah(baseline)}</span></div>
                        <div className="flex justify-between"><span>Margin ({margin}%)</span><span className="font-mono text-emerald-600">+ {formatRupiah(marginAmount)}</span></div>
                        <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{formatRupiah(subtotal)}</span></div>
                        {rounding > 0 && (
                            <div className="flex justify-between text-amber-600"><span>Pembulatan ({formatRupiah(rounding)})</span><span className="font-mono font-bold">{formatRupiah(finalPrice)}</span></div>
                        )}
                    </div>
                </div>

                <div className="pt-2">
                    <Button variant="primary" onClick={handleSave} disabled={saving || baseline <= 0} className="w-full sm:w-auto">
                        {saving ? 'Menyimpan...' : 'Simpan Harga'}
                    </Button>
                    {baseline <= 0 && (
                        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Produk belum memiliki data HPP. Lakukan Inbound terlebih dahulu.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Tier Manager (S5-F05) ───
function TierManager({ priceId, tiers: initialTiers }) {
    const [tiers, setTiers] = useState(initialTiers || []);
    const [saving, setSaving] = useState(false);

    const addTier = () => {
        setTiers([...tiers, { label: '', min_qty: 1, selling_price: 0 }]);
    };

    const removeTier = (idx) => {
        setTiers(tiers.filter((_, i) => i !== idx));
    };

    const updateTier = (idx, field, value) => {
        setTiers(tiers.map((t, i) => i === idx ? { ...t, [field]: value } : t));
    };

    const handleSave = () => {
        setSaving(true);
        router.put(`/pricing/${priceId}/tiers`, { tiers }, {
            preserveScroll: true,
            onSuccess: () => setSaving(false),
            onError: () => setSaving(false),
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h2 className="text-base font-bold text-slate-800">Multi-Tier Pricing</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Atur harga grosir atau reseller berdasarkan kuantitas minimum.</p>
                </div>
                <button onClick={addTier} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2C6E49] hover:text-[#245A3D] transition-colors">
                    <Plus className="w-4 h-4" /> Tambah Tier
                </button>
            </div>
            <div className="p-6">
                {tiers.length > 0 ? (
                    <div className="space-y-3">
                        {tiers.map((tier, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <input
                                    type="text" placeholder="Label (cth: Grosir)"
                                    value={tier.label}
                                    onChange={e => updateTier(idx, 'label', e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                />
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-500 whitespace-nowrap">Min Qty:</span>
                                    <input
                                        type="number" min="1"
                                        value={tier.min_qty}
                                        onChange={e => updateTier(idx, 'min_qty', parseInt(e.target.value) || 1)}
                                        className="w-20 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-500 whitespace-nowrap">Harga:</span>
                                    <input
                                        type="number" min="0"
                                        value={tier.selling_price}
                                        onChange={e => updateTier(idx, 'selling_price', parseFloat(e.target.value) || 0)}
                                        className="w-28 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <button onClick={() => removeTier(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <Button variant="primary" onClick={handleSave} disabled={saving} className="mt-2">
                            {saving ? 'Menyimpan...' : 'Simpan Tier'}
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <p className="text-sm">Belum ada tier harga. Klik "Tambah Tier" untuk memulai.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


export default function PricingShow({ price, avgCostBreakdown }) {
    const { flash } = usePage().props;
    const [confirmModal, setConfirmModal] = useState({ open: false, action: '' });

    const product = price?.product;
    const sellingPrice = parseFloat(price?.selling_price || 0);
    const maxAvgCost = Math.max(...(avgCostBreakdown || []).map(b => parseFloat(b.avg_cost || 0)), 0);

    const handleLockUnlock = () => {
        const action = confirmModal.action;
        router.patch(`/pricing/${price.id}/${action}`, {}, {
            preserveScroll: true,
            onSuccess: () => setConfirmModal({ open: false, action: '' }),
        });
    };

    const breadcrumbs = [
        { label: 'Home', url: '/dashboard' },
        { label: 'Pricing Engine', url: '/pricing' },
        { label: product?.name || 'Detail' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pricing - ${product?.name || ''} - FruityPOS`} />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Back Link + Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50">
                    <div className="flex items-start gap-4">
                        <a href="/pricing" className="mt-1 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </a>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-800">{product?.name}</h1>
                                <Badge variant={price?.status === 'locked' ? 'success' : 'warning'}>
                                    {price?.status === 'locked' ? 'Locked' : 'Pending'}
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-500 mt-1 font-mono">{product?.sku} · {product?.category?.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {price?.status === 'pending' ? (
                            <Button
                                variant="primary"
                                onClick={() => setConfirmModal({ open: true, action: 'lock' })}
                                disabled={sellingPrice <= 0}
                            >
                                <Lock className="w-4 h-4 mr-1.5" /> Kunci Harga
                            </Button>
                        ) : (
                            <Button
                                variant="danger"
                                onClick={() => setConfirmModal({ open: true, action: 'unlock' })}
                            >
                                <Unlock className="w-4 h-4 mr-1.5" /> Buka Kunci
                            </Button>
                        )}
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

                {/* Section A: HPP per Toko Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-base font-bold text-slate-800">HPP per Toko</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Perbandingan rata-rata biaya (avg_cost) di setiap toko cabang.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-[#1A3636] text-white">
                                    <th className="py-3.5 px-6 font-semibold text-xs uppercase tracking-wider">Toko</th>
                                    <th className="py-3.5 px-6 font-semibold text-xs uppercase tracking-wider text-center">Kode</th>
                                    <th className="py-3.5 px-6 font-semibold text-xs uppercase tracking-wider text-right">Stok</th>
                                    <th className="py-3.5 px-6 font-semibold text-xs uppercase tracking-wider text-right">HPP (Avg Cost)</th>
                                    <th className="py-3.5 px-6 font-semibold text-xs uppercase tracking-wider text-center">Margin Aktual</th>
                                    <th className="py-3.5 px-6 font-semibold text-xs uppercase tracking-wider text-center">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/80">
                                {(avgCostBreakdown || []).length > 0 ? avgCostBreakdown.map((loc, idx) => {
                                    const avgCost = parseFloat(loc.avg_cost);
                                    const isHighest = avgCost === maxAvgCost && maxAvgCost > 0;
                                    const actualMargin = sellingPrice > 0 ? calculateMarginActual(sellingPrice, avgCost) : 0;
                                    const marginColor = actualMargin >= 20 ? 'text-emerald-600' : actualMargin >= 10 ? 'text-amber-500' : 'text-red-500';

                                    return (
                                        <tr key={idx} className={isHighest ? 'bg-[#FEF2F2]' : idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}>
                                            <td className="py-3.5 px-6 font-medium text-slate-800">{loc.location_name}</td>
                                            <td className="py-3.5 px-6 text-center font-mono text-slate-500">{loc.location_code}</td>
                                            <td className="py-3.5 px-6 text-right font-mono text-slate-700">{parseFloat(loc.quantity).toLocaleString('id-ID')}</td>
                                            <td className="py-3.5 px-6 text-right font-mono font-semibold text-slate-800">{formatRupiah(avgCost)}</td>
                                            <td className="py-3.5 px-6 text-center">
                                                {sellingPrice > 0 && (
                                                    <span className={`font-bold ${marginColor}`}>{actualMargin}%</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-6 text-center">
                                                {isHighest && <Badge variant="danger">TERTINGGI</Badge>}
                                                {!isHighest && actualMargin >= 20 && <Badge variant="success">Di atas target</Badge>}
                                                {!isHighest && actualMargin > 0 && actualMargin < 20 && <Badge variant="warning">Di bawah target</Badge>}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                                            Belum ada data inventori. Lakukan Inbound untuk memulai.
                                        </td>
                                    </tr>
                                )}
                                {/* Footer: Baseline */}
                                {maxAvgCost > 0 && (
                                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                                        <td colSpan="3" className="py-3.5 px-6 font-bold text-slate-700 text-right">HPP Baseline (Tertinggi)</td>
                                        <td className="py-3.5 px-6 text-right font-mono font-bold text-lg text-[#1A3636]">{formatRupiah(maxAvgCost)}</td>
                                        <td colSpan="2"></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section B: Margin Calculator */}
                <MarginCalculator price={price} productId={product?.id} />

                {/* Section C: Tier Manager */}
                {price?.id && (
                    <TierManager priceId={price.id} tiers={price.tiers || []} />
                )}
            </div>

            {/* Lock/Unlock Modal */}
            <Modal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, action: '' })}
                title={confirmModal.action === 'lock' ? 'Kunci Harga Produk' : 'Buka Kunci Harga'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setConfirmModal({ open: false, action: '' })}>Batal</Button>
                        <Button variant={confirmModal.action === 'lock' ? 'primary' : 'danger'} onClick={handleLockUnlock}>
                            {confirmModal.action === 'lock' ? 'Ya, Kunci Harga' : 'Ya, Buka Kunci'}
                        </Button>
                    </>
                }
            >
                {confirmModal.action === 'lock' ? (
                    <div className="space-y-3">
                        <p>Apakah Anda yakin ingin mengunci harga <strong>{product?.name}</strong> sebesar <strong className="text-[#2C6E49]">{formatRupiah(sellingPrice)}</strong>?</p>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700">
                            Produk akan langsung tersedia di POS semua toko.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p>Apakah Anda yakin ingin membuka kunci harga <strong>{product?.name}</strong>?</p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                            ⚠️ Produk akan dihapus dari POS dan tidak bisa dijual sampai di-lock kembali.
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
