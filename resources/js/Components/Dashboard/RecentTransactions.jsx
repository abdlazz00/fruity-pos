import React from 'react';
import { Link } from '@inertiajs/react';

export default function RecentTransactions({ transactions }) {
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);
    };

    if (!transactions || transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <p>Belum ada transaksi</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
                <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            tx.type === 'offline' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                            {tx.type === 'offline' ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11.2M9 20a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{tx.transaction_number}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                    tx.type === 'offline' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                                }`}>
                                    {tx.type}
                                </span>
                                <span className="text-xs text-gray-500">{tx.location_name}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <p className="font-bold text-gray-900">{formatRupiah(tx.total)}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(tx.created_at)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
