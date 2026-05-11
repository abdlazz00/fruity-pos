import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function LowStockWidget({ locationId }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get('/api/reorder-points/low-stock', { params: { location_id: locationId } })
            .then(res => {
                setAlerts(res.data.alerts || []);
            })
            .catch(err => console.error("Failed to fetch low stock alerts", err))
            .finally(() => setLoading(false));
    }, [locationId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <svg className="w-10 h-10 mb-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium text-gray-500">Stok Aman</p>
                <p className="text-sm">Tidak ada produk di bawah batas minimum.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-gray-900">{alert.product?.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{alert.location?.name}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            Min: {parseFloat(alert.min_quantity).toString()} {alert.product?.base_uom}
                        </span>
                    </div>
                </div>
            ))}
            
            {alerts.length > 5 && (
                <div className="p-3 text-center bg-gray-50 border-t border-gray-100">
                    <Link href="/inventory/reorder-points" className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">
                        Lihat Semua ({alerts.length})
                    </Link>
                </div>
            )}
        </div>
    );
}
