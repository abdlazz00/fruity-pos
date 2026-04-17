import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { Plus, Search, Filter, Shield, Store, ToggleLeft, ToggleRight, Edit } from 'lucide-react';

export default function UserIndex({ users, locations }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [storeFilter, setStoreFilter] = useState('');

    const roles = ['owner', 'stockist', 'kasir', 'admin'];

    // Client-side filtering as an enhancement. For complex dbs, we do Server-side.
    const filteredUsers = users.data.filter(user => {
        const matchSearch = (user.name.toLowerCase().includes(search.toLowerCase()) || user.username.toLowerCase().includes(search.toLowerCase()));
        const matchRole = roleFilter ? user.role === roleFilter : true;
        const matchStore = storeFilter ? user.location_id == storeFilter : true;
        return matchSearch && matchRole && matchStore;
    });

    const handleEdit = (user) => {
        router.visit(`/users/${user.id}/edit`);
    };

    const handleCreate = () => {
        router.visit('/users/create');
    };

    const handleToggle = (id) => {
        if (confirm('Apakah Anda yakin ingin mengubah status pengguna ini?')) {
            router.patch(`/users/${id}/toggle`, {}, {
                preserveScroll: true
            });
        }
    };

    return (
        <AppLayout title="Manajemen Pengguna">
            <Head title="Kelola User - FruityPOS" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Manajemen Pengguna</h1>
                        <p className="text-sm text-slate-500 mt-1">Kelola staf, hak akses, dan penempatan toko mereka di sistem.</p>
                    </div>
                    <button 
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah User Baru
                    </button>
                </div>

                {/* Flash Message */}
                {flash?.status && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                            <Shield className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium">{flash.status}</p>
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                        {flash.error}
                    </div>
                )}

                {/* Filter Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6 relative">
                        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari user berdasarkan nama atau username..." 
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <div className="relative">
                            <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select 
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none text-sm font-medium text-slate-700"
                                value={storeFilter}
                                onChange={e => setStoreFilter(e.target.value)}
                            >
                                <option value="">Semua Toko</option>
                                <option value="null">Pusat/Owner</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <div className="relative">
                            <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select 
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none text-sm font-medium text-slate-700 capitalize"
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                            >
                                <option value="">Semua Role</option>
                                {roles.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Section - Bento Component */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="py-4 px-6 font-semibold text-slate-600">Nama</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600">Role</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600">Penempatan Toko</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600">Status</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/80">
                                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                    <tr key={user.id} className={`group hover:bg-slate-50/50 transition-colors ${!user.is_active ? 'opacity-60 grayscale-[30%] bg-slate-50' : ''}`}>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800">{user.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                                                ${user.role === 'owner' ? 'bg-amber-100 text-amber-800' :
                                                  user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                                                  user.role === 'stockist' ? 'bg-sky-100 text-sky-800' :
                                                  'bg-slate-100 text-slate-800'
                                                }`}>
                                                <Shield className="w-3 h-3" />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {user.location ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                                    <span className="font-medium text-slate-700 text-sm">{user.location.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Central/Owner</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 font-medium text-xs
                                                ${user.is_active ? 'text-emerald-600' : 'text-slate-500'}
                                            `}>
                                                <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                                {user.is_active ? 'Aktif Bekerja' : 'Non-aktif'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip" title="Edit Data">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleToggle(user.id)} className={`p-2 rounded-lg transition-colors ${user.is_active ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                                                    {user.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <Search className="w-10 h-10 mb-3 opacity-20" />
                                                <p className="text-base font-medium">Pengguna tidak ditemukan</p>
                                                <p className="text-xs mt-1">Coba sesuaikan filter atau kata kunci pencarian.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-sm text-slate-500 font-medium">
                        <div>Menampilkan {filteredUsers.length} dari total {users.total} user.</div>
                        <div className="flex gap-2">
                            {users.links.map((link, k) => (
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

                {/* Role Permissions Overview - Bento Box style */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100/50">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-amber-600" />
                            <h3 className="font-bold text-amber-900 text-sm">Akses Owner</h3>
                        </div>
                        <p className="text-xs text-amber-700/80 leading-relaxed">
                            Akses penuh ke semua fitur, manajemen user, laporan finansial, dan seluruh kontrol operasional aplikasi.
                        </p>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100/50">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-indigo-600" />
                            <h3 className="font-bold text-indigo-900 text-sm">Akses Admin</h3>
                        </div>
                        <p className="text-xs text-indigo-700/80 leading-relaxed">
                            Akses ke modul POS Online, pengelolaan inventaris, input harga dasar, dan penerimaan laporan harian kasir.
                        </p>
                    </div>
                    <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100/50">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-sky-600" />
                            <h3 className="font-bold text-sky-900 text-sm">Akses Stockist</h3>
                        </div>
                        <p className="text-xs text-sky-700/80 leading-relaxed">
                            Kelola data master produk, supplier, pencatatan mutasi produk, Inbound stok, dan stock opname di gudang.
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/50">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-slate-600" />
                            <h3 className="font-bold text-slate-900 text-sm">Akses Kasir</h3>
                        </div>
                        <p className="text-xs text-slate-700/80 leading-relaxed">
                            Hanya memiliki kontrol untuk transaksi POS (Offline/Kasir), input penjualan harian, dan tutup shift (EOD).
                        </p>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
