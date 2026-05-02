import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

export default function CartItem({ item, updateQty, removeItem }) {
    const [isEditingQty, setIsEditingQty] = useState(false);
    const [tempQty, setTempQty] = useState(item.qty.toString());

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    };

    const handleSaveQty = (e) => {
        e.preventDefault();
        const newQty = parseFloat(tempQty);
        if (newQty > 0) {
            updateQty(item.product_id, newQty);
            setIsEditingQty(false);
        }
    };

    return (
        <div className="flex flex-col py-3 border-b border-gray-100 last:border-0 bg-white">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">{item.name}</h4>
                    <div className="text-xs text-gray-500 mt-0.5">{formatRupiah(item.unit_price)} / unit</div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-gray-900">{formatRupiah(item.subtotal)}</div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-1">
                <div className="flex items-center space-x-1 border border-gray-200 rounded-lg overflow-hidden h-8">
                    <button 
                        onClick={() => updateQty(item.product_id, item.qty - 1)}
                        className="w-8 h-full flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                        disabled={item.qty <= 1}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    
                    <button 
                        onClick={() => {
                            setTempQty(item.qty.toString());
                            setIsEditingQty(true);
                        }}
                        className="w-12 h-full flex items-center justify-center text-sm font-semibold text-gray-900 bg-white hover:bg-gray-50"
                    >
                        {item.qty}
                    </button>

                    <button 
                        onClick={() => updateQty(item.product_id, item.qty + 1)}
                        className="w-8 h-full flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>
                
                <button 
                    onClick={() => removeItem(item.product_id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Hapus item"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Modal Input Gramasi / Qty Custom */}
            <Modal isOpen={isEditingQty} onClose={() => setIsEditingQty(false)} title={`Ubah Kuantitas - ${item.name}`}>
                <form onSubmit={handleSaveQty}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah / Gramasi</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            autoFocus
                            className="block w-full text-center text-3xl font-bold py-4 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
                            value={tempQty}
                            onChange={e => setTempQty(e.target.value)}
                        />
                        <p className="mt-2 text-xs text-gray-500 text-center">Gunakan format desimal untuk gramasi (contoh: 1.5 untuk 1,5 kg)</p>
                    </div>
                    
                    {parseFloat(tempQty) > item.stock && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 border border-red-100">
                            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span>Peringatan: Jumlah melebihi stok yang tersedia ({item.stock}).</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsEditingQty(false)}>Batal</Button>
                        <Button type="submit" variant="primary">Simpan</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
