import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';

export default function Placeholder({ title }) {
    return (
        <AppLayout title={title}>
            <Head title={title} />
            
            <div className="bg-card border border-border rounded-xl p-6 mb-6 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-text-primary mb-2">Halaman {title}</h1>
                <p className="text-text-secondary text-center max-w-md">Modul ini akan diimplementasikan pada sprint selanjutnya sesuai dengan Blueprint SRS.</p>
            </div>
        </AppLayout>
    );
}
