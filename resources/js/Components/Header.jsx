import React from 'react';
import { usePage, Link } from '@inertiajs/react';
import NotificationDropdown from './NotificationDropdown';

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
                <NotificationDropdown />
                
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
