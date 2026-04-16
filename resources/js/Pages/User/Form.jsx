import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Shield, Lock, User, AtSign, Store, Phone, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function UserFormPage({ user, locations }) {
    const isEdit = !!user;

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        username: user?.username || '',
        password: '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || 'kasir',
        location_id: user?.location_id || '',
        is_active: user ? user.is_active : true,
    });

    const roles = ['owner', 'admin', 'stockist', 'kasir'];

    const submit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(`/users/${user.id}`);
        } else {
            post('/users');
        }
    };

    return (
        <AppLayout
            title={isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Manajemen Pengguna', url: '/users' },
                { label: isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru' }
            ]}
        >
            <Head title={isEdit ? 'Edit Pengguna - FruityPOS' : 'Tambah Pengguna - FruityPOS'} />

            <div className="max-w-7xl mx-auto space-y-6">

                <div className="max-w-4xl mx-auto mt-2">
                    
                    {/* Form Panel */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 p-8">
                            <div className="mb-8 border-b border-slate-100 pb-6">
                                <h2 className="text-xl font-bold tracking-tight text-slate-800">
                                    {isEdit ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    {isEdit ? 'Perbarui informasi personil yang sudah terdaftar.' : 'Daftarkan personil baru untuk mengelola operasional toko Anda.'}
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                className={`pl-10 w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-colors ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-slate-200'}`}
                                                placeholder="Contoh: Budi Santoso"
                                            />
                                        </div>
                                        {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
                                    </div>

                                    {/* Username */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                                        <div className="relative">
                                            <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={data.username}
                                                onChange={e => setData('username', e.target.value.toLowerCase())}
                                                className={`pl-10 w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-colors ${errors.username ? 'border-red-400 focus:border-red-500' : 'border-slate-200'}`}
                                                placeholder="budi123"
                                            />
                                        </div>
                                        {errors.username && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.username}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Email (Opsional)</label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className={`pl-10 w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-colors ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200'}`}
                                                placeholder="budi@email.com"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
                                    </div>

                                    {/* Phone & Pass */}
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password {isEdit && <span className="font-normal text-slate-400 text-xs">(Kosong = Tetap)</span>}</label>
                                            <div className="relative">
                                                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="password"
                                                    value={data.password}
                                                    onChange={e => setData('password', e.target.value)}
                                                    className={`pl-10 w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-colors ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-slate-200'}`}
                                                    placeholder={isEdit ? "Biarkan kosong jika tidak diubah" : "Buat password yang kuat"}
                                                />
                                            </div>
                                            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Peran (Role)</label>
                                            <div className="relative">
                                                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <select
                                                    value={data.role}
                                                    onChange={e => setData('role', e.target.value)}
                                                    className={`pl-10 w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-colors capitalize appearance-none ${errors.role ? 'border-red-400 focus:border-red-500' : 'border-slate-200'}`}
                                                >
                                                    {roles.map(r => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.role && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.role}</p>}
                                        </div>
                                    </div>

                                    {/* Store */}
                                    <div className="md:col-span-2 pt-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Penugasan Toko</label>
                                        <div className="relative">
                                            <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <select
                                                value={data.location_id}
                                                onChange={e => setData('location_id', e.target.value)}
                                                className={`pl-10 w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-colors appearance-none ${errors.location_id ? 'border-red-400 focus:border-red-500' : 'border-slate-200'}`}
                                            >
                                                <option value="">Pusat / Owner (Tidak ditempatkan)</option>
                                                {locations.map(loc => (
                                                    <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.location_id && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.location_id}</p>}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                                    <Link
                                        href="/users"
                                        className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-500/30 disabled:opacity-75 disabled:cursor-not-allowed"
                                    >
                                        {processing && (
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
