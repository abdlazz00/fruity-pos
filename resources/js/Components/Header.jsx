import React from 'react';
import { usePage, Link } from '@inertiajs/react';

export default function Header({ title, breadcrumbs }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};

    return (
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
            <div className="text-text-secondary text-sm font-medium flex items-center gap-2">
                {breadcrumbs ? (
                    breadcrumbs.map((bc, idx) => (
                        <React.Fragment key={idx}>
                            {bc.url ? (
                                <Link href={bc.url} className="hover:text-emerald-600 transition-colors">
                                    {bc.label}
                                </Link>
                            ) : (
                                <span className="text-slate-800 font-semibold">{bc.label}</span>
                            )}
                            {idx < breadcrumbs.length - 1 && <span className="text-slate-300">/</span>}
                        </React.Fragment>
                    ))
                ) : (
                    <>
                        <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">Home</Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-800 font-semibold capitalize">{title || 'Dashboard'}</span>
                    </>
                )}
            </div>
            
            <div className="flex items-center space-x-4">
                <button className="relative text-text-secondary hover:text-text-primary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-danger"></span>
                </button>
                
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-white text-sm">
                        {user.name?.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-text-primary">{user.name}</span>
                </div>
            </div>
        </header>
    );
}
