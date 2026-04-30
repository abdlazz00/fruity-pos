import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';

export default function Show({ inbound }) {
    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <AppLayout
            title="Detail Barang Masuk"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Barang Masuk', url: '/procurement/inbounds' },
                { label: 'Detail Inbound' },
            ]}
        >
            <Head title={`Detail Inbound: ${inbound.inbound_number}`} />

            <div className="space-y-6 max-w-5xl">
                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-semibold text-[#1C1C1C] font-mono">
                                {inbound.inbound_number}
                            </h1>
                        </div>
                        <p className="text-text-secondary text-sm">
                            Diterima oleh {inbound.receiver?.name || 'Sistem'} pada {inbound.received_date ? new Date(inbound.received_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </p>
                    </div>

                    <div className="flex space-x-2">
                        <Link href="/procurement/inbounds">
                            <Button variant="ghost">Kembali</Button>
                        </Link>
                        <Link href={`/procurement/purchase-orders/${inbound.purchase_order?.id}`}>
                            <Button variant="secondary">Lihat PO Ref</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* General Info Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl border border-border p-5">
                            <h2 className="text-sm font-bold text-text-secondary uppercase mb-4">Informasi Dokumen</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">No. Purchase Order</span>
                                    <span className="block text-sm font-medium text-[#1C1C1C] font-mono">{inbound.purchase_order?.po_number}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Supplier</span>
                                    <span className="block text-sm font-medium text-[#1C1C1C]">{inbound.purchase_order?.supplier?.name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Lokasi Penerimaan</span>
                                    <span className="block text-sm font-medium text-[#1C1C1C]">{inbound.location?.name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Biaya Pengiriman (Ongkir)</span>
                                    <span className="block text-sm font-medium text-[#1C1C1C]">{inbound.shipping_cost ? formatRp(inbound.shipping_cost) : 'Rp 0'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-text-muted mb-1">Catatan Penerimaan</span>
                                    <p className="text-sm text-[#1C1C1C] bg-gray-50 p-2 rounded border border-border min-h-[60px]">
                                        {inbound.notes || <span className="text-text-muted italic">Tidak ada catatan</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items List Card */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl border border-border overflow-hidden flex flex-col h-full">
                            <div className="p-4 border-b border-border bg-gray-50/50">
                                <h2 className="text-lg font-semibold text-[#1C1C1C]">Item yang Diterima & HPP Mentah</h2>
                            </div>
                            
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-primary text-white text-[12px] uppercase">
                                            <th className="px-4 py-3 font-medium">Produk</th>
                                            <th className="px-4 py-3 font-medium text-right">Qty Diterima</th>
                                            <th className="px-4 py-3 font-medium text-right">Total Beli</th>
                                            <th className="px-4 py-3 font-medium text-right">Isi/Unit</th>
                                            <th className="px-4 py-3 font-medium text-right">HPP Mentah / Base</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-border">
                                        {inbound.items?.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-text-secondary">
                                                    Tidak ada detail item.
                                                </td>
                                            </tr>
                                        ) : (
                                            inbound.items?.map((item, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                    <td className="px-4 py-3">
                                                        <span className="font-medium text-[#1C1C1C] block">{item.product?.name}</span>
                                                        <span className="text-xs text-text-secondary">{item.product_unit?.unit_name}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium">{parseFloat(item.quantity_received)}</td>
                                                    <td className="px-4 py-3 text-right text-text-secondary">{item.total_buy_price ? formatRp(item.total_buy_price) : '-'}</td>
                                                    <td className="px-4 py-3 text-right text-text-secondary">{parseFloat(item.content_per_unit)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="font-bold text-[#16A34A]">{formatRp(item.hpp_raw_calculated)}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
