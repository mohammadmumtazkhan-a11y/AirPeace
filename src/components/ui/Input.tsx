'use client';

import { motion } from 'framer-motion';
import { forwardRef, InputHTMLAttributes, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const hasValue = props.value && String(props.value).length > 0;

        return (
            <motion.div
                className="relative w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div className="relative">
                    <input
                        ref={ref}
                        {...props}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                        className={`
              w-full px-4 pt-6 pb-2 
              bg-white/80 backdrop-blur-sm
              border-2 rounded-xl
              text-gray-900 text-base
              transition-all duration-200
              min-h-[56px]
              ${error
                                ? 'border-red-400 focus:border-red-500'
                                : isFocused
                                    ? 'border-airpeace-blue shadow-lg shadow-airpeace-blue/10'
                                    : 'border-gray-200 hover:border-gray-300'
                            }
              ${className}
            `}
                        placeholder=" "
                    />
                    <label
                        className={`
              absolute left-4 transition-all duration-200 pointer-events-none
              ${isFocused || hasValue
                                ? 'top-2 text-xs font-medium'
                                : 'top-1/2 -translate-y-1/2 text-base'
                            }
              ${error
                                ? 'text-red-500'
                                : isFocused
                                    ? 'text-airpeace-blue'
                                    : 'text-gray-500'
                            }
            `}
                    >
                        {label}
                    </label>
                </div>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs mt-1 ml-1"
                    >
                        {error}
                    </motion.p>
                )}
            </motion.div>
        );
    }
);

Input.displayName = 'Input';
