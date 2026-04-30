import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications');
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Polling every 30 seconds as fallback for real-time
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async () => {
        try {
            await axios.post('/api/notifications/mark-read');
            setUnreadCount(0);
            
            // Update local state to show them as read
            const updated = notifications.map(n => ({...n, read_at: new Date().toISOString()}));
            setNotifications(updated);
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const toggleDropdown = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (newState && unreadCount > 0) {
            handleMarkAsRead();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { 
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
        }).format(date);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleDropdown}
                className="relative text-text-secondary hover:text-text-primary p-1 focus:outline-none transition-colors"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-danger rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border bg-gray-50 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-[#1C1C1C]">Notifikasi</h3>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-text-secondary">
                                Tidak ada notifikasi.
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map(notif => {
                                    const isUnread = !notif.read_at;
                                    const data = notif.data || {};
                                    
                                    return (
                                        <div key={notif.id} className={`p-4 transition-colors ${isUnread ? 'bg-[#F0FDF4]/50' : 'hover:bg-gray-50'}`}>
                                            <div className="flex gap-3">
                                                <div className="mt-1 flex-shrink-0">
                                                    {data.type === 'inbound_received' ? (
                                                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                                            <div className={`w-2 h-2 rounded-full ${isUnread ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-[#1C1C1C]">
                                                        {data.message || 'Anda memiliki pemberitahuan baru.'}
                                                    </p>
                                                    <span className="text-xs text-text-muted mt-1 block">
                                                        {formatDate(notif.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-2 border-t border-border bg-gray-50 text-center">
                        <button 
                            className="text-xs text-text-secondary hover:text-primary transition-colors font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
