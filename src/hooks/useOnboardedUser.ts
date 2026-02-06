'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    OnboardedUser,
    PayerFormData,
    EntityType,
    PayerMode,
    IncomingData,
    getOnboardedUser,
    isOnboardedUserFresh,
    saveOnboardedUser,
    clearOnboardedUser,
} from '@/lib/types';

interface UseOnboardedUserResult {
    isCheckingOnboarded: boolean;
    onboardedUser: OnboardedUser | null;
    isRepeatShortcutEligible: boolean;
    reverifyReason: string | null;
    saveAsOnboarded: (formData: PayerFormData, entityType: EntityType, payerMode: PayerMode) => void;
    clearOnboarded: () => void;
}

/**
 * Hook to detect and manage repeat users.
 * Uses the passenger email from IncomingData to check if user is already KYC verified.
 */
export function useOnboardedUser(paymentData: IncomingData): UseOnboardedUserResult {
    const [isCheckingOnboarded, setIsCheckingOnboarded] = useState(true);
    const [onboardedUser, setOnboardedUser] = useState<OnboardedUser | null>(null);
    const [isRepeatShortcutEligible, setIsRepeatShortcutEligible] = useState(false);
    const [reverifyReason, setReverifyReason] = useState<string | null>(null);

    // Check on mount if user is already onboarded
    useEffect(() => {
        if (paymentData.passengerEmail) {
            const user = getOnboardedUser(paymentData.passengerEmail);
            if (user) {
                setOnboardedUser(user);
                if (isOnboardedUserFresh(user)) {
                    setIsRepeatShortcutEligible(true);
                    setReverifyReason(null);
                } else {
                    setIsRepeatShortcutEligible(false);
                    setReverifyReason('Your saved verification has expired. Please confirm your details again.');
                }
            } else {
                setOnboardedUser(null);
                setIsRepeatShortcutEligible(false);
                setReverifyReason(null);
            }
        } else {
            setOnboardedUser(null);
            setIsRepeatShortcutEligible(false);
            setReverifyReason(null);
        }
        setIsCheckingOnboarded(false);
    }, [paymentData.passengerEmail]);

    const saveAsOnboarded = useCallback((
        formData: PayerFormData,
        entityType: EntityType,
        payerMode: PayerMode
    ) => {
        saveOnboardedUser(formData, entityType, payerMode);
        // Update local state
        setOnboardedUser({
            email: formData.email,
            formData,
            entityType,
            payerMode,
            kycVerifiedAt: new Date().toISOString(),
            bankAccountHint: '****1234',
        });
        setIsRepeatShortcutEligible(true);
        setReverifyReason(null);
    }, []);

    const clearOnboarded = useCallback(() => {
        clearOnboardedUser();
        setOnboardedUser(null);
        setIsRepeatShortcutEligible(false);
        setReverifyReason(null);
    }, []);

    return {
        isCheckingOnboarded,
        onboardedUser,
        isRepeatShortcutEligible,
        reverifyReason,
        saveAsOnboarded,
        clearOnboarded,
    };
}
