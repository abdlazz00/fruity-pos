import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { Plus, Search, Store, ToggleLeft, ToggleRight, Edit, MapPin, Phone, Calendar, AlertCircle } from 'lucide-react';

export default function StoreIndex({ stores }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');

    const filteredStores = stores.data.filter(store => 
        store.name.toLowerCase().includes(search.toLowerCase()) || 
        store.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (store) => {
        router.visit(`/stores/${store.id}/edit`);
    };

    const handleCreate = () => {
        router.visit('/stores/create');
    };

    const handleToggle = (id) => {
        if (confirm('Apakah Anda yakin ingin mengubah status toko ini?')) {
            router.patch(`/stores/${id}/toggle`, {}, {
                preserveScroll: true
            });
        }
    };

    return (
        <AppLayout title="Manajemen Toko">
            <Head title="Kelola Toko - FruityPOS" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Manajemen Toko</h1>
                        <p className="text-sm text-slate-500 mt-1">Kelola cabang toko, informasi detail, dan status operasional.</p>
                    </div>
                    <button 
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Toko Baru
                    </button>
                </div>
                
                {/* Flash Message */}
                {flash?.status && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium">{flash.status}</p>
                    </div>
                )}
                
                {/* Global Error Display (non-form specific) */}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                        {flash.error}
                    </div>
                )}

                {/* Filter Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari toko berdasarkan nama atau kode..." 
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Card Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredStores.length > 0 ? filteredStores.map(store => {
                        // Checking Minimum Staff Logic (1 Stockist, 1 Kasir, 1 Admin)
                        const staffs = store.users || [];
                        const hasStockist = staffs.some(u => u.role === 'stockist');
                        const hasKasir = staffs.some(u => u.role === 'kasir');
                        const hasAdmin = staffs.some(u => u.role === 'admin');
                        const isStaffComplete = hasStockist && hasKasir && hasAdmin;

                        return (
                            <div key={store.id} className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex flex-col hover:shadow-md transition-all ${!store.is_active ? 'opacity-80 bg-slate-50' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Store className="w-6 h-6" />
                                        </div>
                                        <div className="mt-0.5">
                                            <h3 className="font-bold text-slate-800 text-base leading-tight">{store.name}</h3>
                                            <div className="text-xs text-slate-500 font-mono mt-1 bg-slate-100 inline-block px-1.5 py-0.5 rounded border border-slate-200/60">Kode: {store.code}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-0.5">
                                        <button onClick={() => handleEdit(store)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip" title="Edit Data">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleToggle(store.id)} className={`p-1.5 rounded-lg transition-colors ${store.is_active ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={store.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                                            {store.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 flex-1 mt-2">
                                    <div className="flex items-start gap-3 text-slate-600 text-sm">
                                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                                        <span className="leading-relaxed line-clamp-2" title={store.address}>{store.address || 'Belum ada alamat'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                                        <Phone className="w-4 h-4 shrink-0 text-slate-400" />
                                        <span>{store.phone || '-'}</span>
                                    </div>
                                    {store.opened_at && (
                                        <div className="flex items-center gap-3 text-slate-600 text-sm">
                                            <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                                            <span>Buka: {new Date(store.opened_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-end justify-between">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-2 font-medium">Staf Toko:</div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {staffs.slice(0, 3).map((staff, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600 z-10" title={staff.name}>
                                                        {staff.name.charAt(0)}
                                                    </div>
                                                ))}
                                                {staffs.length > 3 && (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500 z-0">
                                                        +{staffs.length - 3}
                                                    </div>
                                                )}
                                                {staffs.length === 0 && (
                                                    <span className="text-xs text-slate-400 italic py-1">Belum ada</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`inline-flex items-center gap-1.5 font-medium text-xs px-2.5 py-1 rounded-full
                                            ${store.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}
                                        `}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${store.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                            {store.is_active ? 'Beroperasi' : 'Tutup'}
                                        </span>

                                        {!isStaffComplete && store.is_active && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 shrink-0" title="Staf belum lengkap (Butuh minimal 1 Stockist, 1 Kasir, 1 Admin)">
                                                <AlertCircle className="w-3 h-3" />
                                                Staf Tidak Lengkap
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                            <div className="flex flex-col items-center justify-center text-slate-400">
                                <Store className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-lg font-medium text-slate-600">Data toko tidak ditemukan</p>
                                <p className="text-sm mt-1 mb-4">Coba sesuaikan kata kunci pencarian atau tambah toko baru.</p>
                                <button onClick={handleCreate} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors inline-flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Tambah Toko Sekarang
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {stores.total > 0 && (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 text-sm text-slate-500 font-medium bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                        <div>Menampilkan {filteredStores.length} dari total {stores.total} toko.</div>
                        <div className="flex gap-1.5">
                            {stores.links.map((link, k) => (
                                <Link 
                                    key={k} 
                                    href={link.url || '#'} 
                                    className={`px-3 py-1.5 rounded-lg border transition-all ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'} ${!link.url && 'opacity-50 cursor-not-allowed hidden md:block'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
