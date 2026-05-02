import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Sidebar({ isCollapsed, setCollapsed }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const role = user.role;
    
    // State to hold expanded menus by label
    const [openMenus, setOpenMenus] = useState(['Inventaris']);

    const toggleSubmenu = (label) => {
        if (openMenus.includes(label)) {
            setOpenMenus(openMenus.filter(item => item !== label));
        } else {
            setOpenMenus([...openMenus, label]);
        }
    };

    const ownerMenu = [
        { label: 'Dashboard', url: '/dashboard', icon: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z' },
        { 
            label: 'Pricing Engine', 
            icon: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z',
            submenus: [
                { label: 'Daftar Harga', url: '/pricing' },
            ]
        },
        { 
            label: 'Inventaris', 
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            submenus: [
                { label: 'Data Produk', url: '/master/products' },
                { label: 'Kategori Produk', url: '/master/categories' },
                { label: 'Satuan Ukur (UoM)', url: '/master/uoms' },
                { label: 'Data Supplier', url: '/master/suppliers' },
            ]
        },
        { 
            label: 'Pengadaan', 
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            submenus: [
                { label: 'Purchase Order', url: '/procurement/purchase-orders' },
                { label: 'Barang Masuk', url: '/procurement/inbounds' },
            ]
        },
        { label: 'Kelola Toko', url: '/stores', icon: 'M3 21h18 M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16 M9 21v-5a2 2 0 012-2h2a2 2 0 012 2v5' },
        { label: 'Kelola User', url: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    ];

    const stockistMenu = [
        { 
            label: 'Inventaris', 
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            submenus: [
                { label: 'Kategori Produk', url: '/master/categories' },
                { label: 'Satuan Ukur (UoM)', url: '/master/uoms' },
                { label: 'Data Produk', url: '/master/products' },
                { label: 'Data Supplier', url: '/master/suppliers' },
            ]
        },
        { 
            label: 'Pengadaan', 
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            submenus: [
                { label: 'Purchase Order', url: '/procurement/purchase-orders' },
                { label: 'Barang Masuk', url: '/procurement/inbounds' },
            ]
        },
    ];

    const kasirMenu = [
        { label: 'POS Offline', url: '/pos/offline', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11.2M9 20a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z' },
        { label: 'Shift Saya', url: '/shift', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    const adminMenu = [
        { label: 'POS Online', url: '/pos/online', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
        { label: 'Shift Saya', url: '/shift', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    let menus = [];
    if (role === 'owner') menus = ownerMenu;
    else if (role === 'stockist') menus = stockistMenu;
    else if (role === 'kasir') menus = kasirMenu;
    else if (role === 'admin') menus = adminMenu;

    // Expand submenus automatically if a child page is active
    useEffect(() => {
        menus.forEach(menu => {
            if (menu.submenus && menu.submenus.some(sub => window.location.pathname.startsWith(sub.url))) {
                if (!openMenus.includes(menu.label)) {
                    setOpenMenus(prev => [...prev, menu.label]);
                }
            }
        });
    }, []);

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

            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto w-full overflow-x-hidden">
                {menus.map((menu, idx) => {
                    const isParentActive = window.location.pathname === menu.url || (menu.submenus && menu.submenus.some(s => window.location.pathname.startsWith(s.url)));
                    const isExpanded = openMenus.includes(menu.label);

                    if (menu.submenus) {
                        return (
                            <div key={idx} className="space-y-1">
                                <button
                                    onClick={() => toggleSubmenu(menu.label)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                        isParentActive ? 'bg-secondary/80 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`}
                                    title={isCollapsed ? menu.label : ""}
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menu.icon} />
                                        </svg>
                                        {!isCollapsed && <span className="text-sm font-medium">{menu.label}</span>}
                                    </div>
                                    {!isCollapsed && (
                                        <svg className={`w-4 h-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </button>
                                
                                {isExpanded && !isCollapsed && (
                                    <div className="ml-10 space-y-1 py-1">
                                        {menu.submenus.map((sub, sIdx) => {
                                            const isActive = window.location.pathname.startsWith(sub.url);
                                            return (
                                                <Link
                                                    key={sIdx}
                                                    href={sub.url}
                                                    className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                                        isActive ? 'text-accent font-medium bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'
                                                    }`}
                                                >
                                                    {sub.label}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={idx}
                            href={menu.url}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                                isParentActive ? 'bg-secondary border-l-4 border-accent text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
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
