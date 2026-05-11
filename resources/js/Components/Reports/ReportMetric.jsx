import React from 'react';

export default function ReportMetric({ label, value, color = 'text-gray-900', prefix = '', subtext = '' }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>
                {prefix}{value}
            </p>
            {subtext && (
                <p className="text-xs text-gray-400 mt-1">{subtext}</p>
            )}
        </div>
    );
}
