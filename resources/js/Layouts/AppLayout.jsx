import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';

export default function AppLayout({ children, title, breadcrumbs }) {
    const { auth } = usePage().props;
    const isKasir = auth?.user?.role === 'kasir';
    const [isCollapsed, setCollapsed] = useState(isKasir);

    useEffect(() => {
        if (isKasir) setCollapsed(true);
    }, [isKasir]);

    return (
        <div className="min-h-screen bg-page flex">
            <Sidebar isCollapsed={isCollapsed} setCollapsed={setCollapsed} />
            
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-60'}`}>
                <Header title={title} breadcrumbs={breadcrumbs} />
                
                <main className="flex-1 p-6 overflow-y-auto relative">
                    {usePage().props.flash?.status && (
                        <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg shadow-sm flex items-center">
                            <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-emerald-700 font-medium">{usePage().props.flash.status}</p>
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
