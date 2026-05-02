import React, { useState, useMemo } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import TransactionResultModal from '../../Components/Pos/TransactionResultModal';

export default function PosOnline({ shift, catalog }) {
    // Form management for Online POS
    const form = useForm({
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        platform: '',
        courier: '',
        shipping_method: '',
        shipping_cost: '',
        items: [],
        discount_amount: '',
        discount_note: '',
        payment_method: 'transfer',
        payment_amount: '',
    });

    const [productSearch, setProductSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const [resultModalState, setResultModalState] = useState({
        isOpen: false,
        status: 'success',
        transaction: null
    });

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    };

    // Filter catalog for autocomplete
    const filteredCatalog = useMemo(() => {
        if (!productSearch.trim()) return catalog.slice(0, 5); // show first 5 if empty
        const lowerQuery = productSearch.toLowerCase();
        return catalog.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) || 
            p.sku.toLowerCase().includes(lowerQuery)
        ).slice(0, 5);
    }, [catalog, productSearch]);

    // Add item to order
    const addItem = (product) => {
        if (!product.in_stock) {
            alert(`Stok tidak mencukupi untuk produk ${product.name}`);
            return;
        }

        const existingItems = [...form.data.items];
        const existingIndex = existingItems.findIndex(i => i.product_id === product.product_id);

        if (existingIndex >= 0) {
            // Update qty
            const item = existingItems[existingIndex];
            const newQty = item.qty + 1;
            
            if (newQty > product.stock) {
                alert(`Stok tidak mencukupi. Tersedia: ${product.stock}`);
                return;
            }

            // Check tier pricing
            let unitPrice = product.selling_price;
            if (product.tiers && product.tiers.length > 0) {
                const applicableTier = [...product.tiers].reverse().find(t => t.min_qty <= newQty);
                if (applicableTier) {
                    unitPrice = applicableTier.selling_price;
                }
            }

            existingItems[existingIndex] = {
                ...item,
                qty: newQty,
                unit_price: unitPrice,
                subtotal: unitPrice * newQty
            };
        } else {
            // New item
            existingItems.push({
                product_id: product.product_id,
                name: product.name,
                unit_price: product.selling_price,
                qty: 1,
                subtotal: product.selling_price,
                stock: product.stock
            });
        }

        form.setData('items', existingItems);
        setProductSearch('');
        setIsDropdownOpen(false);
    };

    const updateQty = (index, newQty) => {
        const existingItems = [...form.data.items];
        const item = existingItems[index];
        const product = catalog.find(p => p.product_id === item.product_id);
        
        const finalQty = Math.min(newQty, product.stock);
        
        // Tier pricing
        let unitPrice = product.selling_price;
        if (product.tiers && product.tiers.length > 0) {
            const applicableTier = [...product.tiers].reverse().find(t => t.min_qty <= finalQty);
            if (applicableTier) {
                unitPrice = applicableTier.selling_price;
            }
        }

        existingItems[index] = {
            ...item,
            qty: finalQty,
            unit_price: unitPrice,
            subtotal: unitPrice * finalQty
        };

        form.setData('items', existingItems);
    };

    const removeItem = (index) => {
        const existingItems = [...form.data.items];
        existingItems.splice(index, 1);
        form.setData('items', existingItems);
    };

    // Derived totals
    const cartSubtotal = form.data.items.reduce((sum, item) => sum + item.subtotal, 0);
    const numDiscount = parseFloat(form.data.discount_amount) || 0;
    const numShipping = parseFloat(form.data.shipping_cost) || 0;
    const cartTotal = Math.max(0, cartSubtotal - numDiscount + numShipping);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (form.data.items.length === 0) {
            alert('Pesanan tidak boleh kosong. Silakan tambahkan minimal 1 item.');
            return;
        }

        const paymentAmt = parseFloat(form.data.payment_amount) || 0;
        if (form.data.payment_method === 'cash' && paymentAmt < cartTotal) {
            alert('Jumlah pembayaran tunai tidak mencukupi.');
            return;
        }

        router.post('/pos/online', {
            ...form.data,
            shift_id: shift.id,
            // Automatically set payment_amount = total for non-cash methods if not filled
            payment_amount: form.data.payment_method === 'cash' ? paymentAmt : cartTotal
        }, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setResultModalState({
                    isOpen: true,
                    status: 'success',
                    transaction: {
                        transaction_number: 'Baru Saja',
                        total: cartTotal,
                        payment_method: form.data.payment_method,
                        change_amount: form.data.payment_method === 'cash' ? Math.max(0, paymentAmt - cartTotal) : 0
                    }
                });
            },
            onError: () => {
                setResultModalState({
                    isOpen: true,
                    status: 'error',
                    transaction: null
                });
            }
        });
    };

    return (
        <AppLayout title="POS Online" breadcrumbs={[{ label: 'POS', url: '/pos/online' }]}>
            <Head title="POS Online" />

            <div className="max-w-4xl mx-auto pb-10">
                
                <div className="flex items-center gap-3 mb-6 bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-blue-900">Form Pesanan Online</h1>
                        <p className="text-sm text-blue-700">Gunakan form ini untuk mencatat transaksi dari WhatsApp, Grab, ShopeeFood, GoFood, dll.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Card 1: Data Pelanggan */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
                            <h2 className="font-bold text-gray-900">Data Pelanggan & Platform</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Platform Pemesanan</label>
                                    <select
                                        className="block w-full border border-gray-300 rounded-lg focus:ring-accent focus:border-accent py-2 px-3"
                                        value={form.data.platform}
                                        onChange={e => form.setData('platform', e.target.value)}
                                    >
                                        <option value="">Pilih Platform (Opsional)</option>
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="GrabFood">GrabFood</option>
                                        <option value="GoFood">GoFood</option>
                                        <option value="ShopeeFood">ShopeeFood</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="Tokopedia">Tokopedia</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Pelanggan</label>
                                    <input
                                        type="text"
                                        className="block w-full border border-gray-300 rounded-lg focus:ring-accent focus:border-accent py-2 px-3"
                                        value={form.data.customer_name}
                                        onChange={e => form.setData('customer_name', e.target.value)}
                                        placeholder="Ex: Budi (Gojek)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">No. WhatsApp / HP</label>
                                    <input
                                        type="text"
                                        className="block w-full border border-gray-300 rounded-lg focus:ring-accent focus:border-accent py-2 px-3"
                                        value={form.data.customer_phone}
                                        onChange={e => form.setData('customer_phone', e.target.value)}
                                        placeholder="0812xxxxxx"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Lengkap</label>
                                    <textarea
                                        className="block w-full border border-gray-300 rounded-lg focus:ring-accent focus:border-accent py-2 px-3"
                                        rows={2}
                                        value={form.data.customer_address}
                                        onChange={e => form.setData('customer_address', e.target.value)}
                                        placeholder="Untuk pengiriman kurir manual..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Item Pesanan */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
                            <h2 className="font-bold text-gray-900">Item Pesanan</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            
                            {/* Autocomplete Search */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Cari Produk</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent py-2.5"
                                        placeholder="Ketik SKU atau nama produk..."
                                        value={productSearch}
                                        onChange={e => {
                                            setProductSearch(e.target.value);
                                            setIsDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                    />
                                </div>

                                {isDropdownOpen && productSearch.trim().length > 0 && (
                                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredCatalog.length === 0 ? (
                                            <div className="p-3 text-sm text-gray-500 text-center">Produk tidak ditemukan atau stok kosong.</div>
                                        ) : (
                                            <ul className="divide-y divide-gray-100">
                                                {filteredCatalog.map(p => (
                                                    <li 
                                                        key={p.product_id}
                                                        onClick={() => addItem(p)}
                                                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${p.in_stock ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed bg-gray-50'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                                                                {p.image_path ? (
                                                                    <img src={p.image_path} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900 leading-none mb-1">{p.name}</p>
                                                                <p className="text-xs text-gray-500">{p.sku} • Stok: {p.stock}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-bold text-secondary">
                                                            {formatRupiah(p.selling_price)}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Overlay to close dropdown */}
                            {isDropdownOpen && (
                                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                            )}

                            {/* Selected Items Table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-primary text-white">
                                        <tr>
                                            <th className="px-4 py-3 font-medium rounded-tl-lg w-1/2">Produk</th>
                                            <th className="px-4 py-3 font-medium text-right w-1/6">Harga</th>
                                            <th className="px-4 py-3 font-medium text-center w-1/6">Qty</th>
                                            <th className="px-4 py-3 font-medium text-right w-1/6">Subtotal</th>
                                            <th className="px-4 py-3 rounded-tr-lg w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {form.data.items.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-gray-500 bg-gray-50">
                                                    Belum ada produk yang ditambahkan. Silakan cari produk di atas.
                                                </td>
                                            </tr>
                                        ) : (
                                            form.data.items.map((item, idx) => (
                                                <tr key={item.product_id} className="bg-white">
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-gray-900">{item.name}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-600">
                                                        {formatRupiah(item.unit_price)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input 
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            max={item.stock}
                                                            value={item.qty}
                                                            onChange={e => updateQty(idx, parseFloat(e.target.value) || 1)}
                                                            className="w-full text-center border-gray-300 rounded focus:ring-accent focus:border-accent py-1 px-2"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                        {formatRupiah(item.subtotal)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeItem(idx)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {form.data.items.length > 0 && (
                                        <tfoot className="bg-gray-50 border-t border-gray-200">
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3 font-semibold text-right text-gray-700">Subtotal Belanja</td>
                                                <td className="px-4 py-3 font-bold text-right text-gray-900">{formatRupiah(cartSubtotal)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>

                        </div>
                    </div>

                    {/* Card 3: Pengiriman */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">3</div>
                            <h2 className="font-bold text-gray-900">Pengiriman</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kurir</label>
                                    <input
                                        type="text"
                                        className="block w-full border border-gray-300 rounded-lg focus:ring-accent focus:border-accent py-2 px-3"
                                        value={form.data.courier}
                                        onChange={e => form.setData('courier', e.target.value)}
                                        placeholder="Gojek, Grab, Kurir Toko"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">No. Resi / Driver</label>
                                    <input
                                        type="text"
                                        className="block w-full border border-gray-300 rounded-lg focus:ring-accent focus:border-accent py-2 px-3"
                                        value={form.data.shipping_method}
                                        onChange={e => form.setData('shipping_method', e.target.value)}
                                        placeholder="AB1234 / B 1234 CD"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ongkos Kirim Ditagih</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">Rp</span>
                                        </div>
                                        <input
                                            type="number"
                                            className="block w-full pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent py-2"
                                            value={form.data.shipping_cost}
                                            onChange={e => form.setData('shipping_cost', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Isi jika ongkir ditagih bersama struk.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Pembayaran & Total */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">4</div>
                            <h2 className="font-bold text-gray-900">Pembayaran & Rincian Total</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-8">
                                
                                <div className="flex-1 space-y-5">
                                    {/* Metode Pembayaran */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Metode Pembayaran</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['transfer', 'ewallet', 'cash'].map(method => (
                                                <button
                                                    key={method}
                                                    type="button"
                                                    onClick={() => form.setData('payment_method', method)}
                                                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                                        form.data.payment_method === method 
                                                        ? 'bg-secondary/10 border-secondary text-secondary shadow-sm ring-1 ring-secondary' 
                                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span className="text-sm font-medium capitalize">{method}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Diskon */}
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal Diskon</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">Rp</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="block w-full pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent py-2"
                                                    value={form.data.discount_amount}
                                                    onChange={e => form.setData('discount_amount', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan Diskon</label>
                                            <input
                                                type="text"
                                                className="block w-full border border-gray-300 rounded-lg focus:ring-accent focus:border-accent py-2 px-3"
                                                value={form.data.discount_note}
                                                onChange={e => form.setData('discount_note', e.target.value)}
                                                placeholder="Contoh: Promo Platform"
                                            />
                                        </div>
                                    </div>

                                    {/* Khusus Cash */}
                                    {form.data.payment_method === 'cash' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Uang Tunai Diterima</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">Rp</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    min={cartTotal}
                                                    required
                                                    className="block w-full pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent py-3 font-bold text-lg"
                                                    value={form.data.payment_amount}
                                                    onChange={e => form.setData('payment_amount', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full md:w-80 bg-gray-900 rounded-2xl p-6 text-white shrink-0 flex flex-col justify-between shadow-xl shadow-gray-900/10">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold border-b border-gray-700 pb-3 mb-4">Rincian Transaksi</h3>
                                        
                                        <div className="flex justify-between items-center text-gray-300 text-sm">
                                            <span>Subtotal Item</span>
                                            <span className="font-medium text-white">{formatRupiah(cartSubtotal)}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-gray-300 text-sm">
                                            <span>Ongkos Kirim</span>
                                            <span className="font-medium text-white">{numShipping > 0 ? formatRupiah(numShipping) : '-'}</span>
                                        </div>
                                        
                                        {numDiscount > 0 && (
                                            <div className="flex justify-between items-center text-red-300 text-sm">
                                                <span>Diskon Total</span>
                                                <span className="font-medium">-{formatRupiah(numDiscount)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 pt-4 border-t border-gray-700">
                                        <div className="text-sm text-gray-400 mb-1">Total Dibayar Pelanggan</div>
                                        <div className="text-3xl font-black text-[#85E1A1] mb-6">
                                            {formatRupiah(cartTotal)}
                                        </div>

                                        <Button 
                                            type="submit" 
                                            disabled={form.processing || form.data.items.length === 0}
                                            className="w-full py-4 text-base bg-[#85E1A1] hover:bg-[#68C986] text-gray-900 font-bold rounded-xl shadow-[0_4px_0_0_#54A66C] active:shadow-[0_0px_0_0_#54A66C] active:translate-y-1 transition-all"
                                        >
                                            {form.processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </form>

            </div>

            {/* Transaction Result Modal */}
            <TransactionResultModal
                isOpen={resultModalState.isOpen}
                status={resultModalState.status}
                transaction={resultModalState.transaction}
                onClose={() => setResultModalState(prev => ({ ...prev, isOpen: false }))}
            />
        </AppLayout>
    );
}
