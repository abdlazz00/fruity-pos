import React, { useState, useEffect } from 'react';

export default function ReceiveConfirmation({ isOpen, mutation, onClose, onConfirm }) {
    const [items, setItems] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && mutation?.items) {
            // Inisialisasi state items berdasarkan payload mutasi
            setItems(mutation.items.map(item => ({
                id: item.id,
                product_name: item.product?.name || 'Produk',
                quantity_sent: parseFloat(item.quantity_sent),
                quantity_received: parseFloat(item.quantity_sent), // Default terisi penuh
            })));
        }
    }, [isOpen, mutation]);

    if (!isOpen || !mutation) return null;

    const handleReceivedChange = (id, value) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                // Jangan izinkan nilai negatif atau lebih dari yang dikirim (opsional)
                let val = parseFloat(value);
                if (isNaN(val) || val < 0) val = 0;
                return { ...item, quantity_received: val };
            }
            return item;
        }));
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Map payload sesuai request backend: { items: [ { item_id: X, quantity_received: Y } ] }
        const payload = {
            items: items.map(i => ({
                item_id: i.id,
                quantity_received: i.quantity_received
            }))
        };
        onConfirm(payload);
    };

    const totalLoss = items.reduce((sum, item) => sum + Math.max(0, item.quantity_sent - item.quantity_received), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Konfirmasi Penerimaan Mutasi</h3>
                        <p className="text-sm text-gray-500 mt-1">{mutation.mutation_number}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-lg text-sm mb-6 flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p>Pastikan jumlah fisik yang diterima sesuai. Jika ada kekurangan (hilang/rusak di jalan), sistem akan otomatis mencatatnya sebagai <strong>Loss / Penyusutan</strong>.</p>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-200 text-sm text-gray-500">
                                <th className="pb-2 font-medium w-1/2">Produk</th>
                                <th className="pb-2 font-medium text-right">Dikirim</th>
                                <th className="pb-2 font-medium text-center w-32">Diterima</th>
                                <th className="pb-2 font-medium text-right">Loss</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item) => {
                                const loss = Math.max(0, item.quantity_sent - item.quantity_received);
                                const isLoss = loss > 0;
                                
                                return (
                                    <tr key={item.id}>
                                        <td className="py-3 font-medium text-gray-900">{item.product_name}</td>
                                        <td className="py-3 text-right text-gray-600">{item.quantity_sent}</td>
                                        <td className="py-3 px-2">
                                            <input 
                                                type="number" 
                                                min="0"
                                                max={item.quantity_sent}
                                                step="0.01"
                                                value={item.quantity_received}
                                                onChange={(e) => handleReceivedChange(item.id, e.target.value)}
                                                className={`w-full text-center px-2 py-1.5 border rounded-md focus:ring-2 focus:ring-primary/20 transition-colors ${
                                                    isLoss ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
                                                }`}
                                            />
                                        </td>
                                        <td className={`py-3 text-right font-bold ${isLoss ? 'text-red-600' : 'text-gray-400'}`}>
                                            {loss > 0 ? `-${loss.toFixed(2)}` : '0'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 flex items-center justify-between">
                    <div>
                        {totalLoss > 0 && (
                            <span className="text-red-600 font-medium text-sm flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Terdapat total {totalLoss.toFixed(2)} item loss.
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors flex items-center"
                        >
                            {isSubmitting ? 'Memproses...' : 'Konfirmasi Penerimaan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
