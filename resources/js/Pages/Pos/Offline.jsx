import React, { useState, useMemo } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import ProductCard from '../../Components/Pos/ProductCard';
import CartItem from '../../Components/Pos/CartItem';
import PaymentModal from '../../Components/Pos/PaymentModal';
import TransactionResultModal from '../../Components/Pos/TransactionResultModal';

export default function PosOffline({ shift, catalog }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [discountAmount, setDiscountAmount] = useState('');
    const [discountNote, setDiscountNote] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    
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

    // Filter catalog based on search
    const filteredCatalog = useMemo(() => {
        if (!searchQuery.trim()) return catalog;
        const lowerQuery = searchQuery.toLowerCase();
        return catalog.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) || 
            p.sku.toLowerCase().includes(lowerQuery)
        );
    }, [catalog, searchQuery]);

    // Categories for filter tabs (extract unique categories)
    const categories = useMemo(() => {
        const cats = new Set(catalog.map(p => p.category));
        return ['Semua', ...Array.from(cats)].filter(c => c !== '-');
    }, [catalog]);

    const [activeCategory, setActiveCategory] = useState('Semua');

    const displayedCatalog = useMemo(() => {
        if (activeCategory === 'Semua') return filteredCatalog;
        return filteredCatalog.filter(p => p.category === activeCategory);
    }, [filteredCatalog, activeCategory]);

    // Cart operations
    const addToCart = (product) => {
        setCart(prev => {
            const existingIndex = prev.findIndex(item => item.product_id === product.product_id);
            if (existingIndex >= 0) {
                // Update existing
                const newCart = [...prev];
                const item = newCart[existingIndex];
                const newQty = item.qty + 1;
                
                // Prevent adding more than stock
                if (newQty > product.stock) {
                    alert(`Stok tidak mencukupi. Tersedia: ${product.stock}`);
                    return prev;
                }
                
                // Check tier pricing
                let unitPrice = product.selling_price;
                if (product.tiers && product.tiers.length > 0) {
                    const applicableTier = [...product.tiers].reverse().find(t => t.min_qty <= newQty);
                    if (applicableTier) {
                        unitPrice = applicableTier.selling_price;
                    }
                }
                
                newCart[existingIndex] = {
                    ...item,
                    qty: newQty,
                    unit_price: unitPrice,
                    subtotal: unitPrice * newQty
                };
                return newCart;
            } else {
                // Add new
                return [...prev, {
                    product_id: product.product_id,
                    name: product.name,
                    unit_price: product.selling_price, // Base price for qty 1
                    qty: 1,
                    subtotal: product.selling_price,
                    stock: product.stock // Keep stock reference for validation
                }];
            }
        });
    };

    const updateCartQty = (productId, newQty) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.product_id === productId) {
                    // Re-find product to check tiers and stock
                    const product = catalog.find(p => p.product_id === productId);
                    
                    // Cap at stock
                    const finalQty = Math.min(newQty, product.stock);
                    
                    // Check tier pricing
                    let unitPrice = product.selling_price;
                    if (product.tiers && product.tiers.length > 0) {
                        const applicableTier = [...product.tiers].reverse().find(t => t.min_qty <= finalQty);
                        if (applicableTier) {
                            unitPrice = applicableTier.selling_price;
                        }
                    }
                    
                    return {
                        ...item,
                        qty: finalQty,
                        unit_price: unitPrice,
                        subtotal: unitPrice * finalQty
                    };
                }
                return item;
            });
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    // Derived totals
    const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const numDiscount = parseFloat(discountAmount) || 0;
    const cartTotal = Math.max(0, cartSubtotal - numDiscount);

    // Submit Transaction
    const handlePaymentConfirm = (paymentData) => {
        router.post('/pos/offline', {
            shift_id: shift.id,
            items: cart.map(item => ({ product_id: item.product_id, qty: item.qty })),
            discount_amount: numDiscount,
            discount_note: discountNote,
            payment_method: paymentData.payment_method,
            payment_amount: paymentData.payment_amount
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                setCart([]);
                setDiscountAmount('');
                setDiscountNote('');
                setIsPaymentModalOpen(false);
                setResultModalState({
                    isOpen: true,
                    status: 'success',
                    // Data is not immediately available here in inertia without reloading, 
                    // but we can fake the transaction data for the success modal based on the cart if backend doesn't return json on full page reload.
                    // Wait, since we are returning back()->with('status', ...), we don't have the transaction object in JS, 
                    // so we will show a generic success by relying on the flash message or calculated data.
                    transaction: {
                        transaction_number: 'Baru Saja',
                        total: cartTotal,
                        payment_method: paymentData.payment_method,
                        change_amount: paymentData.payment_method === 'cash' ? Math.max(0, paymentData.payment_amount - cartTotal) : 0
                    }
                });
            },
            onError: () => {
                setIsPaymentModalOpen(false);
                setResultModalState({
                    isOpen: true,
                    status: 'error',
                    transaction: null
                });
            }
        });
    };

    return (
        <AppLayout title="POS Offline" breadcrumbs={[{ label: 'POS', url: '/pos/offline' }]}>
            <Head title="POS Offline" />

            {/* Offline Banner indicating Kasir constraint */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 rounded-r-lg flex items-center justify-between">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-yellow-700">
                        Mode Kasir Fisik — Pastikan keranjang belanja sesuai dengan fisik buah yang dibeli pelanggan.
                    </p>
                </div>
            </div>

            {/* 2-Column Layout */}
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
                
                {/* LEFT: CATALOG (65%) */}
                <div className="lg:w-[65%] flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {/* Search & Filter Header */}
                    <div className="p-4 border-b border-gray-200 bg-white z-10">
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent text-lg"
                                placeholder="Cari nama buah atau SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>

                        {/* Category Tabs */}
                        <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                        activeCategory === cat 
                                        ? 'bg-primary text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                        {displayedCatalog.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p>Tidak ada produk yang ditemukan.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {displayedCatalog.map(product => (
                                    <ProductCard 
                                        key={product.product_id} 
                                        product={product} 
                                        onClick={addToCart} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: CART (35%) */}
                <div className="lg:w-[35%] flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Cart Header */}
                    <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11.2M9 20a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
                            </svg>
                            Keranjang Belanja
                        </h2>
                        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                            {cart.length} Item
                        </span>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11.2M9 20a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
                                </svg>
                                <p>Keranjang masih kosong</p>
                                <p className="text-xs mt-1 text-center px-4">Pilih produk dari katalog di sebelah kiri untuk menambah pesanan.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {cart.map(item => (
                                    <CartItem 
                                        key={item.product_id}
                                        item={item}
                                        updateQty={updateCartQty}
                                        removeItem={removeFromCart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart Footer (Totals & Checkout) */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0 space-y-3">
                        {/* Discount Field */}
                        {cart.length > 0 && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-gray-700">Potongan Diskon (Rp)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        className="w-32 px-2 py-1 text-right text-sm border-gray-300 rounded-md focus:ring-accent focus:border-accent"
                                        value={discountAmount}
                                        onChange={e => setDiscountAmount(e.target.value)}
                                    />
                                </div>
                                {numDiscount > 0 && (
                                    <input
                                        type="text"
                                        placeholder="Catatan diskon (Opsional, ex: Promo Kemerdekaan)"
                                        className="w-full px-3 py-1.5 text-sm border-gray-300 rounded-md focus:ring-accent focus:border-accent"
                                        value={discountNote}
                                        onChange={e => setDiscountNote(e.target.value)}
                                    />
                                )}
                            </div>
                        )}

                        <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatRupiah(cartSubtotal)}</span>
                            </div>
                            {numDiscount > 0 && (
                                <div className="flex justify-between text-sm text-red-500 font-medium">
                                    <span>Diskon</span>
                                    <span>-{formatRupiah(numDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end pt-2 mt-2 border-t border-gray-200">
                                <span className="text-base font-bold text-gray-900">Total Tagihan</span>
                                <span className="text-2xl font-black text-secondary">
                                    {formatRupiah(cartTotal)}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            disabled={cart.length === 0}
                            className={`w-full py-3.5 rounded-xl text-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2
                                ${cart.length > 0 
                                    ? 'bg-secondary text-white hover:bg-[#245A3D] active:scale-[0.98]' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Bayar Sekarang
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Checkout Modal */}
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                total={cartTotal}
                onConfirm={handlePaymentConfirm}
            />

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
