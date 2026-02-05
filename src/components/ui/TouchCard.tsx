'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface TouchCardProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary';
    disabled?: boolean;
}

export function TouchCard({
    icon: Icon,
    title,
    subtitle,
    onClick,
    variant = 'default',
    disabled = false,
}: TouchCardProps) {
    const variants = {
        default: 'bg-white hover:bg-slate-50 border-slate-200',
        primary: 'bg-white hover:bg-slate-50 border-airpeace-blue/30 shadow-sm',
        secondary: 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm',
    };

    const iconVariants = {
        default: 'bg-slate-100 text-slate-600',
        primary: 'bg-airpeace-blue/10 text-airpeace-blue',
        secondary: 'bg-amber-100 text-amber-700',
    };

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`
        w-full p-5 rounded-xl border
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        touch-card
        flex items-center gap-4 text-left
        group relative overflow-hidden
      `}
            whileHover={disabled ? {} : { scale: 1.01, y: -1 }}
            whileTap={disabled ? {} : { scale: 0.99 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Icon */}
            <div className={`
        w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
        ${variant === 'primary' ? iconVariants.primary : (variant === 'secondary' ? iconVariants.secondary : iconVariants.default)}
      `}>
                <Icon className="w-6 h-6" strokeWidth={2.5} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-airpeace-blue transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-slate-500 truncate mt-0.5">
                    {subtitle}
                </p>
            </div>

            {/* Chevron */}
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-airpeace-blue transition-colors" />
        </motion.button>
    );
}
