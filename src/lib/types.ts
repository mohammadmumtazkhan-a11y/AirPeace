// ==========================================
// GLOBAL TYPES & CONFIG - MITO v3 Payment
// ==========================================

export const MAX_KYC_ATTEMPTS = 3;
export const PAYMENT_TIMEOUT_MINUTES = 10;

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
