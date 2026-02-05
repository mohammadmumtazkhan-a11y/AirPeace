'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, CheckCircle, User, Building2, MapPin, Mail, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PayerFormData, EntityType, MAX_KYC_ATTEMPTS } from '@/lib/types';
import { MobileHeader } from '../MobileHeader';

interface ReviewConfirmProps {
    formData: PayerFormData;
    entityType: EntityType;
    isVerifying: boolean;
    kycAttempts: number;
    verificationError: string | null;
    onBack: () => void;
    onSubmit: () => void;
}

export function ReviewConfirm({
    formData,
    entityType,
    isVerifying,
    kycAttempts,
    verificationError,
    onBack,
    onSubmit,
}: ReviewConfirmProps) {
    const isCompany = entityType === 'COMPANY';
    const attemptsRemaining = MAX_KYC_ATTEMPTS - kycAttempts;

    return (
        <motion.div
            className="flex flex-col min-h-screen bg-gradient-to-b from-white to-slate-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
        >
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onBack}
                        disabled={isVerifying}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <MobileHeader />
                    <div className="w-10" />
                </div>

                {/* Progress Bar - Complete */}
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-airpeace-navy to-airpeace-blue"
                        initial={{ width: '66%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-4 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Review Details</h2>
                    </div>
                    <p className="text-slate-500 mb-6">Please confirm your information is correct</p>
                </motion.div>

                {/* Error Banner */}
                {verificationError && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-red-700">Verification Failed</p>
                                <p className="text-sm text-red-600 mt-1">{verificationError}</p>
                                <p className="text-sm font-bold text-red-700 mt-2">
                                    {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                                </p>
                                <p className="text-xs text-red-500 mt-2 italic">
                                    💡 Tip: Check for typos in your Street Name or Postcode
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                >
                    {/* Company Section */}
                    {isCompany && (
                        <div className="p-4 border-b border-slate-100">
                            <div className="flex items-center gap-2 mb-3">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Company Details
                                </span>
                            </div>
                            <div className="space-y-2">
                                <SummaryRow label="Company Name" value={formData.companyName || '-'} />
                                <SummaryRow label="Registration No." value={formData.registrationNumber || '-'} />
                            </div>
                        </div>
                    )}

                    {/* Personal Section */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {isCompany ? 'Director Details' : 'Personal Details'}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <SummaryRow label="Full Name" value={`${formData.firstName} ${formData.lastName}`} />
                            <SummaryRow label="Date of Birth" value={formData.dateOfBirth || '-'} />
                            <div className="flex items-center gap-2 py-1">
                                <Phone className="w-4 h-4 text-slate-300" />
                                <SummaryRow label="Phone" value={formData.phone || '-'} inline />
                            </div>
                            <div className="flex items-center gap-2 py-1">
                                <Mail className="w-4 h-4 text-slate-300" />
                                <SummaryRow label="Email" value={formData.email || '-'} inline />
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Address
                            </span>
                        </div>
                        <div className="space-y-1 text-slate-700">
                            <p>{formData.addressLine1}</p>
                            {formData.addressLine2 && <p>{formData.addressLine2}</p>}
                            <p>{formData.city}, {formData.postalCode}</p>
                            <p>{formData.country}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Warning */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-amber-800">Important</p>
                            <p className="text-sm text-amber-700 mt-1">
                                Details must match your bank account <strong>exactly</strong>.
                                Name or address mismatches will cause verification to fail.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 bg-white border-t border-slate-100">
                <Button
                    onClick={onSubmit}
                    isLoading={isVerifying}
                    disabled={isVerifying || attemptsRemaining <= 0}
                >
                    {isVerifying ? 'Verifying...' : 'Verify & Pay'}
                </Button>
            </div>
        </motion.div>
    );
}

// Summary Row Component
function SummaryRow({
    label,
    value,
    inline = false
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
        <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="text-slate-900 font-medium">{value}</span>
        </div>
    );
}
