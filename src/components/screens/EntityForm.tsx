'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Building2, MapPin, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { EntityType, PayerFormData, PayerMode } from '@/lib/types';
import { MobileHeader } from '../MobileHeader';

interface EntityFormProps {
    payerMode: PayerMode | null;
    entityType: EntityType;
    formData: PayerFormData;
    reverifyReason?: string | null;
    onPayerModeChange: (mode: PayerMode) => void;
    onEntityTypeChange: (type: EntityType) => void;
    onFormDataChange: (data: Partial<PayerFormData>) => void;
    onSubmit: () => void;
}

export function EntityForm({
    payerMode,
    entityType,
    formData,
    reverifyReason,
    onPayerModeChange,
    onEntityTypeChange,
    onFormDataChange,
    onSubmit,
}: EntityFormProps) {
    const isCompany = entityType === 'COMPANY';
    const isThirdParty = payerMode === 'THIRD_PARTY';
    const canContinue = Boolean(payerMode);

    const handleToggleChange = (value: string) => {
        onEntityTypeChange(value === 'Company' ? 'COMPANY' : 'INDIVIDUAL');
    };

    return (
        <motion.div
            className="flex min-h-screen flex-col bg-gradient-to-b from-white to-slate-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
        >
            <div className="px-4 pt-4 pb-2">
                <MobileHeader />
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                        className="h-full bg-airpeace-blue"
                        initial={{ width: 0 }}
                        animate={{ width: '50%' }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
                {reverifyReason && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-sm font-semibold text-amber-800">Verification refresh required</p>
                        <p className="mt-1 text-xs text-amber-700">{reverifyReason}</p>
                    </div>
                )}

                <section>
                    <div className="mb-3">
                        <h2 className="text-xl font-bold text-slate-900">Who is paying?</h2>
                        <p className="text-sm text-slate-500">Select the account holder for this payment.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            type="button"
                            onClick={() => onPayerModeChange('SELF')}
                            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                                payerMode === 'SELF'
                                    ? 'border-airpeace-blue bg-airpeace-blue/5'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                            <div className={`rounded-lg p-2 ${payerMode === 'SELF' ? 'bg-airpeace-blue/10' : 'bg-slate-100'}`}>
                                <User className={`h-5 w-5 ${payerMode === 'SELF' ? 'text-airpeace-blue' : 'text-slate-500'}`} />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">Myself</p>
                                <p className="mt-0.5 text-xs text-slate-500">Passenger name and payer name are the same.</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => onPayerModeChange('THIRD_PARTY')}
                            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                                payerMode === 'THIRD_PARTY'
                                    ? 'border-airpeace-blue bg-airpeace-blue/5'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                            <div className={`rounded-lg p-2 ${payerMode === 'THIRD_PARTY' ? 'bg-airpeace-blue/10' : 'bg-slate-100'}`}>
                                <Users className={`h-5 w-5 ${payerMode === 'THIRD_PARTY' ? 'text-airpeace-blue' : 'text-slate-500'}`} />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">Third Party / Travel Agent</p>
                                <p className="mt-0.5 text-xs text-slate-500">Use the payer's legal details exactly as on bank account.</p>
                            </div>
                        </button>
                    </div>
                </section>

                <AnimatePresence mode="wait">
                    {payerMode && (
                        <motion.div
                            key="payer-form"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            className="space-y-6"
                        >
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-airpeace-blue/10 p-2">
                                        {isCompany ? (
                                            <Building2 className="h-5 w-5 text-airpeace-blue" />
                                        ) : (
                                            <User className="h-5 w-5 text-airpeace-blue" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Account Type</h3>
                                        <p className="text-xs text-slate-500">Choose the source account type.</p>
                                    </div>
                                </div>

                                <Toggle
                                    options={['Personal', 'Company']}
                                    value={entityType === 'COMPANY' ? 'Company' : 'Personal'}
                                    onChange={handleToggleChange}
                                />

                                <AnimatePresence>
                                    {isCompany && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                                <p className="text-xs text-amber-800">
                                                    For company payments, provide director details for identity checks.
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
                            </section>

                            <section className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {isCompany ? 'Director Details' : 'Personal Details'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Enter details exactly as they appear on bank records.
                                    </p>
                                </div>

                                {isThirdParty && (
                                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                                        <p className="text-xs text-blue-700">
                                            Third-party payment: enter the payer details, not the passenger details.
                                        </p>
                                    </div>
                                )}

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
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-airpeace-blue/10 p-2">
                                        <MapPin className="h-5 w-5 text-airpeace-blue" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Home Address</h3>
                                        <p className="text-xs text-slate-500">Must match your bank statement address.</p>
                                    </div>
                                </div>

                                <Input
                                    label="House Number"
                                    value={formData.addressLine1}
                                    onChange={(e) => onFormDataChange({ addressLine1: e.target.value })}
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
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="border-t border-slate-100 bg-white p-6 pt-4">
                <Button onClick={onSubmit} disabled={!canContinue}>
                    Review & Continue
                </Button>
            </div>
        </motion.div>
    );
}
