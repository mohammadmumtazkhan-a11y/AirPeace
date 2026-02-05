'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building2, User, Calendar, Phone, Mail, MapPin, Home } from 'lucide-react';
import { useState } from 'react';
import { Toggle } from '@/components/ui/Toggle';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EntityType, PayerFormData, PayerMode } from '@/lib/types';
import { MobileHeader } from '../MobileHeader';

interface EntityFormProps {
    payerMode: PayerMode;
    entityType: EntityType;
    formData: PayerFormData;
    onEntityTypeChange: (type: EntityType) => void;
    onFormDataChange: (data: Partial<PayerFormData>) => void;
    onBack: () => void;
    onSubmit: () => void;
}

export function EntityForm({
    payerMode,
    entityType,
    formData,
    onEntityTypeChange,
    onFormDataChange,
    onBack,
    onSubmit,
}: EntityFormProps) {
    const [currentStep, setCurrentStep] = useState<'entity' | 'identity' | 'address'>('entity');

    const isCompany = entityType === 'COMPANY';
    const isThirdParty = payerMode === 'THIRD_PARTY';

    const handleToggleChange = (value: string) => {
        onEntityTypeChange(value === 'Company' ? 'COMPANY' : 'INDIVIDUAL');
    };

    const handleNext = () => {
        if (currentStep === 'entity') {
            setCurrentStep('identity');
        } else if (currentStep === 'identity') {
            setCurrentStep('address');
        } else {
            onSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep === 'identity') {
            setCurrentStep('entity');
        } else if (currentStep === 'address') {
            setCurrentStep('identity');
        } else {
            onBack();
        }
    };

    const getProgress = () => {
        if (currentStep === 'entity') return 33;
        if (currentStep === 'identity') return 66;
        return 100;
    };

    return (
        <motion.div
            className="flex flex-col min-h-screen bg-gradient-to-b from-white to-slate-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
        >
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
                <MobileHeader showBack onBack={handleBack} />

                {/* Progress Bar */}
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-3">
                    <motion.div
                        className="h-full bg-airpeace-blue"
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress()}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 px-6 py-4 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {currentStep === 'entity' && (
                        <EntityStep
                            key="entity"
                            entityType={entityType}
                            isCompany={isCompany}
                            formData={formData}
                            onToggleChange={handleToggleChange}
                            onFormDataChange={onFormDataChange}
                        />
                    )}

                    {currentStep === 'identity' && (
                        <IdentityStep
                            key="identity"
                            isCompany={isCompany}
                            isThirdParty={isThirdParty}
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                        />
                    )}

                    {currentStep === 'address' && (
                        <AddressStep
                            key="address"
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 bg-white border-t border-slate-100">
                <Button onClick={handleNext}>
                    {currentStep === 'address' ? 'Review Details' : 'Continue'}
                </Button>
            </div>
        </motion.div>
    );
}

// Entity Type Step
function EntityStep({
    entityType,
    isCompany,
    formData,
    onToggleChange,
    onFormDataChange,
}: {
    entityType: EntityType;
    isCompany: boolean;
    formData: PayerFormData;
    onToggleChange: (value: string) => void;
    onFormDataChange: (data: Partial<PayerFormData>) => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-airpeace-blue/10 rounded-lg">
                    {isCompany ? (
                        <Building2 className="w-5 h-5 text-airpeace-blue" />
                    ) : (
                        <User className="w-5 h-5 text-airpeace-blue" />
                    )}
                </div>
                <h2 className="text-xl font-bold text-slate-900">Account Type</h2>
            </div>
            <p className="text-slate-500 mb-6">What type of bank account will you pay from?</p>

            <Toggle
                options={['Personal', 'Company']}
                value={entityType === 'COMPANY' ? 'Company' : 'Personal'}
                onChange={onToggleChange}
            />

            <AnimatePresence>
                {isCompany && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 space-y-4 overflow-hidden"
                    >
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <p className="text-sm text-amber-800">
                                <strong>Note:</strong> For company accounts, we&apos;ll need details of an authorized director.
                            </p>
                        </div>

                        <Input
                            label="Company Name"
                            value={formData.companyName || ''}
                            onChange={(e) => onFormDataChange({ companyName: e.target.value })}
                        />

                        <Input
                            label="Company Registration Number"
                            value={formData.registrationNumber || ''}
                            onChange={(e) => onFormDataChange({ registrationNumber: e.target.value })}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Identity Step
function IdentityStep({
    isCompany,
    isThirdParty,
    formData,
    onFormDataChange,
}: {
    isCompany: boolean;
    isThirdParty: boolean;
    formData: PayerFormData;
    onFormDataChange: (data: Partial<PayerFormData>) => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
        >
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                    {isCompany ? 'Director Details' : 'Personal Details'}
                </h2>
                <p className="text-slate-500 text-sm">
                    {isCompany
                        ? 'Details of the authorized director making this payment'
                        : 'Enter your details exactly as they appear on your bank account'}
                </p>
                {isThirdParty && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                            <strong>Third Party Payment:</strong> Enter YOUR details (the person paying), not the passenger&apos;s.
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Legal First Name"
                    value={formData.firstName}
                    onChange={(e) => onFormDataChange({ firstName: e.target.value })}
                />
                <Input
                    label="Legal Last Name"
                    value={formData.lastName}
                    onChange={(e) => onFormDataChange({ lastName: e.target.value })}
                />
            </div>

            <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => onFormDataChange({ dateOfBirth: e.target.value })}
            />

            <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormDataChange({ phone: e.target.value })}
            />

            <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => onFormDataChange({ email: e.target.value })}
            />
        </motion.div>
    );
}

// Address Step
function AddressStep({
    formData,
    onFormDataChange,
}: {
    formData: PayerFormData;
    onFormDataChange: (data: Partial<PayerFormData>) => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
        >
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-airpeace-blue/10 rounded-lg">
                        <MapPin className="w-5 h-5 text-airpeace-blue" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Home Address</h2>
                </div>
                <p className="text-slate-500 text-sm">
                    Address must match your bank statement
                </p>
            </div>

            <Input
                label="Address Line 1"
                value={formData.addressLine1}
                onChange={(e) => onFormDataChange({ addressLine1: e.target.value })}
            />

            <Input
                label="Address Line 2 (Optional)"
                value={formData.addressLine2 || ''}
                onChange={(e) => onFormDataChange({ addressLine2: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => onFormDataChange({ city: e.target.value })}
                />
                <Input
                    label="Postcode"
                    value={formData.postalCode}
                    onChange={(e) => onFormDataChange({ postalCode: e.target.value })}
                />
            </div>

            <Input
                label="Country"
                value={formData.country}
                onChange={(e) => onFormDataChange({ country: e.target.value })}
            />
        </motion.div>
    );
}
