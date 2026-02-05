'use client';

import { motion } from 'framer-motion';
import { User, Users, Info } from 'lucide-react';
import { TouchCard } from '@/components/ui/TouchCard';
import { PayerMode, IncomingData } from '@/lib/types';
import { MobileHeader } from '../MobileHeader';

interface ModeSelectionProps {
    paymentData: IncomingData;
    onSelect: (mode: PayerMode) => void;
}

export function ModeSelection({ paymentData, onSelect }: ModeSelectionProps) {
    const formatCurrency = (amount: number, currency: string) => {
        const symbols: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', NGN: '₦' };
        return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
    };

    return (
        <motion.div
            className="flex flex-col min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -100 }}
        >
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
                <MobileHeader />

                {/* Payment Summary Mini */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Booking Reference</p>
                            <p className="font-mono text-sm text-slate-900 font-medium">{paymentData.ticketRef}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Amount Due</p>
                            <p className="text-lg font-bold text-airpeace-navy">
                                {formatCurrency(paymentData.amount, paymentData.currency)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 py-4 flex flex-col items-center">
                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8 text-center"
                    >
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            How are you paying?
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Select the option that matches your account
                        </p>
                    </motion.div>

                    <div className="space-y-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <TouchCard
                                icon={User}
                                title="Paying for Myself"
                                subtitle="Bank account matches passenger name"
                                onClick={() => onSelect('SELF')}
                                variant="primary"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <TouchCard
                                icon={Users}
                                title="Paying for Someone Else"
                                subtitle="Or I am a Travel Agent"
                                onClick={() => onSelect('THIRD_PARTY')}
                                variant="secondary"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 mt-auto">
                <p className="text-center text-[10px] text-slate-400 leading-relaxed mb-6 max-w-sm mx-auto">
                    By clicking on the button you give permission to Mito.Money to initiate a payment via PLAID
                    and share your account details with Mito.money. You also agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
                </p>

                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center gap-1.5 opacity-60">
                        <Info className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-400">Mito.Money collects payments for AirPeace</span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 opacity-80 mt-2">
                        <span className="text-[10px] text-slate-400">Secured by</span>
                        <span className="text-[10px] font-bold text-mito-primary">Mito.Money</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
