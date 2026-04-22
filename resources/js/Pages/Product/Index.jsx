import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Plus, Search, Package, CheckCircle, XCircle, Edit, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ProductIndex({ products, categories }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const filteredProducts = products.data.filter(prod => {
        const matchSearch = prod.name.toLowerCase().includes(search.toLowerCase()) || 
                            (prod.sku && prod.sku.toLowerCase().includes(search.toLowerCase()));
        
        const matchCategory = filterCategory === '' || prod.category_id.toString() === filterCategory;

        return matchSearch && matchCategory;
    });

    const totalProducts = products.total;
    const activeProducts = products.data.filter(p => p.status === 'active').length;
    const inactiveProducts = products.data.filter(p => p.status === 'inactive').length;

    const toggleStatus = (id) => {
        if (confirm('Apakah Anda yakin ingin mengubah status aktif produk ini?')) {
            router.patch(`/master/products/${id}/toggle`, {}, {
                preserveScroll: true
            });
        }
    };

    return (
        <AppLayout title="Data Produk">
            <Head title="Data Produk - FruityPOS" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Master Data Produk</h1>
                        <p className="text-sm text-slate-500 mt-1">Kelola seluruh produk, gramasi, harga, dan SKU inventori.</p>
                    </div>
                    <Link 
                        href="/master/products/create"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Produk
                    </Link>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Total Produk</div>
                            <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalProducts}</div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Produk Aktif</div>
                            <div className="text-2xl font-bold text-slate-800 mt-0.5">{activeProducts}</div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Tidak Aktif</div>
                            <div className="text-2xl font-bold text-slate-800 mt-0.5">{inactiveProducts}</div>
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.status && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium">{flash.status}</p>
                    </div>
                )}

                {/* Main Content & Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Cari nama produk atau SKU..." 
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:max-w-xs">
                            <select
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-slate-700"
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-white border-b border-slate-100">
                                    <th className="py-4 px-6 font-semibold text-slate-600">Info Produk</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600">Kategori</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600">Tipe</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-center">Status</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/80">
                                {filteredProducts.length > 0 ? filteredProducts.map(prod => (
                                    <tr key={prod.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                                                    {prod.image_path ? (
                                                        <img src={`/storage/${prod.image_path}`} alt={prod.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{prod.name}</div>
                                                    <div className="text-xs font-mono text-slate-500 mt-0.5">{prod.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 font-medium">
                                            {prod.category?.name || '-'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="capitalize text-slate-600 text-sm font-medium bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                                {prod.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button 
                                                onClick={() => toggleStatus(prod.id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                                                    prod.status === 'active' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${prod.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {prod.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link 
                                                    href={`/master/products/${prod.id}/edit`} 
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip"
                                                    title="Edit Produk"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-500">
                                            Tidak ada data produk ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-sm text-slate-500 font-medium">
                        <div>Menampilkan {filteredProducts.length} dari total {products.total} produk.</div>
                        <div className="flex gap-2">
                            {products.links.map((link, k) => (
                                <Link 
                                    key={k} 
                                    href={link.url || '#'} 
                                    className={`px-3 py-1.5 rounded-lg border transition-all ${link.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
