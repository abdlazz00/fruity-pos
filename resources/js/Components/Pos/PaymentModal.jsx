import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';

export default function PaymentModal({ isOpen, onClose, total, onConfirm }) {
    const [method, setMethod] = useState('cash');
    const [paymentAmount, setPaymentAmount] = useState('');
    
    // Reset state when modal opens/changes
    useEffect(() => {
        if (isOpen) {
            setMethod('cash');
            setPaymentAmount('');
        }
    }, [isOpen]);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    };

    const numPaymentAmount = parseFloat(paymentAmount) || 0;
    const isCash = method === 'cash';
    
    // For non-cash, exact amount is assumed
    const effectivePayment = isCash ? numPaymentAmount : total;
    const change = isCash ? Math.max(0, effectivePayment - total) : 0;
    const isValid = isCash ? numPaymentAmount >= total : true;

    const quickAmounts = [10000, 20000, 50000, 100000];
    
    // Add exact amount button
    const suggestedAmounts = [total, ...quickAmounts.filter(amt => amt > total)];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isValid) {
            onConfirm({
                payment_method: method,
                payment_amount: effectivePayment
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Selesaikan Pembayaran">
            <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center mb-6">
                <div className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-1">Total Tagihan</div>
                <div className="text-4xl font-black text-secondary">{formatRupiah(total)}</div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Metode Pembayaran</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setMethod('cash')}
                            className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                method === 'cash' 
                                ? 'bg-secondary/10 border-secondary text-secondary shadow-sm ring-1 ring-secondary' 
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm font-medium">Tunai</span>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => setMethod('transfer')}
                            className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                method === 'transfer' 
                                ? 'bg-secondary/10 border-secondary text-secondary shadow-sm ring-1 ring-secondary' 
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                            <span className="text-sm font-medium">Transfer</span>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => setMethod('ewallet')}
                            className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                method === 'ewallet' 
                                ? 'bg-secondary/10 border-secondary text-secondary shadow-sm ring-1 ring-secondary' 
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            <span className="text-sm font-medium">E-Wallet</span>
                        </button>
                    </div>
                </div>

                {isCash ? (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Uang Diterima</label>
                            
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {suggestedAmounts.slice(0, 4).map((amt, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setPaymentAmount(amt.toString())}
                                        className="py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors"
                                    >
                                        {idx === 0 ? 'Uang Pas' : formatRupiah(amt)}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-gray-500 font-medium">Rp</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    min={total}
                                    className="block w-full pl-12 pr-4 py-4 text-2xl font-bold border border-gray-300 rounded-xl focus:ring-secondary focus:border-secondary shadow-inner"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    autoFocus
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center mb-6">
                            <div className="text-sm font-medium text-gray-600">Kembalian</div>
                            <div className={`text-2xl font-bold ${change > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                {formatRupiah(change)}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center mb-6">
                        <svg className="w-10 h-10 text-blue-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-800">
                            Pembayaran non-tunai (Transfer/E-Wallet) akan otomatis disesuaikan dengan total tagihan <strong>{formatRupiah(total)}</strong>.
                            Pastikan pembayaran sudah diterima sebelum menyelesaikan transaksi.
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={onClose} className="w-1/3 py-3 rounded-xl">
                        Batal
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={!isValid}
                        className="w-2/3 py-3 rounded-xl font-bold text-lg"
                    >
                        Selesaikan Transaksi
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
