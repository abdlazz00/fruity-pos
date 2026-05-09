import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import StatusBadge from '../../Components/Inventory/StatusBadge';

const REASON_LABELS = {
    rotten: 'Busuk',
    damaged: 'Rusak Fisik',
    expired: 'Kadaluarsa',
    failed_qc: 'Gagal QC',
};

export default function WasteShow({ waste }) {
    const { auth } = usePage().props;
    const isOwner = auth.user.role === 'owner';
    
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApprove = () => {
        if (!confirm('Apakah Anda yakin ingin menyetujui laporan waste ini? Stok akan otomatis dipotong.')) return;
        setIsProcessing(true);
        router.patch(`/inventory/waste/${waste.id}/approve`, {}, {
            onFinish: () => setIsProcessing(false)
        });
    };

    const handleReject = (e) => {
        e.preventDefault();
        if (!rejectionReason.trim()) {
            alert('Alasan penolakan wajib diisi.');
            return;
        }
        setIsProcessing(true);
        router.patch(`/inventory/waste/${waste.id}/reject`, { rejection_reason: rejectionReason }, {
            onFinish: () => {
                setIsProcessing(false);
                setIsRejectModalOpen(false);
            }
        });
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    const totalHpp = waste.items?.reduce((sum, item) => sum + parseFloat(item.hpp_value || 0), 0) || 0;

    return (
        <AppLayout title={`Waste ${waste.request_number}`} breadcrumbs={[
            { label: 'Inventori' }, 
            { label: 'Waste / Rusak', url: '/inventory/waste' },
            { label: waste.request_number }
        ]}>
            <Head title={`Waste ${waste.request_number}`} />

            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/inventory/waste" className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{waste.request_number}</h1>
                                <StatusBadge status={waste.status} />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Diajukan pada {new Date(waste.created_at).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    {isOwner && waste.status === 'pending' && (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsRejectModalOpen(true)}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                ❌ Tolak
                            </button>
                            <button 
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                ✅ Setujui (Potong Stok)
                            </button>
                        </div>
                    )}
                </div>

                {waste.status === 'rejected' && waste.rejection_reason && (
                    <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <div>
                            <h3 className="text-sm font-bold text-red-800">Ditolak oleh Owner</h3>
                            <p className="text-sm text-red-700 mt-1">{waste.rejection_reason}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {waste.items?.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                                <div className="w-full md:w-48 h-48 bg-gray-100 shrink-0 border-r border-gray-100">
                                    {item.photo_path ? (
                                        <a href={`/storage/${item.photo_path}`} target="_blank" rel="noopener noreferrer" className="block w-full h-full group relative">
                                            <img src={`/storage/${item.photo_path}`} alt="Bukti" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{item.product?.name}</h3>
                                            <p className="text-xs text-gray-500">{item.product?.sku}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                                            {REASON_LABELS[item.reason] || item.reason}
                                        </span>
                                    </div>
                                    
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Kuantitas Rusak</p>
                                            <p className="font-bold text-gray-900 text-xl">{parseFloat(item.quantity)} <span className="text-sm font-normal text-gray-500">kg</span></p>
                                        </div>
                                        
                                        {/* Security Rule: HPP is ONLY for owner */}
                                        {isOwner && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Nilai Kerugian (HPP)</p>
                                                <p className="font-bold text-red-600 text-xl">{formatCurrency(item.hpp_value)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Informasi Pengaju</h2>
                            
                            <ul className="space-y-4">
                                <li>
                                    <p className="text-xs text-gray-500 mb-1">Lokasi Toko</p>
                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        {waste.location?.name}
                                    </p>
                                </li>
                                <li>
                                    <p className="text-xs text-gray-500 mb-1">Dibuat Oleh</p>
                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        {waste.requester?.name}
                                    </p>
                                </li>
                                {waste.approver && (
                                    <li className="pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Disetujui/Ditolak Oleh</p>
                                        <p className="font-medium text-gray-900">{waste.approver.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">Pada {new Date(waste.approved_at || waste.updated_at).toLocaleString('id-ID')}</p>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Security Rule: Total HPP is ONLY for owner */}
                        {isOwner && (
                            <div className="bg-red-50 rounded-xl border border-red-200 p-5">
                                <h2 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-2">Total Kerugian</h2>
                                <p className="text-3xl font-black text-red-600 tracking-tight">{formatCurrency(totalHpp)}</p>
                                <p className="text-xs text-red-500 mt-2">Dihitung berdasarkan WAC (Weighted Average Cost) saat waste diajukan.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                            <h3 className="text-lg font-bold text-red-600">Tolak Waste Request</h3>
                            <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleReject} className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Alasan Penolakan <span className="text-red-500">*</span></label>
                            <textarea
                                required
                                rows="3"
                                className="w-full form-input mb-2"
                                placeholder="Misal: Foto kurang jelas, jumlah tidak wajar..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            ></textarea>
                            <p className="text-xs text-gray-500 mb-6">Alasan ini akan dibaca oleh Stockist yang mengajukan.</p>
                            
                            <div className="flex gap-3 justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setIsRejectModalOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isProcessing || !rejectionReason.trim()}
                                    className="px-6 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    {isProcessing ? 'Memproses...' : 'Tolak Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
