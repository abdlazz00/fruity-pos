import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { Plus, Search, Scale, Edit, Trash2, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function UomIndex({ uoms }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        symbol: '',
        description: '',
    });

    const openCreateModal = () => {
        setIsEdit(false);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (uom) => {
        setIsEdit(true);
        setSelectedId(uom.id);
        setData({
            name: uom.name,
            symbol: uom.symbol || '',
            description: uom.description || '',
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
            put(`/master/uoms/${selectedId}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/master/uoms', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus Satuan Ukur ini secara permanen?')) {
            destroy(`/master/uoms/${id}`, {
                preserveScroll: true
            });
        }
    };

    // Client filtering
    const filteredUoms = uoms.data.filter(uom => 
        uom.name.toLowerCase().includes(search.toLowerCase()) || 
        (uom.symbol && uom.symbol.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AppLayout title="Satuan Ukur (UoM)">
            <Head title="Satuan Ukur (UoM) - FruityPOS" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Data Satuan Ukur (UoM)</h1>
                        <p className="text-sm text-slate-500 mt-1">Kelola standar gramasi dan unit pack inventori Anda.</p>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah UoM
                    </button>
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
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative max-w-md">
                            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Cari nama satuan atau simbol..." 
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
                                    <th className="py-4 px-6 font-semibold text-slate-600">ID</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600">Nama Satuan</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600">Simbol</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 w-1/3">Deskripsi</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/80">
                                {filteredUoms.length > 0 ? filteredUoms.map(uom => (
                                    <tr key={uom.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6 font-mono text-xs text-slate-500">
                                            UM-{uom.id.toString().padStart(3, '0')}
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-slate-800">
                                            {uom.name}
                                        </td>
                                        <td className="py-4 px-6">
                                            {uom.symbol ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 font-mono">
                                                    {uom.symbol}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 truncate max-w-[200px]" title={uom.description}>
                                            {uom.description || <span className="italic opacity-50">Tidak ada deskripsi</span>}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(uom)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(uom.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-500">
                                            Tidak ada data Satuan Ukur ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-800 flex items-center gap-2">
                                            <Scale className="w-5 h-5 text-emerald-500"/>
                                            {isEdit ? 'Edit Satuan Ukur' : 'Tambah Satuan Ukur'}
                                        </Dialog.Title>
                                        <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <form onSubmit={submit} className="p-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                                    Nama Satuan (UoM) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'} focus:ring-2 focus:ring-opacity-20 outline-none transition-all`}
                                                    placeholder="Contoh: Kilogram"
                                                    disabled={processing}
                                                    required
                                                />
                                                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                                    Simbol (Singkatan)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.symbol}
                                                    onChange={e => setData('symbol', e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:ring-2 focus:ring-opacity-20 outline-none transition-all"
                                                    placeholder="Contoh: Kg"
                                                    disabled={processing}
                                                />
                                                {errors.symbol && <p className="text-red-500 text-xs mt-1 font-medium">{errors.symbol}</p>}
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
                                                    placeholder="Keterangan..."
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
                                                {processing ? 'Menyimpan...' : 'Simpan UoM'}
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
