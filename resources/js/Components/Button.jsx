import React from 'react';

export default function Button({ 
    variant = 'primary', 
    type = 'button', 
    className = '', 
    disabled, 
    children, 
    ...props 
}) {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
        primary: 'bg-[#2C6E49] text-white hover:bg-[#245A3D]',
        secondary: 'bg-transparent text-[#1C1C1C] border border-[#E5E7EB] hover:bg-[#F3F4F6]',
        danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
        ghost: 'bg-transparent text-[#6B7280] hover:bg-[#F3F4F6]',
    };

    return (
        <button
            type={type}
            className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
