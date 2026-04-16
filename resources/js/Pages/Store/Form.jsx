import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Store, MapPin, Phone, Calendar, Hash, Users, Shield } from 'lucide-react';

export default function StoreFormPage({ store, unassignedUsers }) {
    const isEdit = !!store;

    // Filter assigned users from unassignedUsers based on their current location_id (if editing)
    const initialAssignedUsers = isEdit 
        ? unassignedUsers.filter(u => u.location_id === store.id).map(u => u.id)
        : [];

    const { data, setData, post, put, processing, errors } = useForm({
        name: store?.name || '',
        code: store?.code || '',
        address: store?.address || '',
        phone: store?.phone || '',
        opened_at: store?.opened_at ? store.opened_at.split(' ')[0] : '',
        is_active: store ? store.is_active : true,
        assigned_users: initialAssignedUsers,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/stores/${store.id}`);
        } else {
            post('/stores');
        }
    };

    const toggleUserSelection = (userId) => {
        const currentSelection = [...data.assigned_users];
        if (currentSelection.includes(userId)) {
            setData('assigned_users', currentSelection.filter(id => id !== userId));
        } else {
            setData('assigned_users', [...currentSelection, userId]);
        }
    };

    return (
        <AppLayout
            title={isEdit ? 'Edit Data Toko' : 'Tambah Toko Baru'}
            breadcrumbs={[
                { label: 'Home', url: '/dashboard' },
                { label: 'Manajemen Toko', url: '/stores' },
                { label: isEdit ? 'Edit Toko' : 'Tambah Toko Baru' }
            ]}
        >
            <Head title={isEdit ? 'Edit Toko - FruityPOS' : 'Tambah Toko - FruityPOS'} />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="max-w-4xl mx-auto mt-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden">
                        
                        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                            <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                                <Store className="w-5 h-5 text-indigo-600" />
                                {isEdit ? 'Formulir Edit Toko' : 'Formulir Pendaftaran Toko'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {isEdit ? 'Perbarui informasi dan komposisi staf cabang toko ini.' : 'Daftarkan cabang baru dan atur penugasan staf yang mengelola toko ini.'}
                            </p>
                        </div>

                        <form onSubmit={submit} className="p-8 space-y-8">
                            
                            {/* Section 1: Informasi Toko */}
                            <div>
                                <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                                    <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">1</span>
                                    Informasi Dasar Toko
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Toko <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                className={`pl-10 w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors ${errors.name ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                                                placeholder="Cth: Cabang Utama Sudirman"
                                            />
                                        </div>
                                        {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Cabang <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={data.code}
                                                onChange={e => setData('code', e.target.value.toUpperCase())}
                                                maxLength={10}
                                                className={`pl-10 w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors font-mono uppercase ${errors.code ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                                                placeholder="Cth: SDIR-01"
                                            />
                                        </div>
                                        {errors.code && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.code}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Lengkap</label>
                                        <div className="relative flex items-start">
                                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                                            <textarea
                                                value={data.address}
                                                onChange={e => setData('address', e.target.value)}
                                                rows="3"
                                                className={`pl-10 w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors ${errors.address ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                                                placeholder="Masukkan alamat lengkap cabang toko..."
                                            ></textarea>
                                        </div>
                                        {errors.address && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.address}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Telepon</label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={data.phone}
                                                onChange={e => setData('phone', e.target.value)}
                                                className={`pl-10 w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors tracking-wide ${errors.phone ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                                                placeholder="Cth: 0812XXXXXXXX"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Beroperasi</label>
                                        <div className="relative">
                                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="date"
                                                value={data.opened_at}
                                                onChange={e => setData('opened_at', e.target.value)}
                                                className={`pl-10 w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors ${errors.opened_at ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                                            />
                                        </div>
                                        {errors.opened_at && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.opened_at}</p>}
                                    </div>
                                    
                                    {/* Toggle Active Switch */}
                                    <div className="md:col-span-2 mt-2 flex items-center justify-between p-4 rounded-xl border border-slate-200/60 bg-slate-50/50">
                                        <div>
                                            <div className="font-semibold text-sm text-slate-800">Status Operasional</div>
                                            <div className="text-xs text-slate-500 mt-0.5">Tentukan apakah cabang ini aktif dan bisa melakukan transaksi POS.</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={data.is_active}
                                                onChange={e => setData('is_active', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    {errors.is_active && <p className="text-red-500 text-xs mt-1 md:col-span-2 font-medium">{errors.is_active}</p>}
                                </div>
                            </div>
                            
                            {/* Section 2: Penugasan Staff */}
                            <div className="pt-2">
                                <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                                    <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">2</span>
                                    Penugasan Staf
                                </h3>
                                
                                <div className="mb-4 text-sm text-slate-600 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                    <Users className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                                    <div>
                                        Anda dapat langsung menugaskan staf untuk ditempatkan pada cabang ini. 
                                        Daftar di bawah ini berisi seluruh staf yang <strong>belum ditugaskan</strong> ke toko mana pun atau staf yang sudah Anda tugaskan sebelumnya ke toko ini (jika mode edit).
                                    </div>
                                </div>

                                {unassignedUsers.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                                        {unassignedUsers.map(user => {
                                            const isChecked = data.assigned_users.includes(user.id);
                                            return (
                                                <label 
                                                    key={user.id} 
                                                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-indigo-50 border-indigo-200 shadow-sm shadow-indigo-100' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}
                                                >
                                                    <div className="flex items-center h-5">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600"
                                                            checked={isChecked}
                                                            onChange={() => toggleUserSelection(user.id)}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                                            {user.name} 
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                                                ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 
                                                                user.role === 'stockist' ? 'bg-sky-100 text-sky-700' : 
                                                                'bg-slate-200 text-slate-700'}
                                                            `}>
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-1">
                                                            <span className="inline-flex items-center gap-1 opacity-75">
                                                                <Shield className="w-3 h-3" /> @{user.username || 'username'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                                        <div className="text-slate-400 mb-2 flex justify-center"><Users className="w-8 h-8 opacity-50" /></div>
                                        <p className="font-medium text-slate-700">Tidak ada staf yang tersedia</p>
                                        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Semua staf telah ditugaskan ke toko lain. Silakan buat pengguna baru terlebih dahulu melalui menu <strong>Kelola User</strong>.</p>
                                    </div>
                                )}
                                
                                {errors.assigned_users && <p className="text-red-500 text-xs mt-2 font-medium">{errors.assigned_users}</p>}
                            </div>

                            <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-3 mt-4">
                                <Link
                                    href="/stores"
                                    className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-500/30 disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {processing && (
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {isEdit ? 'Simpan Perubahan Toko' : 'Submit Toko Baru'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
