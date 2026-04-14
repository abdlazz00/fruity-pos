import React from 'react';
import { Head } from '@inertiajs/react';

export default function GuestLayout({ children, title }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
            <Head title={title} />
            <div className="w-full max-w-[420px] bg-card p-8 rounded-2xl border border-border">
                {children}
            </div>
        </div>
    );
}
