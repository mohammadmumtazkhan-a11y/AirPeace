'use client';

import { motion } from 'framer-motion';
import {
    ArrowLeft,
    AlertTriangle,
    CheckCircle,
    User,
    Building2,
    MapPin,
    Mail,
    Phone,
    Sparkles,
    Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PayerFormData, EntityType, MAX_KYC_ATTEMPTS } from '@/lib/types';
import { MobileHeader } from '../MobileHeader';

interface ReviewConfirmProps {
    formData: PayerFormData;
    entityType: EntityType;
    isVerifying: boolean;
    kycAttempts: number;
    verificationError: string | null;
    isRepeatUser?: boolean;
    bankAccountHint?: string;
    onBack: () => void;
    onChangeDetails?: () => void;
    onSubmit: () => void;
}

export function ReviewConfirm({
    formData,
    entityType,
    isVerifying,
    kycAttempts,
    verificationError,
    isRepeatUser = false,
    bankAccountHint,
    onBack,
    onChangeDetails,
    onSubmit,
}: ReviewConfirmProps) {
    const isCompany = entityType === 'COMPANY';
    const attemptsRemaining = MAX_KYC_ATTEMPTS - kycAttempts;

    return (
        <motion.div
            className="flex min-h-screen flex-col bg-gradient-to-b from-white to-slate-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
        >
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="mb-4 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        disabled={isVerifying}
                        className="-ml-2 rounded-full p-2 transition-colors hover:bg-slate-100 disabled:opacity-50"
                    >
                        <ArrowLeft className="h-6 w-6 text-slate-600" />
                    </button>
                    <MobileHeader />
                    <div className="w-10" />
                </div>

                <div className="h-1 overflow-hidden rounded-full bg-slate-200">
                    <motion.div
                        className="h-full bg-gradient-to-r from-airpeace-navy to-airpeace-blue"
                        initial={{ width: '66%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {isRepeatUser ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 p-2">
                                <Sparkles className="h-5 w-5 text-amber-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Welcome Back!</h2>
                        </div>
                        <p className="mb-4 text-slate-500">
                            Hi <span className="font-semibold text-slate-700">{formData.firstName}</span>, paying from your{' '}
                            {bankAccountHint ? `account ${bankAccountHint}` : 'verified account'}?
                        </p>
                        {onChangeDetails && (
                            <button
                                onClick={onChangeDetails}
                                className="inline-flex items-center gap-1.5 text-sm text-airpeace-blue transition-colors hover:text-airpeace-navy"
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                                Use different details
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Review Details</h2>
                        </div>
                        <p className="mb-6 text-slate-500">Please confirm your information is correct</p>
                    </motion.div>
                )}

                {verificationError && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4"
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                            <div className="flex-1">
                                <p className="font-semibold text-red-700">Verification Failed</p>
                                <p className="mt-1 text-sm text-red-600">{verificationError}</p>

                                {verificationError.toLowerCase().includes('name') && (
                                    <div className="mt-3 rounded-lg bg-red-100 p-2">
                                        <p className="text-xs font-medium text-red-800">Check your name matches exactly:</p>
                                        <ul className="mt-1 ml-4 list-disc space-y-0.5 text-xs text-red-700">
                                            <li>Use your full legal name (no nicknames)</li>
                                            <li>Include middle name if on your bank account</li>
                                            <li>Check spelling and spacing</li>
                                        </ul>
                                    </div>
                                )}

                                {verificationError.toLowerCase().includes('address') && (
                                    <div className="mt-3 rounded-lg bg-red-100 p-2">
                                        <p className="text-xs font-medium text-red-800">Check your address matches exactly:</p>
                                        <ul className="mt-1 ml-4 list-disc space-y-0.5 text-xs text-red-700">
                                            <li>Use address registered with your bank</li>
                                            <li>Include flat/apartment number if applicable</li>
                                            <li>Double-check postcode spelling</li>
                                        </ul>
                                    </div>
                                )}

                                <div className="mt-3 flex items-center justify-between border-t border-red-200 pt-2">
                                    <p className="text-sm font-bold text-red-700">
                                        {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                                    </p>
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        className="text-xs font-medium text-red-600 underline hover:text-red-800"
                                    >
                                        Edit details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
                >
                    {isCompany && (
                        <div className="border-b border-slate-100 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Company Details
                                </span>
                            </div>
                            <div className="space-y-2">
                                <SummaryRow label="Company Name" value={formData.companyName || '-'} />
                                <SummaryRow label="Registration No." value={formData.registrationNumber || '-'} />
                            </div>
                        </div>
                    )}

                    <div className="border-b border-slate-100 p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                {isCompany ? 'Director Details' : 'Personal Details'}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <SummaryRow label="Full Name" value={`${formData.firstName} ${formData.lastName}`} />
                            <SummaryRow label="Date of Birth" value={formData.dateOfBirth || '-'} />
                            <div className="flex items-center gap-2 py-1">
                                <Phone className="h-4 w-4 text-slate-300" />
                                <SummaryRow label="Phone" value={formData.phone || '-'} inline />
                            </div>
                            <div className="flex items-center gap-2 py-1">
                                <Mail className="h-4 w-4 text-slate-300" />
                                <SummaryRow label="Email" value={formData.email || '-'} inline />
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Address</span>
                        </div>
                        <div className="space-y-1 text-slate-700">
                            <p>House Number: {formData.addressLine1 || '-'}</p>
                            <p>{formData.city || '-'}, {formData.postalCode || '-'}</p>
                            <p>{formData.country || '-'}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                        <div>
                            <p className="font-semibold text-amber-800">Important</p>
                            <p className="mt-1 text-sm text-amber-700">
                                Details must match your bank account <strong>exactly</strong>. Name or address mismatches
                                will cause verification to fail.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-white p-6 pt-4">
                <Button onClick={onSubmit} isLoading={isVerifying} disabled={isVerifying || attemptsRemaining <= 0}>
                    {isVerifying ? (isRepeatUser ? 'Confirming...' : 'Verifying...') : (isRepeatUser ? 'Confirm & Pay' : 'Verify & Pay')}
                </Button>
            </div>
        </motion.div>
    );
}

function SummaryRow({
    label,
    value,
    inline = false,
}: {
    label: string;
    value: string;
    inline?: boolean;
}) {
    if (inline) {
        return (
            <div className="flex-1">
                <span className="text-slate-700">{value}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="font-medium text-slate-900">{value}</span>
        </div>
    );
}
