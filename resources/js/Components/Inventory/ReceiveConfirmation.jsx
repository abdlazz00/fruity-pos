import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';

export default function ReceiveConfirmation({ isOpen, onClose, mutation, onConfirm }) {
    const [receivedItems, setReceivedItems] = useState([]);

    useEffect(() => {
        if (isOpen && mutation?.items) {
            setReceivedItems(
                mutation.items.map(item => ({
                    item_id: item.id,
                    product_name: item.product?.name || '-',
                    quantity_sent: parseFloat(item.quantity_sent),
                    quantity_received: parseFloat(item.quantity_sent), // Default = sent qty
                }))
            );
        }
    }, [isOpen, mutation]);

    const handleQtyChange = (index, value) => {
        const newItems = [...receivedItems];
        newItems[index].quantity_received = parseFloat(value) || 0;
        setReceivedItems(newItems);
    };

    const handleSubmit = () => {
        const payload = receivedItems.map(item => ({
            item_id: item.item_id,
            quantity_received: item.quantity_received,
        }));
        onConfirm(payload);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Konfirmasi Penerimaan ${mutation?.mutation_number || ''}`}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Batal</Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Konfirmasi Penerimaan
                    </Button>
                </>
            }
        >
            <div className="space-y-3">
                <p className="text-sm text-text-secondary mb-4">
                    Masukkan jumlah barang yang diterima. Selisih akan tercatat sebagai <strong>Mutation Loss</strong>.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="pb-2 font-medium text-text-secondary">Produk</th>
                                <th className="pb-2 font-medium text-text-secondary text-right">Dikirim</th>
                                <th className="pb-2 font-medium text-text-secondary text-center">Diterima</th>
                                <th className="pb-2 font-medium text-text-secondary text-right">Loss</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {receivedItems.map((item, index) => {
                                const loss = Math.max(0, item.quantity_sent - item.quantity_received);
                                const hasLoss = loss > 0;
                                return (
                                    <tr key={item.item_id}>
                                        <td className="py-2.5 font-medium">{item.product_name}</td>
                                        <td className="py-2.5 text-right text-text-secondary">{item.quantity_sent.toFixed(2)}</td>
                                        <td className="py-2.5 text-center">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={item.quantity_sent}
                                                className="w-20 border border-border rounded px-2 py-1 text-sm text-center focus:border-accent focus:ring-1 focus:ring-accent/20"
                                                value={item.quantity_received}
                                                onChange={e => handleQtyChange(index, e.target.value)}
                                            />
                                        </td>
                                        <td className={`py-2.5 text-right font-bold ${hasLoss ? 'text-[#DC2626]' : 'text-text-secondary'}`}>
                                            {loss.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
}
