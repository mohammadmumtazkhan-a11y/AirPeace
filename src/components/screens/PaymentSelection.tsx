'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { useState } from 'react';

interface PaymentSelectionProps {
    onSelectMethod: (methodId: string) => void;
}

const PAYMENT_METHODS = [
    {
        id: 'paystack',
        title: 'Paystack',
        description: 'Pay with Local & International cards / Transfers / Bank / DirectDebit by Paystack'
    },
    {
        id: 'globalpay',
        title: 'GlobalPay',
        description: 'Convenient payment via Bank Transfer, Local / International Debit / Credit Cards, and USSD',
        image: '/globalpay-logo.png' // Placeholder for now
    },
    {
        id: 'transfer',
        title: 'Pay with Transfer',
        description: ''
    },
    {
        id: 'mito', // This will be our trigger
        title: 'Pay by Bank (instant transfer)',
        description: 'Secure, fast payment directly from your bank account via Mito',
        isNew: true
    },
    {
        id: 'pay_later',
        title: 'I want to Book On Hold And Pay Later',
        description: ''
    },
    {
        id: 'pay_small',
        title: 'I want to Pay Small Small',
        description: ''
    },
    {
        id: 'flutterwave',
        title: 'I want to pay with Mobile Money/USSD/local/international debit/credit card by Flutterwave.',
        description: 'I want to pay with Mobile Money/USSD/local/international debit/credit card by Flutterwave'
    }
];

export function PaymentSelection({ onSelectMethod }: PaymentSelectionProps) {
    const [agreed, setAgreed] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleContinue = () => {
        if (selectedId && agreed) {
            onSelectMethod(selectedId);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Web Header */}
            <header className="border-b border-gray-200 bg-white shadow-sm relative z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 relative flex flex-col md:flex-row items-center justify-center">
                    {/* Logo - Positioned Absolute Left on Desktop */}
                    <div className="flex items-center gap-2 mb-4 md:mb-0 md:absolute md:left-4 md:top-1/2 md:-translate-y-1/2">
                        {/* Uses the SVG logo we built earlier, essentially */}
                        <AirPeaceLogoWeb />
                    </div>

                    {/* Progress Stepper - Centered by Flex Parent */}
                    <div className="flex items-center gap-0 text-[10px] md:text-xs">
                        <Step label="Flight Selection" status="completed" />
                        <StepDivider status="completed" />
                        <Step label="Passenger" status="completed" />
                        <StepDivider status="completed" />
                        <Step label="Additional Services" status="completed" />
                        <StepDivider status="completed" />
                        <Step label="Payment" status="active" />
                        <StepDivider status="pending" />
                        <Step label="Confirmation" status="pending" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-10">
                <h1 className="text-xl font-bold text-slate-800 mb-8">
                    Please Choose a Payment Method
                </h1>

                <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                        <motion.div
                            key={method.id}
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.995 }}
                            onClick={() => setSelectedId(method.id)}
                            className={`
                 relative p-5 rounded-lg border cursor-pointer transition-all
                 flex items-center justify-between
                 ${selectedId === method.id
                                    ? 'border-airpeace-blue bg-white shadow-md ring-1 ring-airpeace-blue'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}
               `}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-gray-800 text-base">{method.title}</h3>
                                    {method.isNew && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold tracking-wider rounded-sm">
                                            Recommended
                                        </span>
                                    )}
                                </div>
                                {method.description && (
                                    <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 ml-4">
                                {/* Visual indicator for selection */}
                                <div className={`
                    w-5 h-5 rounded-full border flex items-center justify-center
                    ${selectedId === method.id ? 'border-airpeace-blue bg-airpeace-blue' : 'border-gray-300'}
                 `}>
                                    {selectedId === method.id && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <div className="flex items-start gap-3 mb-6">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 w-4 h-4 text-airpeace-blue border-gray-300 rounded focus:ring-airpeace-blue"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                            Please read and accept <a href="#" className="text-airpeace-blue underline">Terms and Conditions</a> AND <a href="#" className="text-airpeace-blue underline">Privacy Policy</a>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <button className="px-8 py-2.5 border border-gray-300 text-gray-600 font-bold text-sm rounded hover:bg-gray-50 uppercase tracking-wide">
                            Back
                        </button>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <span className="text-xs text-gray-500 font-bold block">TOTAL</span>
                                <span className="text-lg font-black text-slate-800">259,600 NGN</span>
                            </div>
                            <button
                                onClick={handleContinue}
                                disabled={!selectedId || !agreed}
                                className={`
                    px-8 py-3 rounded text-sm font-bold uppercase tracking-wide text-white transition-all
                    ${(!selectedId || !agreed)
                                        ? 'bg-slate-300 cursor-not-allowed'
                                        : 'bg-airpeace-blue hover:bg-airpeace-navy shadow-lg'}
                  `}
                            >
                                Make Payment
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Subcomponents for Styled Header
function Step({ label, status }: { label: string; status: 'completed' | 'active' | 'pending' }) {
    const isCompleted = status === 'completed';
    const isActive = status === 'active';

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`
        w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10
        ${isCompleted ? 'bg-airpeace-blue text-white' : ''}
        ${isActive ? 'bg-white border-4 border-airpeace-blue shadow-sm' : ''}
        ${status === 'pending' ? 'bg-white border-2 border-gray-200' : ''}
      `}>
                {isCompleted && <Check className="w-3 h-3" />}
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-airpeace-blue" />}
            </div>
            <span className={`
        ${isActive ? 'text-airpeace-blue font-bold' : 'text-gray-400 font-medium'}
      `}>
                {label}
            </span>
        </div>
    );
}

function StepDivider({ status }: { status: 'completed' | 'active' | 'pending' }) {
    return (
        <div className={`h-[2px] w-8 md:w-16 mb-4 -mx-2 ${status === 'completed' ? 'bg-airpeace-blue' : 'bg-gray-200'}`} />
    );
}

function AirPeaceLogoWeb() {
    return (
        <div className="flex items-center gap-2">
            <svg width="40" height="40" viewBox="0 0 100 100">
                <path d="M 10 60 A 45 45 0 1 1 90 60" fill="none" stroke="#C8102E" strokeWidth="8" strokeLinecap="round" />
                <path d="M 20 55 Q 40 40 60 55 T 95 45 L 85 65 Q 60 75 30 65 Z" fill="#003366" />
            </svg>
            <div>
                <div className="flex gap-1" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                    <span className="text-2xl font-black text-airpeace-navy italic tracking-tighter">AIR</span>
                    <span className="text-2xl font-black text-airpeace-red italic tracking-tighter">PEACE</span>
                </div>
                <p className="text-[9px] text-airpeace-red italic font-serif -mt-1">...your peace, our goal</p>
            </div>
        </div>
    );
}
