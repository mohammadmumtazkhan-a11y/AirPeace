// ==========================================
// GLOBAL TYPES & CONFIG - MITO v3 Payment
// ==========================================

export const MAX_KYC_ATTEMPTS = 3;
export const PAYMENT_TIMEOUT_MINUTES = 10;
export const KYC_PROFILE_VALIDITY_DAYS = 180;

// Payment mode - Self means Passenger is Payer
export type PayerMode = 'SELF' | 'THIRD_PARTY';

// Entity type for KYC
export type EntityType = 'INDIVIDUAL' | 'COMPANY';

// Flow steps
export type FlowStep = 1 | 2 | 3 | 4;

// Incoming data from OnePipe (V2 API)
export interface IncomingData {
    passengerName?: string;
    passengerEmail?: string;
    passengerPhone?: string;
    ticketRef: string;
    amount: number;
    currency: string;
}

// Form data for payer
export interface PayerFormData {
    // Company fields (optional)
    companyName?: string;
    registrationNumber?: string;

    // Personal fields (required for both Individual & Company director)
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;

    // Address
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
}

// Flow state
export interface FlowState {
    step: FlowStep;
    payerMode: PayerMode | null;
    entityType: EntityType;
    kycAttempts: number;
    formData: PayerFormData;
    isVerifying: boolean;
    verificationError: string | null;
}

// Initial form data
export const initialFormData: PayerFormData = {
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
};

// Mock incoming data for demo
export const mockIncomingData: IncomingData = {
    passengerName: 'John Doe',
    passengerEmail: 'john.doe@email.com',
    passengerPhone: '+44 7911 123456',
    ticketRef: 'BNSCD1234567788TG',
    amount: 550.00,
    currency: 'GBP',
};

// ==========================================
// V3: ONBOARDED USER (Repeat User Support)
// ==========================================
export interface OnboardedUser {
    email: string;
    formData: PayerFormData;
    entityType: EntityType;
    payerMode: PayerMode;
    kycVerifiedAt: string; // ISO date string
    bankAccountHint?: string; // Last 4 digits of verified bank
}

const ONBOARDED_USER_KEY = 'mito_onboarded_user';

// Check if a user is already onboarded (by email)
export function getOnboardedUser(email: string): OnboardedUser | null {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(ONBOARDED_USER_KEY);
        if (!stored) return null;
        const user: OnboardedUser = JSON.parse(stored);
        // Match by email (case-insensitive)
        if (user.email.toLowerCase() === email.toLowerCase()) {
            return user;
        }
        return null;
    } catch {
        return null;
    }
}

// Save a user as onboarded after successful KYC
export function saveOnboardedUser(
    formData: PayerFormData,
    entityType: EntityType,
    payerMode: PayerMode
): void {
    if (typeof window === 'undefined') return;
    const user: OnboardedUser = {
        email: formData.email,
        formData,
        entityType,
        payerMode,
        kycVerifiedAt: new Date().toISOString(),
        bankAccountHint: '****1234', // Mock bank hint
    };
    localStorage.setItem(ONBOARDED_USER_KEY, JSON.stringify(user));
}

// Clear onboarded user (for testing)
export function clearOnboardedUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ONBOARDED_USER_KEY);
}

// Determine whether a stored KYC profile can still use the repeat-user shortcut.
export function isOnboardedUserFresh(user: OnboardedUser): boolean {
    const verifiedAtMs = new Date(user.kycVerifiedAt).getTime();
    if (Number.isNaN(verifiedAtMs)) return false;

    const ageMs = Date.now() - verifiedAtMs;
    const maxAgeMs = KYC_PROFILE_VALIDITY_DAYS * 24 * 60 * 60 * 1000;
    return ageMs <= maxAgeMs;
}
