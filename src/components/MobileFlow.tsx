'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import {
    FlowStep,
    PayerMode,
    EntityType,
    PayerFormData,
    IncomingData,
    initialFormData,
    MAX_KYC_ATTEMPTS,
} from '@/lib/types';
import { useOnboardedUser } from '@/hooks/useOnboardedUser';
import { EntityForm } from './screens/EntityForm';
import { ReviewConfirm } from './screens/ReviewConfirm';
import { SuccessScreen, FailureScreen } from './screens/SuccessFailure';

interface MobileFlowProps {
    paymentData: IncomingData;
}

export function MobileFlow({ paymentData }: MobileFlowProps) {
    // ==========================================
    // V3: REPEAT USER DETECTION
    // ==========================================
    const {
        isCheckingOnboarded,
        onboardedUser,
        isRepeatShortcutEligible,
        reverifyReason,
        saveAsOnboarded,
    } = useOnboardedUser(paymentData);

    // ==========================================
    // STATE MANAGEMENT (The Brain)
    // ==========================================
    const [step, setStep] = useState<FlowStep>(2);
    const [payerMode, setPayerMode] = useState<PayerMode | null>(null);
    const [entityType, setEntityType] = useState<EntityType>('INDIVIDUAL');
    const [kycAttempts, setKycAttempts] = useState(0);
    const [formData, setFormData] = useState<PayerFormData>(initialFormData);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [isConnectingPlaid, setIsConnectingPlaid] = useState(false);
    const [isRepeatUser, setIsRepeatUser] = useState(false);

    // ==========================================
    // V3: AUTO-SKIP FOR REPEAT USERS
    // ==========================================
    useEffect(() => {
        if (!isCheckingOnboarded && onboardedUser && isRepeatShortcutEligible) {
            // Repeat user detected! Skip to Review screen
            setPayerMode(onboardedUser.payerMode);
            setEntityType(onboardedUser.entityType);
            setFormData(onboardedUser.formData);
            setIsRepeatUser(true);
            setStep(3); // Jump directly to Review/Confirm
        }
    }, [isCheckingOnboarded, onboardedUser, isRepeatShortcutEligible]);

    useEffect(() => {
        if (!isCheckingOnboarded && onboardedUser && !isRepeatShortcutEligible) {
            // Prefill stale profiles to reduce typing while forcing re-verification.
            setPayerMode(onboardedUser.payerMode);
            setEntityType(onboardedUser.entityType);
            setFormData(onboardedUser.formData);
            setIsRepeatUser(false);
            setStep(2);
        }
    }, [isCheckingOnboarded, onboardedUser, isRepeatShortcutEligible]);

    // ==========================================
    // UTILITY: Clear Form (Critical for Third Party)
    // ==========================================
    const clearForm = useCallback((): PayerFormData => {
        // STRICT: Reset all fields to empty
        // This is a compliance requirement for THIRD_PARTY mode
        return {
            ...initialFormData,
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            postalCode: '',
            country: 'United Kingdom',
            companyName: '',
            registrationNumber: '',
        };
    }, []);

    // ==========================================
    // HANDLER: Payer Mode Selection (Inline on Form)
    // ==========================================
    const handlePayerModeChange = useCallback((mode: PayerMode) => {
        if (payerMode === mode) {
            return;
        }
        setPayerMode(mode);

        if (mode === 'SELF') {
            // Pre-fill with passenger data from OnePipe
            const [firstName, ...lastNameParts] = (paymentData.passengerName || '').split(' ');
            setFormData({
                ...initialFormData,
                firstName: firstName || '',
                lastName: lastNameParts.join(' ') || '',
                email: paymentData.passengerEmail || '',
                phone: paymentData.passengerPhone || '',
            });
        } else {
            // THIRD PARTY: HARD RESET - Clear all data
            // This is a critical compliance requirement
            setFormData(clearForm());
        }
    }, [payerMode, paymentData, clearForm]);

    // ==========================================
    // HANDLER: Entity Type Change
    // ==========================================
    const handleEntityTypeChange = useCallback((type: EntityType) => {
        setEntityType(type);
        if (type === 'INDIVIDUAL') {
            // Clear company fields when switching to Individual
            setFormData(prev => ({
                ...prev,
                companyName: '',
                registrationNumber: '',
            }));
        }
    }, []);

    // ==========================================
    // HANDLER: Form Data Update
    // ==========================================
    const handleFormDataChange = useCallback((data: Partial<PayerFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    }, []);

    // ==========================================
    // HANDLER: KYC Submission (Mock Backend)
    // ==========================================
    const connectToBank = useCallback(async () => {
        setVerificationSuccess(true);
        setIsConnectingPlaid(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsConnectingPlaid(false);
    }, []);

    const handleKYCSubmit = useCallback(async () => {
        setIsVerifying(true);
        setVerificationError(null);

        try {
            if (isRepeatUser) {
                // Repeat users skip Mini-KYC and proceed directly to bank auth.
                await connectToBank();
                return;
            }

            // Simulate API call to ID3 Global Mini-KYC
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Mock verification logic
            // In production, this would call the actual ID3 Global API
            const mockVerificationResult = simulateKYCVerification(formData);

            if (mockVerificationResult.status === 'PASS') {
                // SUCCESS PATH
                // V3: Save user as onboarded for future skip-to-summary
                if (payerMode) {
                    saveAsOnboarded(formData, entityType, payerMode);
                }

                await connectToBank();

                // In production: Create Currency Cloud Virtual Account & launch Plaid
                console.log('KYC Passed - Launching Plaid...');
            } else {
                // FAILURE PATH
                const newAttempts = kycAttempts + 1;
                setKycAttempts(newAttempts);

                if (newAttempts >= MAX_KYC_ATTEMPTS) {
                    setVerificationError('Maximum attempts exceeded. Transaction blocked for compliance.');
                    setStep(4); // Go to failure screen
                } else {
                    setVerificationError(mockVerificationResult.message || 'Name/Address mismatch detected.');
                }
            }
        } catch (error) {
            setVerificationError('An unexpected error occurred. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    }, [isRepeatUser, connectToBank, formData, payerMode, saveAsOnboarded, entityType, kycAttempts]);

    // ==========================================
    // RENDER LOGIC
    // ==========================================

    // Check if max attempts exceeded
    if (kycAttempts >= MAX_KYC_ATTEMPTS && !verificationSuccess) {
        return <FailureScreen attemptsExhausted={true} />;
    }

    if (isCheckingOnboarded) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Checking your saved details...</span>
                </div>
            </div>
        );
    }

    // Success screen
    if (verificationSuccess) {
        return <SuccessScreen isConnecting={isConnectingPlaid} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
            <AnimatePresence mode="wait">
                {/* Screen 1: Unified Form (Payer + Entity + KYC Inputs) */}
                {step === 2 && (
                    <EntityForm
                        key="entity-form"
                        payerMode={payerMode}
                        entityType={entityType}
                        formData={formData}
                        reverifyReason={reverifyReason}
                        onPayerModeChange={handlePayerModeChange}
                        onEntityTypeChange={handleEntityTypeChange}
                        onFormDataChange={handleFormDataChange}
                        onSubmit={() => setStep(3)}
                    />
                )}

                {/* Screen 3: Review & Confirm */}
                {step === 3 && (
                    <ReviewConfirm
                        key="review-confirm"
                        formData={formData}
                        entityType={entityType}
                        isVerifying={isVerifying}
                        kycAttempts={kycAttempts}
                        verificationError={verificationError}
                        isRepeatUser={isRepeatUser}
                        bankAccountHint={onboardedUser?.bankAccountHint}
                        onBack={() => {
                            if (isRepeatUser) setIsRepeatUser(false);
                            setStep(2);
                        }}
                        onChangeDetails={() => {
                            // Use different details for this payment without deleting stored profile.
                            setIsRepeatUser(false);
                            setStep(2);
                        }}
                        onSubmit={handleKYCSubmit}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ==========================================
// MOCK: KYC Verification Simulation with V3 Error Types
// ==========================================
export type KYCErrorType = 'NAME_MISMATCH' | 'ADDRESS_MISMATCH' | 'MISSING_FIELDS' | 'IDENTITY_CHECK_FAILED' | 'UNKNOWN';

interface KYCVerificationResult {
    status: 'PASS' | 'FAIL';
    errorType?: KYCErrorType;
    message?: string;
    affectedField?: string;
}

function simulateKYCVerification(formData: PayerFormData): KYCVerificationResult {
    // For demo/testing purposes:
    // 1. HAPPY PATH: Default to PASS
    // 2. SAD PATHS: Trigger specific failures based on input patterns

    const requiredFields = [
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.phone,
        formData.dateOfBirth,
        formData.addressLine1,
        formData.city,
        formData.postalCode,
    ];

    const allFieldsFilled = requiredFields.every(field => field && field.trim().length > 0);

    if (!allFieldsFilled) {
        return {
            status: 'FAIL',
            errorType: 'MISSING_FIELDS',
            message: 'Please fill in all required fields before continuing.',
        };
    }

    // V3: Specific error triggers for testing
    const firstNameLower = formData.firstName.toLowerCase();
    const lastNameLower = formData.lastName.toLowerCase();

    // Trigger NAME_MISMATCH error
    if (firstNameLower.includes('bob') || firstNameLower.includes('fail')) {
        return {
            status: 'FAIL',
            errorType: 'NAME_MISMATCH',
            message: 'Name does not match your bank account. Please use your full legal name.',
            affectedField: 'name',
        };
    }

    // Trigger ADDRESS_MISMATCH error
    const addressForValidation = `${formData.addressLine1} ${formData.addressLine2 || ''}`.toLowerCase();
    if (formData.postalCode.toLowerCase().includes('xx') || addressForValidation.includes('test')) {
        return {
            status: 'FAIL',
            errorType: 'ADDRESS_MISMATCH',
            message: 'Address could not be verified against bank records. Check street name and postcode.',
            affectedField: 'address',
        };
    }

    // Default to PASS for Happy Path
    return { status: 'PASS' };
}
