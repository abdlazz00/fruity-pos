import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';
import ReceiveConfirmation from '@/Components/Inventory/ReceiveConfirmation';

const statusConfig = {
    preparing: { label: 'Preparing', variant: 'warning' },
    shipped:   { label: 'Shipped',   variant: 'info' },
    received:  { label: 'Received',  variant: 'success' },
    completed: { label: 'Completed', variant: 'success' },
};

export default function MutationShow({ mutation }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isOwner = user?.role === 'owner';
    const isFromLocation = user?.location_id === mutation.from_location_id;
    const isToLocation = user?.location_id === mutation.to_location_id;

    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: '', title: '', message: '' });
    const [processing, setProcessing] = useState(false);

    const cfg = statusConfig[mutation.status] || { label: mutation.status, variant: 'default' };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const handleShip = () => {
        setConfirmModal({
            isOpen: true, action: 'ship',
            title: 'Kirim Mutasi',
            message: `Apakah Anda yakin ingin mengirim mutasi ${mutation.mutation_number}? Stok akan dikurangi dari toko asal.`,
        });
    };

    const handleComplete = () => {
        setConfirmModal({
            isOpen: true, action: 'complete',
            title: 'Selesaikan Mutasi',
            message: `Apakah Anda yakin ingin menyelesaikan mutasi ${mutation.mutation_number}?`,
        });
    };

    const executeAction = () => {
        setProcessing(true);
        setConfirmModal({ ...confirmModal, isOpen: false });
        router.patch(`/inventory/mutations/${mutation.id}/${confirmModal.action}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const handleReceiveSubmit = (items) => {
        setProcessing(true);
        setShowReceiveModal(false);
        router.patch(`/inventory/mutations/${mutation.id}/receive`, { items }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    // Total loss calculation
    const totalLoss = mutation.items?.reduce((sum, item) => sum + (parseFloat(item.loss_quantity) || 0), 0) || 0;

    return (
        <AppLayout
            title="Detail Mutasi"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Mutasi Stok', url: '/inventory/mutations' },
                { label: 'Detail' },
            ]}
        >
            <Head title={`Detail Mutasi: ${mutation.mutation_number}`} />

            <div className="space-y-6 max-w-5xl">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-semibold text-[#1C1C1C] font-mono">
                                {mutation.mutation_number}
                            </h1>
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </div>
                        <p className="text-text-secondary text-sm">
                            Dibuat oleh {mutation.creator?.name || '-'} pada {formatDate(mutation.created_at)}
                        </p>
                    </div>

                    <div className="flex space-x-2">
                        <Link href="/inventory/mutations">
                            <Button variant="ghost">Kembali</Button>
                        </Link>

                        {/* Ship button: Stockist at source location, status=preparing */}
                        {mutation.status === 'preparing' && (isFromLocation || isOwner) && (
                            <Button variant="primary" onClick={handleShip} disabled={processing}>
                                📦 Kirim Mutasi
                            </Button>
                        )}

                        {/* Receive button: Stockist at destination location, status=shipped */}
                        {mutation.status === 'shipped' && (isToLocation || isOwner) && (
                            <Button variant="primary" onClick={() => setShowReceiveModal(true)} disabled={processing}>
                                ✅ Terima Mutasi
                            </Button>
                        )}

                        {/* Complete button: status=received */}
                        {mutation.status === 'received' && (
                            <Button variant="primary" onClick={handleComplete} disabled={processing}>
                                🏁 Selesaikan
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Info Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl border border-border p-5">
                            <h2 className="text-sm font-bold text-text-secondary uppercase mb-4">Informasi Mutasi</h2>
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Toko Asal</span>
                                    <span className="block text-sm font-medium text-[#1C1C1C]">
                                        {mutation.from_location?.name} ({mutation.from_location?.code})
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Toko Tujuan</span>
                                    <span className="block text-sm font-medium text-[#1C1C1C]">
                                        {mutation.to_location?.name} ({mutation.to_location?.code})
                                    </span>
                                </div>
                                {mutation.shipped_at && (
                                    <div>
                                        <span className="block text-xs text-text-muted mb-1">Waktu Kirim</span>
                                        <span className="block text-sm text-[#1C1C1C]">{formatDate(mutation.shipped_at)}</span>
                                    </div>
                                )}
                                {mutation.received_at && (
                                    <div>
                                        <span className="block text-xs text-text-muted mb-1">Waktu Diterima</span>
                                        <span className="block text-sm text-[#1C1C1C]">{formatDate(mutation.received_at)}</span>
                                    </div>
                                )}
                                {mutation.receiver && (
                                    <div>
                                        <span className="block text-xs text-text-muted mb-1">Diterima Oleh</span>
                                        <span className="block text-sm font-medium text-[#1C1C1C]">{mutation.receiver.name}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Catatan</span>
                                    <p className="text-sm text-[#1C1C1C] bg-gray-50 p-2 rounded border border-border min-h-[40px]">
                                        {mutation.notes || <span className="text-text-muted italic">Tidak ada catatan</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-xl border border-border p-5">
                            <h2 className="text-sm font-bold text-text-secondary uppercase mb-4">Timeline</h2>
                            <div className="space-y-3">
                                {['preparing', 'shipped', 'received', 'completed'].map((step, idx) => {
                                    const steps = ['preparing', 'shipped', 'received', 'completed'];
                                    const currentIdx = steps.indexOf(mutation.status);
                                    const isActive = idx <= currentIdx;
                                    const labels = { preparing: 'Dibuat', shipped: 'Dikirim', received: 'Diterima', completed: 'Selesai' };
                                    return (
                                        <div key={step} className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full shrink-0 ${isActive ? 'bg-[#2C6E49]' : 'bg-gray-200'}`} />
                                            <span className={`text-sm ${isActive ? 'text-[#1C1C1C] font-medium' : 'text-text-muted'}`}>
                                                {labels[step]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl border border-border overflow-hidden flex flex-col h-full">
                            <div className="p-4 border-b border-border">
                                <h2 className="text-lg font-semibold text-[#1C1C1C]">Daftar Item</h2>
                            </div>

                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-primary text-white text-[12px] uppercase">
                                            <th className="px-4 py-3 font-medium">Produk</th>
                                            <th className="px-4 py-3 font-medium text-right">Qty Kirim</th>
                                            <th className="px-4 py-3 font-medium text-right">Qty Diterima</th>
                                            <th className="px-4 py-3 font-medium text-right">Loss</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-border">
                                        {mutation.items?.map((item, index) => {
                                            const hasLoss = parseFloat(item.loss_quantity) > 0;
                                            return (
                                                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                    <td className="px-4 py-3 font-medium">{item.product?.name}</td>
                                                    <td className="px-4 py-3 text-right">{parseFloat(item.quantity_sent).toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        {item.quantity_received !== null ? parseFloat(item.quantity_received).toFixed(2) : '-'}
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-medium ${hasLoss ? 'text-[#DC2626]' : 'text-text-secondary'}`}>
                                                        {item.loss_quantity !== null ? parseFloat(item.loss_quantity).toFixed(2) : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {totalLoss > 0 && (
                                <div className="bg-red-50 border-t border-border p-4 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-[#DC2626] uppercase">Total Loss</span>
                                    <span className="text-lg font-bold text-[#DC2626]">{totalLoss.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Modal for Ship / Complete */}
            <Modal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                title={confirmModal.title}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>Batal</Button>
                        <Button variant="primary" onClick={executeAction}>Ya, Lanjutkan</Button>
                    </>
                }
            >
                <p>{confirmModal.message}</p>
            </Modal>

            {/* Receive Confirmation Modal */}
            <ReceiveConfirmation
                isOpen={showReceiveModal}
                onClose={() => setShowReceiveModal(false)}
                mutation={mutation}
                onConfirm={handleReceiveSubmit}
            />
        </AppLayout>
    );
}
