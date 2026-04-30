import React from 'react';

export default function Badge({ variant = 'default', children, className = '' }) {
    const variants = {
        success: 'bg-[#F0FDF4] text-[#16A34A]', // Aktif / Approved / Locked / Aman / Completed
        warning: 'bg-[#FFFBEB] text-[#EAB308]', // Pending / Warning / Di bawah target / Partially Received
        danger: 'bg-[#FEF2F2] text-[#DC2626]',  // Rejected / Danger / Rendah / Tertinggi / Cancelled
        info: 'bg-[#E6F1FB] text-[#0C447C]',    // Info / Confirmed
        default: 'bg-[#F3F4F6] text-[#9CA3AF]', // Nonaktif / Draft / Belum set
    };

    return (
        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${variants[variant] || variants.default} ${className}`}>
            {children}
        </span>
    );
}
