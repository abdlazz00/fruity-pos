import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';

export default function Form({ purchaseOrders }) {
    const { data, setData, post, processing, errors } = useForm({
        purchase_order_id: '',
        received_date: new Date().toISOString().split('T')[0],
        shipping_cost: '',
        notes: '',
        items: []
    });

    const [selectedPO, setSelectedPO] = useState(null);

    // Hitung sisa Qty yang bisa diterima
    const getRemainingQty = (poItem, allInbounds) => {
        let totalReceived = 0;
        if (allInbounds && allInbounds.length > 0) {
            allInbounds.forEach(inbound => {
                inbound.items?.forEach(item => {
                    if (item.product_id === poItem.product_id && item.product_unit_id === poItem.product_unit_id) {
                        totalReceived += parseFloat(item.quantity_received);
                    }
                });
            });
        }
        const remaining = parseFloat(poItem.quantity_ordered) - totalReceived;
        return remaining > 0 ? remaining : 0;
    };

    // Saat PO dipilih, populate items
    useEffect(() => {
        if (data.purchase_order_id) {
            const po = purchaseOrders.find(p => p.id === parseInt(data.purchase_order_id));
            setSelectedPO(po);
            
            if (po && po.items) {
                const initialItems = po.items.map(item => {
                    const maxQty = getRemainingQty(item, po.inbounds);
                    return {
                        po_item_id: item.id,
                        product_id: item.product_id,
                        product_unit_id: item.product_unit_id,
                        product_name: item.product?.name,
                        unit_name: item.product_unit?.unit_name,
                        max_qty: maxQty,
                        quantity_received: maxQty > 0 ? maxQty : '', // Default to remaining qty
                        total_buy_price: '',
                        content_per_unit: 1, // Default 1
                    };
                }).filter(item => item.max_qty > 0); // Hanya tampilkan item yang masih bisa diterima
                
                setData('items', initialItems);
            }
        } else {
            setSelectedPO(null);
            setData('items', []);
        }
    }, [data.purchase_order_id, purchaseOrders]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/procurement/inbounds');
    };

    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <AppLayout
            title="Terima Barang Masuk"
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Barang Masuk', url: '/procurement/inbounds' },
                { label: 'Terima Barang' },
            ]}
        >
            <Head title="Terima Barang Masuk" />

            <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-[#1C1C1C]">Form Penerimaan Barang (Inbound)</h1>
                    <div className="flex space-x-3">
                        <Link href="/procurement/inbounds">
                            <Button variant="ghost">Batal</Button>
                        </Link>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={processing || data.items.length === 0}
                        >
                            Simpan & Proses HPP
                        </Button>
                    </div>
                </div>

                {/* Header Card */}
                <div className="bg-white rounded-xl border border-border p-5">
                    <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Referensi Dokumen</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div>
                            <label className="block text-[13px] text-text-secondary mb-1.5">No. Purchase Order <span className="text-danger">*</span></label>
                            <select 
                                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 ${errors.purchase_order_id ? 'border-danger' : 'border-border focus:border-accent'}`}
                                value={data.purchase_order_id}
                                onChange={e => setData('purchase_order_id', e.target.value)}
                            >
                                <option value="">-- Pilih PO Dikonfirmasi --</option>
                                {purchaseOrders.map(po => (
                                    <option key={po.id} value={po.id}>
                                        {po.po_number} - {po.supplier?.name}
                                    </option>
                                ))}
                            </select>
                            {errors.purchase_order_id && <p className="text-danger text-xs mt-1">{errors.purchase_order_id}</p>}
                        </div>

                        <div>
                            <label className="block text-[13px] text-text-secondary mb-1.5">Tanggal Diterima <span className="text-danger">*</span></label>
                            <input 
                                type="date" 
                                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 ${errors.received_date ? 'border-danger' : 'border-border focus:border-accent'}`}
                                value={data.received_date}
                                onChange={e => setData('received_date', e.target.value)}
                            />
                            {errors.received_date && <p className="text-danger text-xs mt-1">{errors.received_date}</p>}
                        </div>

                        <div>
                            <label className="block text-[13px] text-text-secondary mb-1.5">Biaya Ongkir (Rp)</label>
                            <input 
                                type="number"
                                min="0"
                                placeholder="0"
                                className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                                value={data.shipping_cost}
                                onChange={e => setData('shipping_cost', e.target.value)}
                            />
                            <p className="text-[11px] text-text-muted mt-1 italic">* Ongkir tidak dihitung ke dalam HPP barang.</p>
                            {errors.shipping_cost && <p className="text-danger text-xs mt-1">{errors.shipping_cost}</p>}
                        </div>

                        <div>
                            <label className="block text-[13px] text-text-secondary mb-1.5">Catatan Penerimaan</label>
                            <input 
                                type="text"
                                placeholder="Kondisi barang, kekurangan, dll"
                                className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                            />
                            {errors.notes && <p className="text-danger text-xs mt-1">{errors.notes}</p>}
                        </div>

                    </div>
                </div>

                {/* Items Card */}
                {selectedPO && (
                    <div className="bg-white rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-gray-50/50">
                            <h2 className="text-lg font-semibold text-[#1C1C1C]">Detail Barang Diterima & Kalkulasi HPP</h2>
                            <p className="text-xs text-text-secondary mt-1">Masukkan Harga Beli Total dan Isi per Satuan untuk melihat preview HPP Mentah.</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-primary text-white text-[12px] uppercase">
                                        <th className="px-4 py-3 font-medium w-1/4">Produk</th>
                                        <th className="px-4 py-3 font-medium w-[12%]">Sisa Qty PO</th>
                                        <th className="px-4 py-3 font-medium w-[15%]">Qty Diterima</th>
                                        <th className="px-4 py-3 font-medium w-[18%]">Total Harga Beli (Rp)</th>
                                        <th className="px-4 py-3 font-medium w-[12%]">Isi / Satuan</th>
                                        <th className="px-4 py-3 font-medium text-right">HPP Mentah (Satuan Dasar)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-border">
                                    {data.items.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-text-secondary bg-white">
                                                Semua barang di PO ini sudah diterima penuh.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.items.map((item, index) => {
                                            const qty = parseFloat(item.quantity_received) || 0;
                                            const price = parseFloat(item.total_buy_price) || 0;
                                            const content = parseFloat(item.content_per_unit) || 1;
                                            
                                            // Realtime HPP Calculation: totalBuyPrice / (quantityReceived * contentPerUnit)
                                            const hppRaw = (qty > 0 && content > 0 && price > 0) ? (price / (qty * content)) : 0;
                                            
                                            const isOverQty = qty > item.max_qty;

                                            return (
                                                <tr key={index} className="bg-white hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 align-top">
                                                        <span className="font-medium text-[#1C1C1C] block">{item.product_name}</span>
                                                        <span className="text-xs text-text-secondary">{item.unit_name}</span>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <span className="bg-gray-100 text-text-secondary px-2 py-1 rounded text-xs font-mono">
                                                            Maks: {item.max_qty}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            max={item.max_qty}
                                                            className={`w-full border rounded text-sm p-2 focus:ring-1 ${isOverQty || errors[`items.${index}.quantity_received`] ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border focus:border-accent focus:ring-accent'}`}
                                                            value={item.quantity_received}
                                                            onChange={e => handleItemChange(index, 'quantity_received', e.target.value)}
                                                        />
                                                        {isOverQty && <span className="text-[10px] text-danger mt-1 block">Melebihi sisa PO!</span>}
                                                        {errors[`items.${index}.quantity_received`] && <span className="text-[10px] text-danger mt-1 block">{errors[`items.${index}.quantity_received`]}</span>}
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            min="0"
                                                            className={`w-full border rounded text-sm p-2 focus:ring-1 ${errors[`items.${index}.total_buy_price`] ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border focus:border-accent focus:ring-accent'}`}
                                                            placeholder="Contoh: 500000"
                                                            value={item.total_buy_price}
                                                            onChange={e => handleItemChange(index, 'total_buy_price', e.target.value)}
                                                        />
                                                        {errors[`items.${index}.total_buy_price`] && <span className="text-[10px] text-danger mt-1 block">{errors[`items.${index}.total_buy_price`]}</span>}
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            className={`w-full border rounded text-sm p-2 focus:ring-1 ${errors[`items.${index}.content_per_unit`] ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border focus:border-accent focus:ring-accent'}`}
                                                            placeholder="Isi"
                                                            value={item.content_per_unit}
                                                            onChange={e => handleItemChange(index, 'content_per_unit', e.target.value)}
                                                        />
                                                        {errors[`items.${index}.content_per_unit`] && <span className="text-[10px] text-danger mt-1 block">{errors[`items.${index}.content_per_unit`]}</span>}
                                                    </td>
                                                    <td className="px-4 py-3 align-top text-right">
                                                        <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded p-2 text-[#16A34A]">
                                                            <span className="block text-xs text-[#16A34A]/70 mb-0.5">Preview HPP:</span>
                                                            <span className="font-bold text-lg">{formatRp(hppRaw)}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {errors.items && typeof errors.items === 'string' && (
                    <div className="p-3 bg-danger-bg border-l-4 border-danger text-danger text-sm rounded">
                        {errors.items}
                    </div>
                )}
            </form>
        </AppLayout>
    );
}
