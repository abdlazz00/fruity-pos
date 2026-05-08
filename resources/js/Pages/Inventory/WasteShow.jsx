import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';

const statusConfig = {
    pending:  { label: 'Pending',  variant: 'warning' },
    approved: { label: 'Approved', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'danger' },
};

const reasonLabels = {
    rotten: 'Busuk', damaged: 'Rusak Fisik', expired: 'Kadaluarsa', failed_qc: 'Gagal QC',
};

export default function WasteShow({ waste }) {
    const { auth } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [confirmApprove, setConfirmApprove] = useState(false);
    const [processing, setProcessing] = useState(false);

    const cfg = statusConfig[waste.status] || { label: waste.status, variant: 'default' };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const totalHpp = waste.items?.reduce((sum, i) => sum + parseFloat(i.hpp_value || 0), 0) || 0;

    const handleApprove = () => {
        setProcessing(true);
        setConfirmApprove(false);
        router.patch(`/inventory/waste/${waste.id}/approve`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const handleReject = () => {
        setProcessing(true);
        setShowRejectModal(false);
        router.patch(`/inventory/waste/${waste.id}/reject`, {
            rejection_reason: rejectionReason,
        }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout
            title="Detail Waste"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Waste', url: '/inventory/waste' },
                { label: 'Detail' },
            ]}
        >
            <Head title={`Detail Waste: ${waste.request_number}`} />

            <div className="space-y-6 max-w-5xl">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-semibold text-[#1C1C1C] font-mono">
                                {waste.request_number}
                            </h1>
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </div>
                        <p className="text-text-secondary text-sm">
                            Diajukan oleh {waste.requester?.name || '-'} pada {formatDate(waste.created_at)}
                        </p>
                    </div>

                    <div className="flex space-x-2">
                        <Link href="/inventory/waste">
                            <Button variant="ghost">Kembali</Button>
                        </Link>

                        {isOwner && waste.status === 'pending' && (
                            <>
                                <Button variant="danger" onClick={() => setShowRejectModal(true)} disabled={processing}>
                                    ❌ Tolak
                                </Button>
                                <Button variant="primary" onClick={() => setConfirmApprove(true)} disabled={processing}>
                                    ✅ Setujui
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Info + Rejection reason */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl border border-border p-5">
                            <h2 className="text-sm font-bold text-text-secondary uppercase mb-4">Informasi</h2>
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Toko</span>
                                    <span className="block text-sm font-medium text-[#1C1C1C]">{waste.location?.name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Pengaju</span>
                                    <span className="block text-sm font-medium text-[#1C1C1C]">{waste.requester?.name}</span>
                                </div>
                                {waste.approver && (
                                    <div>
                                        <span className="block text-xs text-text-muted mb-1">
                                            {waste.status === 'approved' ? 'Disetujui' : 'Ditolak'} oleh
                                        </span>
                                        <span className="block text-sm font-medium text-[#1C1C1C]">{waste.approver.name}</span>
                                    </div>
                                )}
                                {waste.approved_at && (
                                    <div>
                                        <span className="block text-xs text-text-muted mb-1">Waktu Keputusan</span>
                                        <span className="block text-sm text-[#1C1C1C]">{formatDate(waste.approved_at)}</span>
                                    </div>
                                )}
                                {isOwner && (
                                    <div className="pt-3 border-t border-border">
                                        <span className="block text-xs text-text-muted mb-1">Total Nilai Kerugian</span>
                                        <span className="block text-lg font-bold text-[#DC2626]">{formatRp(totalHpp)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rejection reason */}
                        {waste.status === 'rejected' && waste.rejection_reason && (
                            <div className="bg-red-50 rounded-xl border border-red-200 p-5 mt-4">
                                <h3 className="text-sm font-bold text-[#DC2626] uppercase mb-2">Alasan Penolakan</h3>
                                <p className="text-sm text-[#1C1C1C]">{waste.rejection_reason}</p>
                            </div>
                        )}
                    </div>

                    {/* Items */}
                    <div className="md:col-span-2">
                        <div className="space-y-4">
                            {waste.items?.map((item, index) => (
                                <div key={item.id || index} className="bg-white rounded-xl border border-border p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-[#1C1C1C]">{item.product?.name}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                                                <span>Qty: <strong>{parseFloat(item.quantity).toFixed(2)}</strong></span>
                                                <span>Alasan: <Badge variant={item.reason === 'rotten' || item.reason === 'expired' ? 'warning' : 'danger'}>
                                                    {reasonLabels[item.reason] || item.reason}
                                                </Badge></span>
                                            </div>
                                        </div>
                                        {/* HPP value — Owner only */}
                                        {isOwner && (
                                            <div className="text-right">
                                                <span className="block text-xs text-text-muted">Nilai HPP</span>
                                                <span className="block text-sm font-bold text-[#DC2626]">{formatRp(item.hpp_value)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Photo */}
                                    {item.photo_path && (
                                        <div className="mt-3">
                                            <img
                                                src={`/storage/${item.photo_path}`}
                                                alt={`Bukti waste ${item.product?.name}`}
                                                className="max-w-xs h-48 object-cover rounded-lg border border-border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => window.open(`/storage/${item.photo_path}`, '_blank')}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Approve Confirm Modal */}
            <Modal
                isOpen={confirmApprove}
                onClose={() => setConfirmApprove(false)}
                title="Setujui Waste Request"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setConfirmApprove(false)}>Batal</Button>
                        <Button variant="primary" onClick={handleApprove}>Ya, Setujui</Button>
                    </>
                }
            >
                <p>Apakah Anda yakin ingin menyetujui waste request <strong>{waste.request_number}</strong>?</p>
                <p className="mt-2 text-[#DC2626] font-medium">Stok akan dikurangi sebesar total qty waste.</p>
                {isOwner && (
                    <p className="mt-1 font-bold">Total kerugian: {formatRp(totalHpp)}</p>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Tolak Waste Request"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowRejectModal(false)}>Batal</Button>
                        <Button variant="danger" onClick={handleReject} disabled={!rejectionReason.trim()}>
                            Tolak Request
                        </Button>
                    </>
                }
            >
                <p className="mb-3">Berikan alasan penolakan untuk waste request <strong>{waste.request_number}</strong>:</p>
                <textarea
                    className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    rows={3}
                    placeholder="Alasan penolakan..."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                />
            </Modal>
        </AppLayout>
    );
}
