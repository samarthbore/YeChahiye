import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
    size?: 'sm' | 'md';
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'sm',
    className = '',
}) => {
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-orange-100 text-orange-700',
        secondary: 'bg-purple-100 text-purple-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        error: 'bg-red-100 text-red-700',
        outline: 'border border-gray-300 text-gray-600 bg-transparent',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    return (
        <span
            className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
        >
            {children}
        </span>
    );
};

export default Badge;
