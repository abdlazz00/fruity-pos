import React from 'react';

export default function KpiCard({ label, value, icon, colorClass, subtext }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 border-l-4 ${colorClass.split(' ')[0]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
                    {subtext && <p className={`text-xs mt-1 font-medium ${colorClass.split(' ')[1] || 'text-gray-500'}`}>{subtext}</p>}
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 ${colorClass.split(' ')[1] || 'text-gray-500'}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
