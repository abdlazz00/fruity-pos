import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';

const statusConfig = {
    in_progress: { label: 'Sedang Berjalan', variant: 'info' },
    submitted:   { label: 'Menunggu Approval', variant: 'warning' },
    approved:    { label: 'Selesai', variant: 'success' },
};

export default function OpnameShow({ opname }) {
    const { auth } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';
    const isInProgress = opname.status === 'in_progress';
    const isSubmitted = opname.status === 'submitted';
    const isApproved = opname.status === 'approved';

    const [counts, setCounts] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ isOpen: false, action: '', title: '', message: '' });

    const cfg = statusConfig[opname.status] || { label: opname.status, variant: 'default' };

    // Initialize counts from opname items
    useEffect(() => {
        if (opname.items) {
            setCounts(opname.items.map(item => ({
                item_id: item.id,
                product_name: item.product?.name || '-',
                system_quantity: parseFloat(item.system_quantity),
                physical_quantity: item.physical_quantity !== null ? parseFloat(item.physical_quantity) : "",
            })));
        }
    }, [opname]);

    const handleQtyChange = (index, value) => {
        const newCounts = [...counts];
        newCounts[index].physical_quantity = value === "" ? "" : parseFloat(value);
        setCounts(newCounts);
    };

    const getDifference = (systemQty, physicalQty) => {
        if (physicalQty === "") return null;
        return physicalQty - systemQty;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const formatRp = (value) => {
        if (!value) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const handleSaveCounts = () => {
        setProcessing(true);
        router.put(`/inventory/opname/${opname.id}/counts`, {
            counts: counts.map(c => ({
                item_id: c.item_id,
                physical_quantity: c.physical_quantity,
            })),
        }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const handleSubmit = () => {
        setConfirmAction({
            isOpen: true, action: 'submit',
            title: 'Submit Opname',
            message: `Apakah Anda yakin ingin submit opname ${opname.opname_number} ke Owner untuk approval? Pastikan semua hitungan fisik sudah benar.`,
        });
    };

    const handleApprove = () => {
        setConfirmAction({
            isOpen: true, action: 'approve',
            title: 'Approve & Adjust Stok',
            message: `Apakah Anda yakin ingin menyetujui opname ${opname.opname_number}? Stok akan disesuaikan ke jumlah fisik yang dilaporkan.`,
        });
    };

    const executeAction = () => {
        setProcessing(true);
        setConfirmAction({ ...confirmAction, isOpen: false });
        router.patch(`/inventory/opname/${opname.id}/${confirmAction.action}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout
            title="Detail Opname"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Stock Opname', url: '/inventory/opname' },
                { label: 'Detail' },
            ]}
        >
            <Head title={`Detail Opname: ${opname.opname_number}`} />

            <div className="space-y-6 max-w-5xl">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-semibold text-[#1C1C1C] font-mono">
                                {opname.opname_number}
                            </h1>
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </div>
                        <p className="text-text-secondary text-sm">
                            {opname.location?.name} • Dilaksanakan oleh {opname.conductor?.name || '-'} pada {formatDate(opname.opname_date)}
                        </p>
                        {isApproved && opname.approver && (
                            <p className="text-sm text-[#16A34A] mt-1">
                                ✅ Disetujui oleh {opname.approver.name} pada {formatDate(opname.approved_at)}
                            </p>
                        )}
                    </div>

                    <div className="flex space-x-2">
                        <Link href="/inventory/opname">
                            <Button variant="ghost">Kembali</Button>
                        </Link>

                        {isInProgress && (
                            <>
                                <Button variant="secondary" onClick={handleSaveCounts} disabled={processing}>
                                    💾 Simpan Hitungan
                                </Button>
                                <Button variant="primary" onClick={handleSubmit} disabled={processing}>
                                    📤 Submit ke Owner
                                </Button>
                            </>
                        )}

                        {isSubmitted && isOwner && (
                            <Button variant="primary" onClick={handleApprove} disabled={processing}>
                                ✅ Approve & Adjust Stok
                            </Button>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-[#1C1C1C]">
                            {isInProgress ? 'Input Hitungan Fisik' : 'Hasil Opname'}
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary text-white text-[12px] uppercase">
                                    <th className="px-4 py-3 font-medium">Produk</th>
                                    <th className="px-4 py-3 font-medium text-right">Stok Sistem</th>
                                    <th className="px-4 py-3 font-medium text-center">Jumlah Fisik</th>
                                    <th className="px-4 py-3 font-medium text-right">Selisih</th>
                                    {isOwner && <th className="px-4 py-3 font-medium text-right">Nilai Penyusutan</th>}
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-border">
                                {counts.map((item, index) => {
                                    const diff = getDifference(item.system_quantity, item.physical_quantity);
                                    const isNegative = diff < 0;
                                    const isPositive = diff > 0;
                                    const opnameItem = opname.items?.find(i => i.id === item.item_id);

                                    return (
                                        <tr key={item.item_id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-50`}>
                                            <td className="px-4 py-3 font-medium">{item.product_name}</td>
                                            <td className="px-4 py-3 text-right text-text-secondary font-mono">
                                                {item.system_quantity.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {isInProgress ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className="w-24 border border-border rounded px-2 py-1.5 text-sm text-center focus:border-accent focus:ring-1 focus:ring-accent/20"
                                                        value={item.physical_quantity}
                                                        onChange={e => handleQtyChange(index, e.target.value)}
                                                    />
                                                ) : (
                                                    <span className="font-mono">{item.physical_quantity !== "" ? item.physical_quantity.toFixed(2) : '-'}</span>
                                                )}
                                            </td>
                                            <td className={`px-4 py-3 text-right font-bold font-mono ${
                                                isNegative ? 'text-[#DC2626]' : isPositive ? 'text-[#16A34A]' : 'text-text-secondary'
                                            }`}>
                                                {diff !== null ? (isPositive ? '+' : '') + diff.toFixed(2) : '-'}
                                            </td>
                                            {isOwner && (
                                                <td className="px-4 py-3 text-right font-medium text-[#DC2626]">
                                                    {opnameItem?.shrinkage_value ? formatRp(opnameItem.shrinkage_value) : '-'}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    {(isSubmitted || isApproved) && (
                        <div className="border-t border-border p-4 bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-6">
                                <div>
                                    <span className="text-xs text-text-muted">Total Item</span>
                                    <span className="block text-sm font-bold">{counts.length}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-text-muted">Item Selisih</span>
                                    <span className="block text-sm font-bold text-[#DC2626]">
                                        {counts.filter(c => getDifference(c.system_quantity, c.physical_quantity) !== 0 && getDifference(c.system_quantity, c.physical_quantity) !== null).length}
                                    </span>
                                </div>
                            </div>
                            {isOwner && opname.total_shrinkage_value && (
                                <div className="text-right">
                                    <span className="text-sm text-text-secondary uppercase font-semibold">Total Penyusutan</span>
                                    <span className="block text-xl font-bold text-[#DC2626]">{formatRp(opname.total_shrinkage_value)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Modal */}
            <Modal
                isOpen={confirmAction.isOpen}
                onClose={() => setConfirmAction({ ...confirmAction, isOpen: false })}
                title={confirmAction.title}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setConfirmAction({ ...confirmAction, isOpen: false })}>Batal</Button>
                        <Button variant="primary" onClick={executeAction}>Ya, Lanjutkan</Button>
                    </>
                }
            >
                <p>{confirmAction.message}</p>
            </Modal>
        </AppLayout>
    );
}
