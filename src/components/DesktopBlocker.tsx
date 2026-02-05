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
        const symbols: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', NGN: '₦' };
        return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
            {/* AirPeace Header Logo */}
            <div className="fixed top-6 left-8">
                <AirPeaceLogo />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl border-2 border-dashed border-airpeace-blue/40 p-8 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0 bg-gradient-to-br from-airpeace-navy to-airpeace-blue" />
                    </div>

                    <div className="relative z-10">
                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <AirPeaceLogo size="large" />
                        </div>

                        {/* Trust Badge */}
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-200">
                                <Shield className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-slate-600">Payment securely processed via PLAID</span>
                            </div>
                        </div>

                        {/* Timer */}
                        <div className="flex items-center justify-center gap-2 mb-8">
                            <Clock className="w-5 h-5 text-orange-500 timer-pulse" />
                            <span className="text-slate-700">
                                You have <span className="font-bold text-orange-500">{formatTime(timeLeft)}</span> mins to complete payment
                            </span>
                        </div>

                        {/* Payment Details Card */}
                        <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-200">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Total</span>
                                    <span className="text-2xl font-bold text-slate-900">
                                        {formatCurrency(paymentData.amount, paymentData.currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Paying to</span>
                                    <span className="text-slate-700 font-medium">✈ Air Peace via PLAID</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Reference</span>
                                    <span className="text-slate-700 font-mono text-sm">{paymentData.ticketRef}</span>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="flex flex-col items-center">
                            <p className="text-slate-500 text-sm mb-4">Scan QR Code to pay</p>

                            <motion.button
                                onClick={onContinue}
                                className="p-4 bg-white rounded-2xl shadow-lg border border-slate-200 cursor-pointer hover:scale-105 transition-transform"
                                animate={{
                                    boxShadow: [
                                        '0 10px 40px rgba(0, 51, 102, 0.1)',
                                        '0 10px 40px rgba(0, 51, 102, 0.25)',
                                        '0 10px 40px rgba(0, 51, 102, 0.1)',
                                    ]
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

                            <p className="text-xs text-airpeace-blue mt-3 font-medium">Click to continue on this device</p>
                        </div>

                        {/* Legal Text */}
                        <div className="mt-8 text-center space-y-3">
                            <p className="text-xs text-slate-400 leading-relaxed border border-dashed border-slate-300 rounded-lg p-3">
                                By scanning the QR code you give permission to Mito.Money to initiate a payment via PLAID
                                and share your account details with Mito.Money. You also agree to our{' '}
                                <a href="#" className="text-airpeace-blue hover:underline">Terms of Service</a> and{' '}
                                <a href="#" className="text-airpeace-blue hover:underline">Privacy Policy</a>
                            </p>

                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                <Info className="w-4 h-4" />
                                <span className="text-xs">Mito.Money collects payments for AirPeace</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// AirPeace Logo Component
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
            <span className="text-[10px] text-slate-500 italic tracking-wider">...your peace, our goal</span>
        </div>
    );
}
