import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';

export default function Show({ purchaseOrder }) {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, action: null, message: '', title: '' });

    const handleActionClick = (action) => {
        let message = '';
        let title = '';

        if (action === 'confirm') {
            title = 'Konfirmasi PO';
            message = 'Apakah Anda yakin ingin mengkonfirmasi PO ini? PO yang dikonfirmasi tidak dapat diedit lagi.';
        }
        if (action === 'cancel') {
            title = 'Batalkan PO';
            message = 'Apakah Anda yakin ingin membatalkan PO ini?';
        }
        if (action === 'delete') {
            title = 'Hapus PO';
            message = 'Apakah Anda yakin ingin menghapus PO ini secara permanen?';
        }

        setModalConfig({ isOpen: true, action, message, title });
    };

    const executeAction = () => {
        const { action } = modalConfig;
        let method = 'patch';
        let url = `/procurement/purchase-orders/${purchaseOrder.id}/${action}`;

        if (action === 'delete') {
            method = 'delete';
            url = `/procurement/purchase-orders/${purchaseOrder.id}`;
        }

        setModalConfig({ ...modalConfig, isOpen: false });
        router[method](url, {}, { preserveScroll: true });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft': return <Badge variant="default">Draft</Badge>;
            case 'confirmed': return <Badge variant="info">Dikonfirmasi</Badge>;
            case 'partially_received': return <Badge variant="warning">Sebagian Diterima</Badge>;
            case 'completed': return <Badge variant="success">Selesai</Badge>;
            case 'cancelled': return <Badge variant="danger">Dibatalkan</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const totalEstimasi = purchaseOrder.items.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity_ordered) * parseFloat(item.estimated_price || 0));
    }, 0);

    return (
        <AppLayout
            title="Detail Purchase Order"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Purchase Order', url: '/procurement/purchase-orders' },
                { label: 'Detail PO' },
            ]}
        >
            <Head title={`Detail PO: ${purchaseOrder.po_number}`} />

            <div className="space-y-6 max-w-5xl">
                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-semibold text-[#1C1C1C] font-mono">
                                {purchaseOrder.po_number}
                            </h1>
                            {getStatusBadge(purchaseOrder.status)}
                        </div>
                        <p className="text-text-secondary text-sm">
                            Dibuat oleh {purchaseOrder.creator?.name || 'Sistem'} pada {purchaseOrder.created_at ? new Date(purchaseOrder.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </p>
                    </div>

                    <div className="flex space-x-2">
                        <Link href="/procurement/purchase-orders">
                            <Button variant="ghost">Kembali</Button>
                        </Link>
                        
                        {purchaseOrder.status === 'draft' && (
                            <>
                                <Link href={`/procurement/purchase-orders/${purchaseOrder.id}/edit`}>
                                    <Button variant="secondary">Edit Draft</Button>
                                </Link>
                                <Button 
                                    variant="danger" 
                                    onClick={() => handleActionClick('cancel')}
                                >
                                    Batalkan
                                </Button>
                                <Button 
                                    variant="primary" 
                                    onClick={() => handleActionClick('confirm')}
                                >
                                    Konfirmasi PO
                                </Button>
                                <button
                                    onClick={() => handleActionClick('delete')}
                                    className="p-2 text-text-muted hover:text-danger rounded-lg hover:bg-red-50 transition-colors"
                                    title="Hapus PO"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* General Info Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl border border-border p-5">
                            <h2 className="text-sm font-bold text-text-secondary uppercase mb-4">Informasi Dokumen</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Supplier</span>
                                    <span className="block text-sm font-medium text-[#1C1C1C]">{purchaseOrder.supplier?.name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Tanggal Order</span>
                                    <span className="block text-sm font-medium text-[#1C1C1C]">{purchaseOrder.order_date}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Lokasi Penerimaan</span>
                                    <span className="block text-sm font-medium text-[#1C1C1C]">{purchaseOrder.location?.name} ({purchaseOrder.location?.code})</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Catatan Tambahan</span>
                                    <p className="text-sm text-[#1C1C1C] bg-gray-50 p-2 rounded border border-border min-h-[60px]">
                                        {purchaseOrder.notes || <span className="text-text-muted italic">Tidak ada catatan</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items List Card */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl border border-border overflow-hidden flex flex-col h-full">
                            <div className="p-4 border-b border-border">
                                <h2 className="text-lg font-semibold text-[#1C1C1C]">Item Pesanan</h2>
                            </div>
                            
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-primary text-white text-[12px] uppercase">
                                            <th className="px-4 py-3 font-medium">Produk</th>
                                            <th className="px-4 py-3 font-medium">Satuan</th>
                                            <th className="px-4 py-3 font-medium text-right">Qty</th>
                                            <th className="px-4 py-3 font-medium text-right">Estimasi Satuan</th>
                                            <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-border">
                                        {purchaseOrder.items.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-text-secondary">
                                                    Tidak ada item dalam PO ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            purchaseOrder.items.map((item, index) => {
                                                const subtotal = parseFloat(item.quantity_ordered) * parseFloat(item.estimated_price || 0);
                                                return (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                        <td className="px-4 py-3 font-medium">{item.product?.name} <span className="text-xs text-text-muted block">{item.product?.sku}</span></td>
                                                        <td className="px-4 py-3">{item.product_unit?.unit_name}</td>
                                                        <td className="px-4 py-3 text-right">{parseFloat(item.quantity_ordered)}</td>
                                                        <td className="px-4 py-3 text-right text-text-secondary">{item.estimated_price ? formatRp(item.estimated_price) : '-'}</td>
                                                        <td className="px-4 py-3 text-right font-medium">{formatRp(subtotal)}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="bg-gray-50 border-t border-border p-4 flex justify-between items-center">
                                <span className="text-sm font-semibold text-text-secondary uppercase">Total Estimasi Keseluruhan</span>
                                <span className="text-xl font-bold text-accent">{formatRp(totalEstimasi)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Modal 
                isOpen={modalConfig.isOpen} 
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>Batal</Button>
                        <Button 
                            variant={modalConfig.action === 'confirm' ? 'primary' : 'danger'} 
                            onClick={executeAction}
                        >
                            {modalConfig.action === 'confirm' ? 'Ya, Konfirmasi' : modalConfig.action === 'cancel' ? 'Ya, Batalkan' : 'Ya, Hapus'}
                        </Button>
                    </>
                }
            >
                <p>{modalConfig.message}</p>
            </Modal>
        </AppLayout>
    );
}
