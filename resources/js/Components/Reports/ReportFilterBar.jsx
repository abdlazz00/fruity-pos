import React from 'react';
import { router } from '@inertiajs/react';

export default function ReportFilterBar({ filters, locations, showDateRange = true, showLocation = true, extraFilters }) {
    const handleChange = (key, value) => {
        router.get(window.location.pathname, { 
            ...filters, 
            [key]: value || undefined 
        }, { preserveState: true, replace: true });
    };

    return (
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-6">
            <span className="text-sm font-medium text-gray-500 mr-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter:
            </span>

            {showDateRange && (
                <div className="flex items-center gap-2">
                    <input 
                        type="date" 
                        className="form-input text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary py-1.5"
                        value={filters.startDate || ''}
                        onChange={(e) => handleChange('start_date', e.target.value)} 
                    />
                    <span className="text-gray-400">—</span>
                    <input 
                        type="date" 
                        className="form-input text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary py-1.5"
                        value={filters.endDate || ''}
                        onChange={(e) => handleChange('end_date', e.target.value)} 
                    />
                </div>
            )}

            {showDateRange && showLocation && <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1"></div>}

            {showLocation && (
                <select 
                    className="form-select text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary py-1.5 min-w-[150px]"
                    value={filters.locationId || ''}
                    onChange={(e) => handleChange('location_id', e.target.value)}
                >
                    <option value="">Semua Toko</option>
                    {locations?.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                </select>
            )}

            {extraFilters && (
                <>
                    <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1"></div>
                    {extraFilters(handleChange)}
                </>
            )}
        </div>
    );
}
