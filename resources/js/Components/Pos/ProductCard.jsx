import React from 'react';

export default function ProductCard({ product, onClick }) {
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    };

    const hasTiers = product.tiers && product.tiers.length > 0;

    return (
        <div 
            onClick={() => product.in_stock && onClick(product)}
            className={`border rounded-xl overflow-hidden transition-all duration-200 flex flex-col h-full bg-white
                ${product.in_stock 
                    ? 'border-gray-200 hover:border-secondary hover:shadow-sm cursor-pointer' 
                    : 'border-gray-100 opacity-60 cursor-not-allowed grayscale-[50%]'
                }`}
        >
            {/* Image Placeholder */}
            <div className="h-32 bg-gray-100 w-full flex items-center justify-center relative shrink-0">
                {product.image_path ? (
                    <img src={product.image_path} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )}
                
                {/* Stock Badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    product.in_stock ? 'bg-white/90 text-gray-700' : 'bg-red-100 text-red-600'
                }`}>
                    Stok: {product.stock}
                </div>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{product.category}</div>
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-2 line-clamp-2">{product.name}</h3>
                </div>
                
                <div>
                    <div className="text-sm font-bold text-secondary">
                        {formatRupiah(product.selling_price)}
                    </div>
                    {hasTiers && (
                        <div className="text-[10px] text-yellow-600 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Tersedia harga grosir
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
