'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Info } from 'lucide-react';

interface SuccessScreenProps {
    isConnecting: boolean;
}

export function SuccessScreen({ isConnecting }: SuccessScreenProps) {
    // Stage 1: Identity Verified (Simulate connecting time) -> Stage 2: Payment Successful
    const [stage, setStage] = useState<'verified' | 'success'>('verified');

    useEffect(() => {
        if (!isConnecting) {
            // After "Identity Verified" mounts, wait 3 seconds then show "Payment Successful"
            const timer = setTimeout(() => {
                setStage('success');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isConnecting]);

    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-white to-green-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <AnimatePresence mode="wait">
                {isConnecting ? (
                    <motion.div
                        key="connecting"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-full bg-airpeace-blue/10 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-airpeace-blue animate-spin" />
                            </div>
                            <motion.div
                                className="absolute inset-0 rounded-full border-4 border-airpeace-blue/30"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Connecting to Bank...</h2>
                        <p className="text-slate-500 mb-4">Launching secure payment interface</p>
                    </motion.div>
                ) : stage === 'verified' ? (
                    <motion.div
                        key="verified"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0, y: -20 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        {/* Premium Success Animation */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="relative mb-8"
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-200 relative z-10">
                                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={3} />
                            </div>
                        </motion.div>

                        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Identity Verified</h2>
                        <p className="text-slate-500 mb-10 max-w-xs px-4 text-center leading-relaxed">
                            Your identity has been successfully confirmed.
                        </p>

                        {/* Premium Summary Card */}
                        <motion.div
                            className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50 ring-1 ring-slate-100"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                        {/* Abstract Bank Icon */}
                                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Beneficiary</p>
                                        <p className="text-lg font-bold text-slate-900">Air Peace Ltd</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent w-full mb-6"></div>

                            <div className="flex flex-col items-center justify-center">
                                <span className="text-sm font-medium text-slate-400 mb-1">Total Amount</span>
                                <span className="text-4xl font-black text-slate-900 tracking-tight">£550.00</span>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="payment-success"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center w-full max-w-[340px] bg-white rounded-3xl p-8 shadow-2xl"
                    >
                        {/* Logos */}
                        <div className="mb-6 flex items-center justify-center gap-4">
                            {/* AirPeace Logo (Top in Layout) */}
                            <div className="flex items-center justify-center mb-8 w-full absolute top-0 left-0 pt-8 opacity-0 pointer-events-none">
                                {/* Hidden but kept for structure if needed later */}
                            </div>
                        </div>

                        {/* Air Peace Logo Header */}
                        <div className="w-full mb-8">
                            <div className="flex items-center justify-center gap-2">
                                {/* SVG Logo - Same as MobileHeader but slightly larger */}
                                <div className="relative w-10 h-10 flex items-center justify-center">
                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                        <path d="M 10 60 A 45 45 0 1 1 90 60" fill="none" stroke="#C8102E" strokeWidth="8" strokeLinecap="round" />
                                        <path d="M 20 55 Q 40 40 60 55 T 95 45 L 85 65 Q 60 75 30 65 Z" fill="#003366" />
                                    </svg>
                                </div>
                                <div className="flex flex-col leading-none text-left">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-black text-airpeace-navy tracking-tighter italic font-sans">AIR</span>
                                        <span className="text-xl font-black text-airpeace-navy tracking-tighter italic font-sans text-airpeace-red">PEACE</span>
                                    </div>
                                    <span className="text-[7px] text-airpeace-red font-medium tracking-wider italic">...your peace, our goal</span>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-slate-800 mb-8">Payment successful</h2>

                        {/* Partner Logos - Interlocking Layout */}
                        <div className="flex items-center justify-center mb-6 relative">


                            {/* RedPay Logo - Larger (h-16) to match optical weight */}
                            <div className="h-16 w-auto relative z-20 mt-1">
                                <img
                                    src="/images/redpay-logo.png"
                                    alt="RedPay"
                                    className="h-full w-auto object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerHTML = '<div class="h-full px-2 flex items-center justify-center bg-red-100 rounded text-[10px] text-red-600 font-bold">RedPay</div>';
                                    }}
                                />
                            </div>
                        </div>



                        {/* Info Box */}
                        <div className="w-full bg-blue-50/80 rounded-xl p-4 flex gap-3 text-left">
                            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-600 leading-snug">
                                You'll now be redirected to merchant site to complete your transaction
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

interface FailureScreenProps {
    attemptsExhausted: boolean;
    onRetry?: () => void;
}

export function FailureScreen({ attemptsExhausted }: FailureScreenProps) {
    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-white to-red-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="flex flex-col items-center text-center max-w-sm"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6"
                >
                    <XCircle className="w-12 h-12 text-red-600" />
                </motion.div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">Transaction Declined</h2>
                <p className="text-slate-500 mb-6">
                    {attemptsExhausted
                        ? 'Maximum verification attempts exceeded. For security reasons, this transaction has been blocked.'
                        : 'We were unable to verify your identity. Please contact support for assistance.'}
                </p>

                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-left w-full">
                    <p className="text-sm text-red-700">
                        <strong>What to do next:</strong>
                    </p>
                    <ul className="text-sm text-red-600 mt-2 space-y-1 list-disc list-inside">
                        <li>Contact AirPeace support</li>
                        <li>Try an alternative payment method</li>
                        <li>Book again with correct details</li>
                    </ul>
                </div>

                <div className="mt-8 flex items-center gap-2 text-slate-400">
                    <span className="text-xs">Reference your booking:</span>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">Contact Support</span>
                </div>
            </motion.div>
        </motion.div>
    );
}
