import React from 'react';

export default function TopProductsTable({ products }) {
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (!products || products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <p>Tidak ada data penjualan produk</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                        <th className="px-4 py-3 font-medium">Produk</th>
                        <th className="px-4 py-3 font-medium text-right">Terjual</th>
                        <th className="px-4 py-3 font-medium text-right">Pendapatan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                        {index + 1}
                                    </div>
                                    <span className="font-medium text-gray-900">{product.product_name}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <span className="text-gray-900 font-medium">{parseFloat(product.total_qty).toString()}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <span className="text-emerald-600 font-bold">{formatRupiah(product.total_revenue)}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
