import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';

export default function Index({ inbounds }) {
    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <AppLayout
            title="Barang Masuk"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Barang Masuk' },
            ]}
        >
            <Head title="Barang Masuk (Inbound)" />

            <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-[#1C1C1C]">Daftar Barang Masuk</h1>
                    <Link href="/procurement/inbounds/create">
                        <Button variant="primary">Terima Barang Masuk</Button>
                    </Link>
                </div>

                <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary text-white uppercase text-xs">
                                    <th className="px-4 py-3 font-medium">No. Inbound</th>
                                    <th className="px-4 py-3 font-medium">No. PO Ref</th>
                                    <th className="px-4 py-3 font-medium">Supplier</th>
                                    <th className="px-4 py-3 font-medium">Tanggal Terima</th>
                                    <th className="px-4 py-3 font-medium">Lokasi</th>
                                    <th className="px-4 py-3 font-medium text-right">Ongkir</th>
                                    <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-border">
                                {inbounds.data.length > 0 ? (
                                    inbounds.data.map((inbound, index) => (
                                        <tr 
                                            key={inbound.id} 
                                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} hover:bg-[#F0FDF4] transition-colors`}
                                        >
                                            <td className="px-4 py-3 font-mono text-text-secondary">{inbound.inbound_number}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{inbound.purchase_order?.po_number}</td>
                                            <td className="px-4 py-3">{inbound.purchase_order?.supplier?.name}</td>
                                            <td className="px-4 py-3">{inbound.received_date}</td>
                                            <td className="px-4 py-3">{inbound.location?.name}</td>
                                            <td className="px-4 py-3 text-right">{inbound.shipping_cost ? formatRp(inbound.shipping_cost) : '-'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/procurement/inbounds/${inbound.id}`}>
                                                    <Button variant="secondary" className="!px-3 !py-1 text-xs">Detail</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-text-secondary">
                                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Belum ada data Barang Masuk
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {inbounds.last_page > 1 && (
                        <div className="p-4 border-t border-border flex justify-between items-center bg-white">
                            <span className="text-sm text-text-secondary">
                                Menampilkan {inbounds.data.length} dari {inbounds.total} data
                            </span>
                            <div className="flex space-x-1">
                                {inbounds.links?.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm rounded ${
                                            link.active 
                                                ? 'bg-primary text-white' 
                                                : 'text-text-secondary hover:bg-gray-100'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
