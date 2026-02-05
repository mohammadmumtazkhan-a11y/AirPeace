'use client';

import { motion } from 'framer-motion';

interface ToggleProps {
    options: [string, string];
    value: string;
    onChange: (value: string) => void;
}

export function Toggle({ options, value, onChange }: ToggleProps) {
    const activeIndex = options.indexOf(value);

    return (
        <div className="relative w-full bg-gray-100 rounded-xl p-1 flex">
            {/* Sliding indicator */}
            <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-md"
                animate={{ x: activeIndex === 0 ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />

            {options.map((option, index) => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    className={`
            relative z-10 flex-1 py-3 px-4 rounded-lg
            font-medium text-sm transition-colors duration-200
            min-h-[48px]
            ${value === option ? 'text-airpeace-navy' : 'text-gray-500'}
          `}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
