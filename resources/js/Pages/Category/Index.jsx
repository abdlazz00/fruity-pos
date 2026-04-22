import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import { Plus, Search, Layers, ShieldCheck, Box, AlertCircle, Edit, Trash2, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function CategoryIndex({ categories }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
    });

    const openCreateModal = () => {
        setIsEdit(false);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setIsEdit(true);
        setSelectedId(category.id);
        setData({
            name: category.name,
            description: category.description || '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => reset(), 300);
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/master/categories/${selectedId}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/master/categories', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini secara permanen? Produk di kategori ini akan kehilangan relasinya atau tidak bisa dihapus jika aturan ketat berlaku.')) {
            destroy(`/master/categories/${id}`, {
                preserveScroll: true
            });
        }
    };

    // Client filtering
    const filteredCategories = categories.data.filter(cat => 
        cat.name.toLowerCase().includes(search.toLowerCase()) || 
        (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
    );

    // Derived Stats
    const totalCategories = categories.total;
    const emptyCategories = categories.data.filter(cat => cat.products_count === 0).length;
    const totalProductsMapped = categories.data.reduce((acc, curr) => acc + (curr.products_count || 0), 0);

    return (
        <AppLayout title="Kategori Produk">
            <Head title="Kategori Produk - FruityPOS" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Kategori Produk</h1>
                        <p className="text-sm text-slate-500 mt-1">Kelola klasifikasi dan jenis dari inventory buah-buahan.</p>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Kategori
                    </button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Total Kategori</div>
                            <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalCategories}</div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                            <Box className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Produk Terklasifikasi</div>
                            <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalProductsMapped}</div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Kategori Kosong</div>
                            <div className="text-2xl font-bold text-slate-800 mt-0.5">{emptyCategories}</div>
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
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{flash.error}</p>
                    </div>
                )}

                {/* Main Content & Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative max-w-md">
                            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Cari kategori..." 
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-white border-b border-slate-100">
                                    <th className="py-4 px-6 font-semibold text-slate-600 w-24">Kode</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600">Nama Kategori</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 w-1/3">Deskripsi</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600">Total Produk</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/80">
                                {filteredCategories.length > 0 ? filteredCategories.map(cat => (
                                    <tr key={cat.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6 font-mono text-xs text-slate-500">
                                            CAT-{cat.id.toString().padStart(3, '0')}
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-slate-800">
                                            {cat.name}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 truncate max-w-[200px]" title={cat.description}>
                                            {cat.description || <span className="italic opacity-50">Tidak ada deskripsi</span>}
                                        </td>
                                        <td className="py-4 px-6">
                                            {cat.products_count > 0 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                                                    {cat.products_count} Produk
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                                                    Kosong
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(cat)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-500">
                                            Tidak ada data kategori ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-sm text-slate-500 font-medium">
                        <div>Menampilkan {filteredCategories.length} dari total {categories.total} kategori.</div>
                        <div className="flex gap-2">
                            {categories.links.map((link, k) => (
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

            {/* Modal Create/Edit */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-800">
                                            {isEdit ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                                        </Dialog.Title>
                                        <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <form onSubmit={submit} className="p-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                                    Nama Kategori <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'} focus:ring-2 focus:ring-opacity-20 outline-none transition-all`}
                                                    placeholder="Contoh: Buah Lokal"
                                                    disabled={processing}
                                                    required
                                                />
                                                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                                    Deskripsi
                                                </label>
                                                <textarea
                                                    value={data.description}
                                                    onChange={e => setData('description', e.target.value)}
                                                    rows="3"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:ring-2 focus:ring-opacity-20 outline-none transition-all resize-none"
                                                    placeholder="Opsional: Keterangan tentang kategori ini..."
                                                    disabled={processing}
                                                ></textarea>
                                                {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description}</p>}
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                                                disabled={processing}
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-5 py-2.5 rounded-xl font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/30 transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 flex items-center"
                                            >
                                                {processing ? 'Menyimpan...' : 'Simpan Kategori'}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </AppLayout>
    );
}
