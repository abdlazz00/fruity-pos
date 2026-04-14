import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Sidebar({ isCollapsed, setCollapsed }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const role = user.role;

    const ownerMenu = [
        { label: 'Dashboard', url: '/dashboard', icon: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z' },
        { label: 'Kelola Toko', url: '/stores', icon: 'M3 21h18 M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16 M9 21v-5a2 2 0 012-2h2a2 2 0 012 2v5' },
        { label: 'Kelola User', url: '/users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    ];

    const stockistMenu = [
        { label: 'Data Master Produk', url: '/master/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    ];

    const kasirMenu = [
        { label: 'POS Offline', url: '/pos/offline', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11.2M9 20a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z' },
    ];

    const adminMenu = [
        { label: 'POS Online', url: '/pos/online', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
    ];

    let menus = [];
    if (role === 'owner') menus = ownerMenu;
    else if (role === 'stockist') menus = stockistMenu;
    else if (role === 'kasir') menus = kasirMenu;
    else if (role === 'admin') menus = adminMenu;

    return (
        <aside className={`fixed top-0 left-0 h-full bg-primary text-white transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-16' : 'w-60'}`}>
            <div className="flex items-center space-x-2 px-4 py-5 border-b border-white/10 shrink-0">
                <div className="w-6 h-6 rounded-full bg-orange-500 shrink-0"></div>
                {!isCollapsed && <span className="text-lg font-bold">FruityPOS</span>}
            </div>

            <div className="p-3 shrink-0">
                <div className="bg-white/10 rounded-lg p-3 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold shrink-0 text-sm">
                        {user.name?.charAt(0)}
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <div className="font-bold text-sm truncate">{user.name}</div>
                            <div className="text-xs text-white/60 capitalize truncate">{role} {user.location?.name && `· ${user.location.name}`}</div>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menus.map((menu, idx) => {
                    const isActive = window.location.pathname.startsWith(menu.url);
                    return (
                        <Link
                            key={idx}
                            href={menu.url}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                                isActive ? 'bg-secondary border-l-4 border-accent text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                            title={isCollapsed ? menu.label : ""}
                        >
                            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menu.icon} />
                            </svg>
                            {!isCollapsed && <span className="text-sm font-medium">{menu.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-3 border-t border-white/10 shrink-0 space-y-2">
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors w-full"
                    title={isCollapsed ? 'Keluar' : ''}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {!isCollapsed && <span className="text-sm">Keluar</span>}
                </Link>
                <button
                    onClick={() => setCollapsed(!isCollapsed)}
                    className="flex flex-row items-center space-x-3 px-3 py-2 rounded-lg text-white/40 hover:text-white transition-colors w-full"
                >
                    <svg className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {!isCollapsed && <span className="text-sm">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
