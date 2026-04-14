import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth?.user || {};

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />
            
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h1 className="text-2xl font-bold text-text-primary mb-2">Selamat datang, {user.name}! 👋</h1>
                <p className="text-text-secondary font-medium">Anda login sebagai {user.role} {user.location ? `di ${user.location.name}` : '(Semua Toko)'}.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                    <div className="text-[12px] text-text-muted mb-1 font-medium">PENDAPATAN HARI INI</div>
                    <div className="text-2xl font-bold text-text-primary">Rp 0</div>
                    <div className="text-[12px] text-success mt-1">-</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <div className="text-[12px] text-text-muted mb-1 font-medium">LABA KOTOR</div>
                    <div className="text-2xl font-bold text-text-primary">Rp 0</div>
                    <div className="text-[12px] text-success mt-1">-</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <div className="text-[12px] text-text-muted mb-1 font-medium">TRANSAKSI</div>
                    <div className="text-2xl font-bold text-text-primary">0</div>
                    <div className="text-[12px] text-success mt-1">-</div>
                </div>
                <div className="bg-card border-l-[3px] border-l-warning rounded-xl border border-border p-4">
                    <div className="text-[12px] text-text-muted mb-1 font-medium">WASTE PENDING</div>
                    <div className="text-2xl font-bold text-text-primary">0</div>
                    <div className="text-[12px] text-warning mt-1">-</div>
                </div>
            </div>
        </AppLayout>
    );
}
