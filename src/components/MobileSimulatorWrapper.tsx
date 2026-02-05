'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MobileSimulatorWrapperProps {
    children: ReactNode;
}

export function MobileSimulatorWrapper({ children }: MobileSimulatorWrapperProps) {
    return (
        <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-[400px] h-[850px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-slate-900"
            >
                {/* Dynamic Island / Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-slate-900 rounded-b-xl z-50 flex items-center justify-center gap-2">
                    <div className="w-16 h-4 bg-gray-800 rounded-full opacity-50"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full opacity-50"></div>
                </div>

                {/* Content Container - Scrollable */}
                <div className="h-full w-full overflow-y-auto overflow-x-hidden pt-8 bg-white no-scrollbar">
                    {children}
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full z-50 pointer-events-none"></div>
            </motion.div>
        </div>
    );
}
