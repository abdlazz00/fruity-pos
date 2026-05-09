import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import StatusBadge from '../../Components/Inventory/StatusBadge';
import ReceiveConfirmation from '../../Components/Inventory/ReceiveConfirmation';

export default function MutationShow({ mutation }) {
    const { auth } = usePage().props;
    const isOwner = auth.user.role === 'owner';
    const locationId = auth.user.location_id; // For Stockist
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Conditional visibilities based on role and status
    const canShip = mutation.status === 'preparing' && (!locationId || locationId === mutation.from_location_id);
    const canReceive = mutation.status === 'shipped' && (!locationId || locationId === mutation.to_location_id);
    const canComplete = mutation.status === 'received' && (isOwner || locationId === mutation.from_location_id || locationId === mutation.to_location_id);

    const handleAction = (action, payload = {}) => {
        if (!confirm(`Apakah Anda yakin ingin melakukan aksi: ${action}?`)) return;
        
        setIsProcessing(true);
        router.patch(`/inventory/mutations/${mutation.id}/${action}`, payload, {
            onFinish: () => {
                setIsProcessing(false);
                setIsReceiveModalOpen(false);
            }
        });
    };

    const handleReceiveConfirm = (payload) => {
        handleAction('receive', payload);
    };

    return (
        <AppLayout title={`Detail Mutasi ${mutation.mutation_number}`} breadcrumbs={[
            { label: 'Inventori' }, 
            { label: 'Mutasi Stok', url: '/inventory/mutations' },
            { label: mutation.mutation_number }
        ]}>
            <Head title={`Mutasi ${mutation.mutation_number}`} />

            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/inventory/mutations" className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{mutation.mutation_number}</h1>
                                <StatusBadge status={mutation.status} />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Dibuat pada {new Date(mutation.created_at).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {canShip && (
                            <button 
                                onClick={() => handleAction('ship')}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                Kirim Mutasi (Ship)
                            </button>
                        )}

                        {canReceive && (
                            <button 
                                onClick={() => setIsReceiveModalOpen(true)}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Terima Mutasi (Receive)
                            </button>
                        )}

                        {canComplete && (
                            <button 
                                onClick={() => handleAction('complete')}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                Selesaikan (Complete)
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Rincian Barang</h2>
                                <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                                    {mutation.items?.length || 0} Item
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-3 font-medium">Produk</th>
                                            <th className="px-6 py-3 font-medium text-right">Dikirim</th>
                                            <th className="px-6 py-3 font-medium text-right">Diterima</th>
                                            <th className="px-6 py-3 font-medium text-right">Loss/Hilang</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {mutation.items?.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/30">
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-900">{item.product?.name}</p>
                                                    <p className="text-xs text-gray-500">{item.product?.sku}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-700">{parseFloat(item.quantity_sent)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    {item.quantity_received !== null ? (
                                                        <span className="font-medium text-emerald-600">{parseFloat(item.quantity_received)}</span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {item.loss_quantity !== null && parseFloat(item.loss_quantity) > 0 ? (
                                                        <span className="font-bold text-red-500">{parseFloat(item.loss_quantity)}</span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {mutation.notes && (
                            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                                <h3 className="text-sm font-bold text-amber-800 mb-1 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Catatan Mutasi
                                </h3>
                                <p className="text-sm text-amber-700">{mutation.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Info & Timeline */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Informasi Rute</h2>
                            
                            <div className="space-y-4 relative">
                                {/* Route visualization */}
                                <div className="absolute left-[15px] top-[24px] bottom-[24px] w-0.5 bg-gray-200"></div>
                                
                                <div className="flex items-start gap-4 relative">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex flex-col items-center justify-center shrink-0 z-10 mt-0.5">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Asal</p>
                                        <p className="font-bold text-gray-900">{mutation.from_location?.name}</p>
                                        <p className="text-sm text-gray-600 mt-1">Oleh: {mutation.creator?.name}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4 relative">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex flex-col items-center justify-center shrink-0 z-10 mt-0.5">
                                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Tujuan</p>
                                        <p className="font-bold text-gray-900">{mutation.to_location?.name}</p>
                                        {mutation.receiver && (
                                            <p className="text-sm text-gray-600 mt-1">Penerima: {mutation.receiver.name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Timeline Status</h2>
                            
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between">
                                    <span className="text-gray-500">Dibuat</span>
                                    <span className="font-medium text-gray-900">{new Date(mutation.created_at).toLocaleString('id-ID')}</span>
                                </li>
                                {mutation.shipped_at && (
                                    <li className="flex justify-between">
                                        <span className="text-gray-500">Dikirim</span>
                                        <span className="font-medium text-gray-900">{new Date(mutation.shipped_at).toLocaleString('id-ID')}</span>
                                    </li>
                                )}
                                {mutation.received_at && (
                                    <li className="flex justify-between pt-2 border-t border-gray-100">
                                        <span className="text-gray-500">Diterima</span>
                                        <span className="font-medium text-gray-900">{new Date(mutation.received_at).toLocaleString('id-ID')}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Receive Modal */}
            <ReceiveConfirmation 
                isOpen={isReceiveModalOpen} 
                mutation={mutation} 
                onClose={() => setIsReceiveModalOpen(false)}
                onConfirm={handleReceiveConfirm}
            />
        </AppLayout>
    );
}
