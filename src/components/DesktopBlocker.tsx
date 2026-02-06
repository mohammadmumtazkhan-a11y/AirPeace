'use client';

import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, Shield, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { IncomingData, PAYMENT_TIMEOUT_MINUTES } from '@/lib/types';

interface DesktopBlockerProps {
    paymentData: IncomingData;
    onContinue?: () => void;
}

export function DesktopBlocker({ paymentData, onContinue }: DesktopBlockerProps) {
    const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT_MINUTES * 60);
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency,
        }).format(amount);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="fixed top-6 left-8">
                <AirPeaceLogo />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-airpeace-blue/40 bg-white p-8 shadow-2xl">
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0 bg-gradient-to-br from-airpeace-navy to-airpeace-blue" />
                    </div>

                    <div className="relative z-10">
                        <div className="mb-6 flex justify-center">
                            <AirPeaceLogo size="large" />
                        </div>

                        <div className="mb-6 flex items-center justify-center gap-2">
                            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-slate-600">Payment securely processed via PLAID</span>
                            </div>
                        </div>

                        <div className="mb-8 flex items-center justify-center gap-2">
                            <Clock className="timer-pulse h-5 w-5 text-orange-500" />
                            <span className="text-slate-700">
                                You have <span className="font-bold text-orange-500">{formatTime(timeLeft)}</span> mins to complete payment
                            </span>
                        </div>

                        <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Total</span>
                                    <span className="text-2xl font-bold text-slate-900">
                                        {formatCurrency(paymentData.amount, paymentData.currency)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Paying to</span>
                                    <span className="font-medium text-slate-700">Air Peace via PLAID</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Reference</span>
                                    <span className="font-mono text-sm text-slate-700">{paymentData.ticketRef}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <p className="mb-4 text-sm text-slate-500">Scan to complete payment securely on your mobile.</p>

                            <motion.button
                                onClick={onContinue}
                                className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-lg transition-transform hover:scale-105"
                                animate={{
                                    boxShadow: [
                                        '0 10px 40px rgba(0, 51, 102, 0.1)',
                                        '0 10px 40px rgba(0, 51, 102, 0.25)',
                                        '0 10px 40px rgba(0, 51, 102, 0.1)',
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <QRCodeSVG
                                    value={currentUrl || 'https://mito.money/pay'}
                                    size={180}
                                    level="H"
                                    includeMargin={false}
                                    bgColor="transparent"
                                />
                            </motion.button>

                            <p className="mt-3 text-xs font-medium text-airpeace-blue">Click to continue on this device</p>
                        </div>

                        <div className="mt-8 space-y-3 text-center">
                            <p className="rounded-lg border border-dashed border-slate-300 p-3 text-xs leading-relaxed text-slate-400">
                                By scanning the QR code you give permission to Mito.Money to initiate a payment via PLAID
                                and share your account details with Mito.Money. You also agree to our{' '}
                                <a href="#" className="text-airpeace-blue hover:underline">Terms of Service</a> and{' '}
                                <a href="#" className="text-airpeace-blue hover:underline">Privacy Policy</a>
                            </p>

                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                <Info className="h-4 w-4" />
                                <span className="text-xs">Mito.Money collects payments for AirPeace</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function AirPeaceLogo({ size = 'normal' }: { size?: 'normal' | 'large' }) {
    const scale = size === 'large' ? 1.5 : 1;

    return (
        <div className="flex flex-col items-center" style={{ transform: `scale(${scale})` }}>
            <div className="flex items-center gap-1">
                <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                    <path d="M8 12C8 12 12 4 20 4C28 4 32 12 32 12" stroke="#003366" strokeWidth="3" fill="none" />
                    <path d="M4 16L20 8L36 16" stroke="#C8102E" strokeWidth="2" fill="none" />
                    <circle cx="20" cy="12" r="3" fill="#003366" />
                </svg>
                <span className="text-2xl font-bold tracking-tight">
                    <span className="text-airpeace-navy">AIR</span>
                    <span className="text-airpeace-red"> PEACE</span>
                </span>
            </div>
            <span className="text-[10px] italic tracking-wider text-slate-500">...your peace, our goal</span>
        </div>
    );
}
