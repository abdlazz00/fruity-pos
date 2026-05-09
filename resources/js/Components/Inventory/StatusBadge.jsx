import React from 'react';

const statusConfig = {
    // Mutasi
    preparing:   { label: 'Preparing',   color: 'amber' },
    shipped:     { label: 'Shipped',     color: 'blue' },
    received:    { label: 'Received',    color: 'emerald' },
    completed:   { label: 'Completed',   color: 'green' },
    
    // Waste
    pending:     { label: 'Pending',     color: 'amber' },
    approved:    { label: 'Approved',    color: 'green' },
    rejected:    { label: 'Rejected',    color: 'red' },
    
    // Opname
    in_progress: { label: 'In Progress', color: 'blue' },
    submitted:   { label: 'Submitted',   color: 'amber' },
    // approved sudah ada di atas
};

const colorClasses = {
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200', // Untuk received (hijau muda)
    green: 'bg-green-100 text-green-800 border-green-200',         // Untuk completed/approved (hijau tua)
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function StatusBadge({ status }) {
    const config = statusConfig[status] || { label: status, color: 'gray' };
    const classes = colorClasses[config.color] || colorClasses.gray;

    return (
        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${classes} uppercase tracking-wider`}>
            {config.label}
        </span>
    );
}
