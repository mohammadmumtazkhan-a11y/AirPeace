'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            fullWidth = true,
            disabled,
            className = '',
            ...props
        },
        ref
    ) => {
        const variants = {
            primary: 'bg-gradient-to-r from-airpeace-navy to-airpeace-blue text-white shadow-lg shadow-airpeace-navy/25 hover:shadow-xl hover:shadow-airpeace-navy/30',
            secondary: 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg shadow-gray-900/25',
            outline: 'bg-transparent border-2 border-airpeace-navy text-airpeace-navy hover:bg-airpeace-navy/5',
            ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
        };

        const sizes = {
            sm: 'px-4 py-2 text-sm min-h-[40px]',
            md: 'px-6 py-3 text-base min-h-[48px]',
            lg: 'px-8 py-4 text-lg min-h-[56px]',
        };

        return (
            <motion.button
                ref={ref}
                disabled={disabled || isLoading}
                className={`
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          rounded-xl font-semibold
          transition-all duration-200 ease-out
          flex items-center justify-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
                whileHover={disabled || isLoading ? {} : { scale: 1.01 }}
                whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
                {...props}
            >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
