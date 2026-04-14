import React from 'react';
import { usePage } from '@inertiajs/react';

export default function Header({ title }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};

    return (
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
            <div className="text-text-secondary text-sm font-medium">
                Home / <span className="text-text-primary capitalize">{title || 'Dashboard'}</span>
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
