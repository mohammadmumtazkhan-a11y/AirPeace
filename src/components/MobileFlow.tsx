'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    FlowStep,
    PayerMode,
    EntityType,
    PayerFormData,
    IncomingData,
    initialFormData,
    MAX_KYC_ATTEMPTS,
} from '@/lib/types';
import { ModeSelection } from './screens/ModeSelection';
import { EntityForm } from './screens/EntityForm';
import { ReviewConfirm } from './screens/ReviewConfirm';
import { SuccessScreen, FailureScreen } from './screens/SuccessFailure';

interface MobileFlowProps {
    paymentData: IncomingData;
}

export function MobileFlow({ paymentData }: MobileFlowProps) {
    // ==========================================
    // STATE MANAGEMENT (The Brain)
    // ==========================================
    const [step, setStep] = useState<FlowStep>(1);
    const [payerMode, setPayerMode] = useState<PayerMode | null>(null);
    const [entityType, setEntityType] = useState<EntityType>('INDIVIDUAL');
    const [kycAttempts, setKycAttempts] = useState(0);
    const [formData, setFormData] = useState<PayerFormData>(initialFormData);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [isConnectingPlaid, setIsConnectingPlaid] = useState(false);

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
    // HANDLER: Mode Selection (Screen 1)
    // ==========================================
    const handleModeSelect = useCallback((mode: PayerMode) => {
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

        setStep(2);
    }, [paymentData, clearForm]);

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
    const handleKYCSubmit = useCallback(async () => {
        setIsVerifying(true);
        setVerificationError(null);

        try {
            // Simulate API call to ID3 Global Mini-KYC
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Mock verification logic
            // In production, this would call the actual ID3 Global API
            const mockVerificationResult = simulateKYCVerification(formData);

            if (mockVerificationResult.status === 'PASS') {
                // SUCCESS PATH
                setVerificationSuccess(true);
                setIsConnectingPlaid(true);

                // Simulate Plaid connection
                await new Promise(resolve => setTimeout(resolve, 2000));
                setIsConnectingPlaid(false);

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
    }, [formData, kycAttempts]);

    // ==========================================
    // RENDER LOGIC
    // ==========================================

    // Check if max attempts exceeded
    if (kycAttempts >= MAX_KYC_ATTEMPTS && !verificationSuccess) {
        return <FailureScreen attemptsExhausted={true} />;
    }

    // Success screen
    if (verificationSuccess) {
        return <SuccessScreen isConnecting={isConnectingPlaid} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
            <AnimatePresence mode="wait">
                {/* Screen 1: Mode Selection */}
                {step === 1 && (
                    <ModeSelection
                        key="mode-selection"
                        paymentData={paymentData}
                        onSelect={handleModeSelect}
                    />
                )}

                {/* Screen 2: Entity & Details Form */}
                {step === 2 && payerMode && (
                    <EntityForm
                        key="entity-form"
                        payerMode={payerMode}
                        entityType={entityType}
                        formData={formData}
                        onEntityTypeChange={handleEntityTypeChange}
                        onFormDataChange={handleFormDataChange}
                        onBack={() => setStep(1)}
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
                        onBack={() => setStep(2)}
                        onSubmit={handleKYCSubmit}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ==========================================
// MOCK: KYC Verification Simulation
// ==========================================
function simulateKYCVerification(formData: PayerFormData): { status: 'PASS' | 'FAIL'; message?: string } {
    // For demo/testing purposes:
    // 1. HAPPY PATH: Default to PASS
    // 2. SAD PATH: Trigger failure if First Name contains "Fail"

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
        return { status: 'FAIL', message: 'Missing required information.' };
    }

    // Explicitly trigger failure for testing
    if (formData.firstName.toLowerCase().includes('fail')) {
        return { status: 'FAIL', message: 'Identity verification could not be confirmed.' };
    }

    // Default to PASS for Happy Path
    return { status: 'PASS' };
}
