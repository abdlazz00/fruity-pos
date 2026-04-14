import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';

export default function AppLayout({ children, title }) {
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
                <Header title={title} />
                
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
