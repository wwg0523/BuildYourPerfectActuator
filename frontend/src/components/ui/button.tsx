import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline';
};

export const Button: React.FC<ButtonProps> = ({ variant = 'default', className = '', ...props }) => {
    const base = 'px-4 py-2 rounded-lg font-semibold transition-all';
    const styles =
        variant === 'outline'
            ? 'border border-gray-400 text-gray-700 bg-white hover:bg-gray-100'
            : 'bg-blue-500 text-white hover:bg-blue-600';

    return <button {...props} className={`${base} ${styles} ${className}`} />;
};