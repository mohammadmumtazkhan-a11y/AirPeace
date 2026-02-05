'use client';

import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MobileHeaderProps {
    showBack?: boolean;
    onBack?: () => void;
}

export function MobileHeader({ showBack, onBack }: MobileHeaderProps) {
    return (
        <div className="flex items-center justify-between py-2 px-1 relative">
            {/* Left: Back Button or Placeholder */}
            <div className="w-16 flex justify-start">
                {showBack && (
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-700" />
                    </button>
                )}
            </div>

            {/* Center: Logo */}
            <div className="flex-1 flex justify-center">
                <AirPeaceLogoBrand />
            </div>

            {/* Right: Secure Badge */}
            <div className="w-16 flex justify-end">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50/80 rounded-full border border-green-100 shadow-sm">
                    <span className="text-[10px] font-semibold text-green-700">Secure</span>
                </div>
            </div>
        </div>
    );
}

function AirPeaceLogoBrand() {
    return (
        <div className="flex items-center justify-center gap-2">
            {/* Icon: Bird in Red Arc */}
            <div className="relative w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Red Arc */}
                    <path
                        d="M 10 60 A 45 45 0 1 1 90 60"
                        fill="none"
                        stroke="#C8102E"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    {/* Blue Bird Abstract */}
                    <path
                        d="M 20 55 Q 40 40 60 55 T 95 45 L 85 65 Q 60 75 30 65 Z"
                        fill="#003366"
                    />
                </svg>
            </div>

            {/* Text: AIR PEACE */}
            <div className="flex flex-col leading-none">
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-airpeace-navy tracking-tight italic" style={{ fontFamily: 'Arial, sans-serif' }}>AIR</span>
                    <span className="text-lg font-black text-airpeace-navy tracking-tight italic" style={{ fontFamily: 'Arial, sans-serif' }}>PEACE</span>
                </div>
                <span className="text-[6px] text-airpeace-red font-medium tracking-wider italic text-right -mt-0.5">...your peace, our goal</span>
            </div>
        </div>
    );
}
