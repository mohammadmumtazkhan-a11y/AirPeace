'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Info,
  Loader2,
  Pencil,
  RotateCcw,
  Shield,
  User,
  UserCheck,
  X,
} from 'lucide-react';

// ==========================================
// TYPES & CONSTANTS
// ==========================================
type Stage =
  | 'scenario'       // Demo scenario picker
  | 'method'         // Payment method selection
  | 'summary'        // Transaction summary
  | 'recognition'    // Returning user recognition
  | 'details'        // KYC form (new user full form)
  | 'review'         // Returning user review (pre-filled, read-only)
  | 'processing'     // Plaid handoff
  | 'success';       // Payment success

type PayerMode = 'SELF' | 'THIRD_PARTY';
type AccountType = 'PERSONAL' | 'COMPANY';
type UserType = 'NEW' | 'REGISTERED';

interface PayerDetails {
  fullName: string;
  email: string;
  dob: string;
  mobile: string;
  address: string;
  postcode: string;
  country: string;
  companyRegNo: string;
  companyName: string;
  companyAddress: string;
  directorName: string;
}

interface FieldErrors {
  [key: string]: string;
}

interface ToastMessage {
  id: number;
  text: string;
  type: 'error' | 'success';
}

interface DemoScenario {
  id: string;
  label: string;
  userType: UserType;
  payerMode: PayerMode;
  accountType: AccountType;
  description: string;
}

const PASSENGER_DATA: PayerDetails = {
  fullName: 'John Doe',
  email: 'johndoe@email.com',
  dob: '12/08/1990',
  mobile: '+44 7911 123456',
  address: '54 Chevron Drive, Westminster',
  postcode: 'SW1A 1AA',
  country: 'United Kingdom',
  companyRegNo: '',
  companyName: '',
  companyAddress: '',
  directorName: '',
};

const EMPTY_PAYER: PayerDetails = {
  fullName: '',
  email: '',
  dob: '',
  mobile: '',
  address: '',
  postcode: '',
  country: 'United Kingdom',
  companyRegNo: '',
  companyName: '',
  companyAddress: '',
  directorName: '',
};

// Stored profile for registered users (simulates localStorage/backend)
const REGISTERED_PERSONAL_SELF: PayerDetails = {
  fullName: 'John Doe',
  email: 'johndoe@email.com',
  dob: '12/08/1990',
  mobile: '+44 7911 123456',
  address: '54 Chevron Drive, Westminster',
  postcode: 'SW1A 1AA',
  country: 'United Kingdom',
  companyRegNo: '',
  companyName: '',
  companyAddress: '',
  directorName: '',
};

const REGISTERED_PERSONAL_THIRD_PARTY: PayerDetails = {
  fullName: 'Sarah Williams',
  email: 'sarah.williams@email.com',
  dob: '25/03/1985',
  mobile: '+44 7700 900123',
  address: '12 Baker Street, Marylebone',
  postcode: 'NW1 6XE',
  country: 'United Kingdom',
  companyRegNo: '',
  companyName: '',
  companyAddress: '',
  directorName: '',
};

const REGISTERED_COMPANY_SELF: PayerDetails = {
  fullName: 'John Doe',
  email: 'johndoe@email.com',
  dob: '12/08/1990',
  mobile: '+44 7911 123456',
  address: '54 Chevron Drive, Westminster',
  postcode: 'SW1A 1AA',
  country: 'United Kingdom',
  companyRegNo: 'RC 123654',
  companyName: 'Acme Limited',
  companyAddress: '08 James Street, East London',
  directorName: 'John Doe',
};

const REGISTERED_COMPANY_THIRD_PARTY: PayerDetails = {
  fullName: 'Sarah Williams',
  email: 'sarah.williams@email.com',
  dob: '25/03/1985',
  mobile: '+44 7700 900123',
  address: '12 Baker Street, Marylebone',
  postcode: 'NW1 6XE',
  country: 'United Kingdom',
  companyRegNo: 'RC 789012',
  companyName: 'TravelCorp UK Ltd',
  companyAddress: '45 Fleet Street, City of London',
  directorName: 'Sarah Williams',
};

const MOCK_COMPANY_DATA = {
  companyName: 'Acme Limited',
  companyAddress: '08 James Street, East London',
  directors: ['John Doe', 'Jane Smith', 'Michael Brown'],
};

const MAX_ATTEMPTS = 3;

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'new-self-personal',
    label: 'New User — Self — Personal',
    userType: 'NEW',
    payerMode: 'SELF',
    accountType: 'PERSONAL',
    description: 'First-time customer paying for themselves with a personal bank account',
  },
  {
    id: 'new-self-company',
    label: 'New User — Self — Company',
    userType: 'NEW',
    payerMode: 'SELF',
    accountType: 'COMPANY',
    description: 'First-time customer paying for themselves via a company account',
  },
  {
    id: 'new-tp-personal',
    label: 'New User — Third Party — Personal',
    userType: 'NEW',
    payerMode: 'THIRD_PARTY',
    accountType: 'PERSONAL',
    description: 'First-time payer paying on behalf of someone else (personal account)',
  },
  {
    id: 'new-tp-company',
    label: 'New User — Third Party — Company',
    userType: 'NEW',
    payerMode: 'THIRD_PARTY',
    accountType: 'COMPANY',
    description: 'First-time payer paying on behalf of someone else via a company account',
  },
  {
    id: 'reg-self-personal',
    label: 'Registered — Self — Personal',
    userType: 'REGISTERED',
    payerMode: 'SELF',
    accountType: 'PERSONAL',
    description: 'Returning customer recognised by email. Skips form, reviews stored details.',
  },
  {
    id: 'reg-self-company',
    label: 'Registered — Self — Company',
    userType: 'REGISTERED',
    payerMode: 'SELF',
    accountType: 'COMPANY',
    description: 'Returning customer paying via their previously verified company account',
  },
  {
    id: 'reg-tp-personal',
    label: 'Registered — Third Party — Personal',
    userType: 'REGISTERED',
    payerMode: 'THIRD_PARTY',
    accountType: 'PERSONAL',
    description: 'Returning third-party payer with stored personal details',
  },
  {
    id: 'reg-tp-company',
    label: 'Registered — Third Party — Company',
    userType: 'REGISTERED',
    payerMode: 'THIRD_PARTY',
    accountType: 'COMPANY',
    description: 'Returning third-party payer with stored company details',
  },
];

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25, ease: 'easeIn' } },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Helper to get registered user data
function getRegisteredData(payerMode: PayerMode, accountType: AccountType): PayerDetails {
  if (payerMode === 'SELF' && accountType === 'PERSONAL') return { ...REGISTERED_PERSONAL_SELF };
  if (payerMode === 'SELF' && accountType === 'COMPANY') return { ...REGISTERED_COMPANY_SELF };
  if (payerMode === 'THIRD_PARTY' && accountType === 'PERSONAL') return { ...REGISTERED_PERSONAL_THIRD_PARTY };
  return { ...REGISTERED_COMPANY_THIRD_PARTY };
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AirPeacePaymentFlow() {
  const [stage, setStage] = useState<Stage>('scenario');
  const [userType, setUserType] = useState<UserType>('NEW');
  const [payerMode, setPayerMode] = useState<PayerMode>('SELF');
  const [accountType, setAccountType] = useState<AccountType>('PERSONAL');
  const [payer, setPayer] = useState<PayerDetails>({ ...PASSENGER_DATA });
  const [timer, setTimer] = useState(600);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_ATTEMPTS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyLoaded, setCompanyLoaded] = useState(false);
  const [directorLoading, setDirectorLoading] = useState(false);
  const [directorLoaded, setDirectorLoaded] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [recognitionChecking, setRecognitionChecking] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);

  const toastIdRef = useRef(0);
  const companyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (stage === 'scenario' || stage === 'method') return;
    const id = setInterval(() => setTimer((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [stage]);

  const timerDisplay = useMemo(() => {
    const mm = String(Math.floor(timer / 60)).padStart(2, '0');
    const ss = String(timer % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [timer]);

  // Toast management
  const addToast = useCallback((text: string, type: 'error' | 'success' = 'error') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Start scenario
  const handleStartScenario = useCallback((scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setUserType(scenario.userType);
    setPayerMode(scenario.payerMode);
    setAccountType(scenario.accountType);
    setAttemptsRemaining(MAX_ATTEMPTS);
    setFieldErrors({});
    setTimer(600);
    setCompanyLoaded(false);
    setCompanyLoading(false);
    setDirectorLoaded(false);
    setDirectorLoading(false);
    setEditingField(null);
    setIsVerifying(false);

    if (scenario.userType === 'NEW') {
      if (scenario.payerMode === 'SELF') {
        setPayer({ ...PASSENGER_DATA });
      } else {
        setPayer({ ...EMPTY_PAYER });
      }
    } else {
      setPayer(getRegisteredData(scenario.payerMode, scenario.accountType));
    }

    setStage('method');
  }, []);

  // Reset to scenario picker
  const handleRestart = useCallback(() => {
    setStage('scenario');
    setSelectedScenario(null);
    setToasts([]);
  }, []);

  // After summary, fork based on user type
  const handleAfterSummary = useCallback(() => {
    if (userType === 'REGISTERED') {
      setRecognitionChecking(true);
      setStage('recognition');
    } else {
      setStage('details');
    }
  }, [userType]);

  // Payer mode change (only available for new users on the form)
  const handlePayerModeChange = useCallback((mode: PayerMode) => {
    setPayerMode(mode);
    setFieldErrors({});
    setEditingField(null);
    if (mode === 'SELF') {
      setPayer({ ...PASSENGER_DATA });
    } else {
      setPayer({ ...EMPTY_PAYER });
    }
    setCompanyLoaded(false);
    setCompanyLoading(false);
    setDirectorLoaded(false);
    setDirectorLoading(false);
  }, []);

  // Account type change
  const handleAccountTypeChange = useCallback((type: AccountType) => {
    setAccountType(type);
    setFieldErrors({});
    setEditingField(null);
    setCompanyLoaded(false);
    setCompanyLoading(false);
    setDirectorLoaded(false);
    setDirectorLoading(false);
    setPayer((prev) => ({
      ...prev,
      companyRegNo: '',
      companyName: '',
      companyAddress: '',
      directorName: '',
    }));
  }, []);

  // Company registration lookup
  const handleCompanyRegChange = useCallback((val: string) => {
    setPayer((prev) => ({ ...prev, companyRegNo: val }));
    setCompanyLoaded(false);
    setDirectorLoaded(false);
    setDirectorLoading(false);
    if (companyTimerRef.current) clearTimeout(companyTimerRef.current);
    if (val.trim().length >= 4) {
      setCompanyLoading(true);
      companyTimerRef.current = setTimeout(() => {
        setCompanyLoading(false);
        setCompanyLoaded(true);
        setPayer((prev) => ({
          ...prev,
          companyName: MOCK_COMPANY_DATA.companyName,
          companyAddress: MOCK_COMPANY_DATA.companyAddress,
        }));
      }, 1200);
    } else {
      setCompanyLoading(false);
    }
  }, []);

  // Director selection
  const handleDirectorSelect = useCallback((name: string) => {
    setPayer((prev) => ({ ...prev, directorName: name }));
    if (!name) { setDirectorLoaded(false); return; }
    setDirectorLoading(true);
    setTimeout(() => { setDirectorLoading(false); setDirectorLoaded(true); }, 900);
  }, []);

  // Form field change
  const handleFieldChange = useCallback((field: keyof PayerDetails, value: string) => {
    setPayer((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  }, []);

  // Validate and submit (shared by both new user form and returning user review)
  const handleSubmit = useCallback(async () => {
    if (userType === 'NEW') {
      const errors: FieldErrors = {};
      if (accountType === 'PERSONAL') {
        if (!payer.fullName.trim()) errors.fullName = 'Full name is required';
        if (!payer.email.trim()) errors.email = 'Email is required';
        if (!payer.dob.trim()) errors.dob = 'Date of birth is required';
        if (!payer.mobile.trim()) errors.mobile = 'Mobile number is required';
        if (!payer.address.trim()) errors.address = 'Address is required';
        if (!payer.postcode.trim()) errors.postcode = 'Postcode is required';
      } else {
        if (!payer.companyRegNo.trim()) errors.companyRegNo = 'Company registration is required';
        if (!companyLoaded) errors.companyRegNo = 'Please enter a valid company registration';
        if (!payer.directorName.trim()) errors.directorName = 'Please select a director';
        if (!directorLoaded) errors.directorName = 'Please select and wait for director verification';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        addToast('Please fill in all required fields.');
        return;
      }
    }

    setIsVerifying(true);
    setFieldErrors({});
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock KYC check
    const nameToCheck = accountType === 'PERSONAL'
      ? payer.fullName.toLowerCase()
      : payer.directorName.toLowerCase();

    const shouldFail = nameToCheck.includes('fail') || nameToCheck.includes('bob') || nameToCheck.includes('wrong');
    const addressFail = payer.postcode.toLowerCase().includes('xx');

    if (shouldFail || addressFail) {
      const remaining = attemptsRemaining - 1;
      setAttemptsRemaining(remaining);
      if (remaining <= 0) {
        addToast('Maximum verification attempts exceeded. Transaction blocked.', 'error');
        setIsVerifying(false);
        return;
      }
      const errorField = addressFail ? 'address' : accountType === 'PERSONAL' ? 'fullName' : 'directorName';
      const errorMsg = addressFail
        ? 'Address does not match bank records. Please check postcode.'
        : 'Last Name does not match address records.';
      setFieldErrors({ [errorField]: errorMsg });
      addToast(`Verification Failed. ${errorMsg} ${remaining} Attempt${remaining > 1 ? 's' : ''} Remaining.`, 'error');
      setIsVerifying(false);
      return;
    }

    setIsVerifying(false);
    setStage('processing');
  }, [userType, accountType, payer, attemptsRemaining, companyLoaded, directorLoaded, addToast]);

  // Processing -> Success
  useEffect(() => {
    if (stage !== 'processing') return;
    const id = setTimeout(() => setStage('success'), 3000);
    return () => clearTimeout(id);
  }, [stage]);

  // Recognition checking animation
  useEffect(() => {
    if (stage !== 'recognition' || !recognitionChecking) return;
    const id = setTimeout(() => setRecognitionChecking(false), 2000);
    return () => clearTimeout(id);
  }, [stage, recognitionChecking]);

  // ==========================================
  // SCREEN ROUTING
  // ==========================================
  if (stage === 'scenario') {
    return (
      <main className="min-h-screen bg-[#1a1a2e]">
        <ScenarioSelector scenarios={DEMO_SCENARIOS} onSelect={handleStartScenario} />
      </main>
    );
  }

  if (stage === 'method') {
    return (
      <main className="min-h-screen bg-[#ebeced]">
        <MethodSelectionScreen
          onContinue={() => setStage('summary')}
          onBack={handleRestart}
          scenario={selectedScenario}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#474747]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[#efefef]">
        {/* Floating restart button */}
        <button
          onClick={handleRestart}
          className="fixed right-3 top-3 z-50 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#555] shadow-md backdrop-blur-sm hover:bg-white"
        >
          <RotateCcw size={12} /> Switch Flow
        </button>

        {/* Scenario badge */}
        {selectedScenario && (
          <div className="mx-3 mt-2 rounded-lg bg-[#2a5f9e]/10 px-3 py-1.5 text-center">
            <p className="text-[10px] font-semibold text-[#2a5f9e]">
              {selectedScenario.label}
            </p>
          </div>
        )}

        {/* Toast Notifications */}
        <div className="fixed left-1/2 top-10 z-50 w-full max-w-[480px] -translate-x-1/2 px-3">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className={`mb-2 flex items-start gap-2 rounded-lg px-3 py-3 shadow-lg ${
                  toast.type === 'error'
                    ? 'border border-red-200 bg-red-50 text-red-800'
                    : 'border border-green-200 bg-green-50 text-green-800'
                }`}
              >
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p className="flex-1 text-[12px] font-medium leading-snug">{toast.text}</p>
                <button onClick={() => removeToast(toast.id)} className="flex-shrink-0"><X size={14} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Verification overlay */}
        <AnimatePresence>
          {isVerifying && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl">
                <Loader2 className="h-10 w-10 animate-spin text-[#ff4c16]" />
                <p className="text-[14px] font-semibold text-[#444]">Verifying your details...</p>
                <p className="text-[11px] text-[#888]">Checking against bank records</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <HeaderLogo />

        <AnimatePresence mode="wait">
          {stage === 'summary' && (
            <motion.div key="summary" {...pageVariants}>
              <SummaryScreen timer={timerDisplay} onContinue={handleAfterSummary} />
            </motion.div>
          )}

          {stage === 'recognition' && (
            <motion.div key="recognition" {...pageVariants}>
              <RecognitionScreen
                payer={payer}
                payerMode={payerMode}
                accountType={accountType}
                isChecking={recognitionChecking}
                onContinueWithStored={() => setStage('review')}
                onUseDifferent={() => {
                  setUserType('NEW');
                  if (payerMode === 'SELF') setPayer({ ...PASSENGER_DATA });
                  else setPayer({ ...EMPTY_PAYER });
                  setStage('details');
                }}
              />
            </motion.div>
          )}

          {stage === 'details' && (
            <motion.div key="details" {...pageVariants} className="flex-1">
              <DetailsScreen
                payerMode={payerMode}
                accountType={accountType}
                payer={payer}
                fieldErrors={fieldErrors}
                attemptsRemaining={attemptsRemaining}
                companyLoading={companyLoading}
                companyLoaded={companyLoaded}
                directorLoading={directorLoading}
                directorLoaded={directorLoaded}
                editingField={editingField}
                onChangePayer={handlePayerModeChange}
                onChangeAccount={handleAccountTypeChange}
                onFieldChange={handleFieldChange}
                onCompanyRegChange={handleCompanyRegChange}
                onDirectorSelect={handleDirectorSelect}
                onEditField={setEditingField}
                onContinue={handleSubmit}
                onBack={() => setStage('summary')}
              />
            </motion.div>
          )}

          {stage === 'review' && (
            <motion.div key="review" {...pageVariants} className="flex-1">
              <ReviewScreen
                payer={payer}
                payerMode={payerMode}
                accountType={accountType}
                fieldErrors={fieldErrors}
                attemptsRemaining={attemptsRemaining}
                onSubmit={handleSubmit}
                onChangeDetails={() => {
                  setUserType('NEW');
                  setStage('details');
                }}
                onBack={() => setStage('recognition')}
              />
            </motion.div>
          )}

          {stage === 'processing' && (
            <motion.div key="processing" {...pageVariants}>
              <ProcessingScreen timer={timerDisplay} onBack={() => setStage(userType === 'REGISTERED' ? 'review' : 'details')} />
            </motion.div>
          )}

          {stage === 'success' && (
            <motion.div key="success" {...pageVariants}>
              <SuccessScreen onRestart={handleRestart} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ==========================================
// SCENARIO SELECTOR (Demo Entry)
// ==========================================
function ScenarioSelector({
  scenarios,
  onSelect,
}: {
  scenarios: DemoScenario[];
  onSelect: (s: DemoScenario) => void;
}) {
  const newScenarios = scenarios.filter((s) => s.userType === 'NEW');
  const regScenarios = scenarios.filter((s) => s.userType === 'REGISTERED');

  return (
    <div className="mx-auto max-w-[600px] px-4 py-8">
      <div className="text-center">
        <p className="text-[28px] font-black italic leading-none text-[#2a5f9e]">AIR PEACE</p>
        <p className="mt-1 text-[10px] font-semibold italic text-[#be4d44]">...your peace, our goal</p>
        <h1 className="mt-6 text-[22px] font-bold text-white">MITO v3 Payment Flow</h1>
        <p className="mt-1 text-[13px] text-white/60">Select a scenario to preview</p>
      </div>

      {/* New Users */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <User size={16} className="text-[#ff4c16]" />
          <h2 className="text-[15px] font-bold text-white">New / Unregistered Customer</h2>
        </div>
        <div className="grid gap-2">
          {newScenarios.map((s) => (
            <motion.button
              key={s.id}
              onClick={() => onSelect(s)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <p className="text-[13px] font-semibold text-white">{s.label}</p>
              <p className="mt-0.5 text-[11px] text-white/50">{s.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Registered Users */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <UserCheck size={16} className="text-green-400" />
          <h2 className="text-[15px] font-bold text-white">Registered / Returning Customer</h2>
        </div>
        <div className="grid gap-2">
          {regScenarios.map((s) => (
            <motion.button
              key={s.id}
              onClick={() => onSelect(s)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-left backdrop-blur-sm transition-colors hover:bg-green-500/10"
            >
              <p className="text-[13px] font-semibold text-white">{s.label}</p>
              <p className="mt-0.5 text-[11px] text-white/50">{s.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-[11px] text-white/30">Powered by mito.money</p>
    </div>
  );
}

// ==========================================
// SCREEN 1: METHOD SELECTION
// ==========================================
function MethodSelectionScreen({
  onContinue,
  onBack,
  scenario,
}: {
  onContinue: () => void;
  onBack: () => void;
  scenario: DemoScenario | null;
}) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [termsChecked, setTermsChecked] = useState(false);

  const methods = [
    { id: 'paystack', title: 'Paystack', subtitle: 'Pay with Local & International cards / Transfers / Bank / DirectDebit by Paystack' },
    { id: 'globalpay', title: 'GlobalPay', subtitle: 'Convenient payment via Bank Transfer, Local / International Debit / Credit Cards, and USSD', badge: 'GlobalPay' },
    { id: 'transfer', title: 'Pay with Transfer' },
    { id: 'bank', title: 'Pay by Bank (instant transfer)', highlight: true },
    { id: 'hold', title: 'I want to Book On Hold And Pay Later' },
    { id: 'small', title: 'I want to Pay Small Small' },
    { id: 'flutter', title: 'Flutterwave', subtitle: 'I want to pay with Mobile Money/USSD/local/international debit/credit card by Flutterwave' },
  ];

  const canContinue = selectedMethod === 'bank';

  return (
    <div className="mx-auto min-h-screen w-full max-w-[886px] bg-white">
      <div className="flex items-center border-b border-[#dee4ea] px-4 py-3 sm:px-10">
        <div className="w-[170px]"><AirPeaceBrandText size="lg" /></div>
        <DesktopProgress />
      </div>

      <div className="bg-[#f3f4f5] px-4 pb-12 pt-6 sm:px-[74px]">
        {scenario && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#2a5f9e]/10 px-3 py-2">
            <div className={`h-2 w-2 rounded-full ${scenario.userType === 'NEW' ? 'bg-[#ff4c16]' : 'bg-green-500'}`} />
            <p className="text-[11px] font-semibold text-[#2a5f9e]">{scenario.label}</p>
            <button onClick={onBack} className="ml-auto text-[11px] text-[#2a5f9e] underline">Change</button>
          </div>
        )}

        <h2 className="text-[22px] font-semibold text-[#1f1f1f] sm:text-[31px]">Please Choose a Payment Method</h2>

        <div className="mt-5 space-y-1.5">
          {methods.map((method) => {
            const selected = selectedMethod === method.id;
            return (
              <motion.button key={method.id} onClick={() => setSelectedMethod(method.id)} whileTap={{ scale: 0.99 }}
                className={`w-full rounded-[4px] border bg-white px-3 py-3 text-left transition-all ${
                  selected ? 'border-[#89a9d2] shadow-sm' : method.highlight ? 'border-[#ff7043] border-opacity-40' : 'border-[#d8e0e6]'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className={`text-[16px] font-semibold sm:text-[20px] ${method.highlight && !selected ? 'text-[#e64a19]' : 'text-[#2f2f2f]'}`}>{method.title}</p>
                    {method.subtitle && <p className="mt-0.5 text-[12px] text-[#555] sm:text-[13px]">{method.subtitle}</p>}
                  </div>
                  {method.badge && <p className="text-[13px] font-bold text-[#c14a45]">{method.badge}</p>}
                  <ChevronRight size={16} className="text-[#202020]" />
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-2 rounded-[4px] border border-[#d8e0e6] bg-white p-3">
          <p className="text-[16px] font-semibold text-[#2d2d2d]">Mobile Money</p>
          <label className="mt-2 flex items-center gap-2 text-[12px] text-[#444]">
            <input type="checkbox" checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)} className="h-3.5 w-3.5 accent-[#FF5722]" />
            <span>Please read and accept <span className="mx-1 text-[#244f85] underline">Terms and Conditions,</span> AND <span className="ml-1 text-[#244f85] underline">Privacy Policy</span></span>
          </label>
        </div>

        <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onBack} className="rounded-[4px] border border-[#6885a6] bg-[#f8fbff] px-10 py-2.5 text-[12px] font-semibold text-[#3f5f81]">BACK</button>
          <div className="flex items-center justify-between gap-4 sm:gap-6">
            <p className="text-[13px] font-semibold text-[#1f2d3d]">TOTAL £550.00</p>
            <motion.button type="button" disabled={!canContinue} onClick={onContinue} whileTap={canContinue ? { scale: 0.97 } : {}}
              className={`rounded-[4px] px-8 py-2.5 text-[12px] font-semibold text-white transition-colors ${canContinue ? 'bg-[#3457a5] hover:bg-[#2a4a8e]' : 'cursor-not-allowed bg-[#9aa8c9]'}`}>
              Make Payment
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SCREEN 2: TRANSACTION SUMMARY
// ==========================================
function SummaryScreen({ timer, onContinue }: { timer: string; onContinue: () => void }) {
  return (
    <section className="px-3 pb-4">
      <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm">
        <Brand />
        <p className="mt-5 text-center text-[12px] text-[#5f5f5f]">Payment securely processed via <span className="font-semibold">PLAID</span></p>
        <div className="mt-3 flex items-center justify-center gap-2 text-[13px] text-[#3c3c3c]">
          <Clock3 size={14} />
          <p className="font-semibold">You have{' '}<span className={`font-bold ${timer < '05:00' ? 'text-red-600 timer-pulse' : 'text-[#ff4d1b]'}`}>{timer}</span>{' '}mins to make payment</p>
        </div>
        <div className="mt-5 space-y-2 rounded-lg bg-[#f4f4f4] px-4 py-3 text-[13px]">
          <KV label="Total" value="£ 550.00" bold />
          <KV label="Paying to" value="Air Peace via PLAID" />
          <KV label="Reference" value="BNSCD1234567788TG" />
        </div>
        <p className="mx-2 mt-8 text-center text-[11px] leading-5 text-[#666]">
          By clicking on the button you give permission to Mito.Money to initiate a payment via PLAID and share your account details with Mito.money. You also agree to our{' '}
          <span className="text-[#244f85] underline">Terms of Service</span> and{' '}
          <span className="text-[#244f85] underline">Privacy Policy</span>
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#666]">
          <Shield size={13} className="text-[#999]" />
          <span>MitoMoney collects payments for AirPeace</span>
        </div>
        <motion.button onClick={onContinue} whileTap={{ scale: 0.98 }}
          className="mt-8 w-full rounded-lg bg-[#ff4c16] py-3.5 text-[18px] font-bold text-white shadow-md transition-colors hover:bg-[#e64516]">
          Continue to Payment
        </motion.button>
      </div>
    </section>
  );
}

// ==========================================
// RECOGNITION SCREEN (Registered Users Only)
// ==========================================
function RecognitionScreen({
  payer,
  payerMode,
  accountType,
  isChecking,
  onContinueWithStored,
  onUseDifferent,
}: {
  payer: PayerDetails;
  payerMode: PayerMode;
  accountType: AccountType;
  isChecking: boolean;
  onContinueWithStored: () => void;
  onUseDifferent: () => void;
}) {
  const isCompany = accountType === 'COMPANY';

  if (isChecking) {
    return (
      <section className="px-3 pb-4">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-10 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#2a5f9e]" />
            <p className="text-[14px] font-semibold text-[#444]">Checking your details...</p>
            <p className="text-[11px] text-[#999]">Looking up your previous verification</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-3 pb-4">
      <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm">
        {/* Welcome back header */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100"
          >
            <UserCheck className="h-7 w-7 text-green-600" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-[20px] font-bold text-[#333]"
          >
            Welcome back!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-1 text-center text-[12px] text-[#777]"
          >
            We found your previously verified details
          </motion.p>
        </div>

        {/* Stored profile summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-5 rounded-lg border border-green-200 bg-green-50/50 px-3 py-3"
        >
          <div className="mb-2 flex items-center gap-2">
            <Check size={14} className="text-green-600" />
            <span className="text-[12px] font-semibold text-green-700">KYC Verified Profile</span>
          </div>

          <DataRow label="Payment type" value={payerMode === 'SELF' ? 'Self (Passenger)' : 'Third Party'} />
          <DataRow label="Account type" value={isCompany ? 'Company' : 'Personal'} />
          <div className="my-1.5 h-px bg-green-200/50" />
          <DataRow label="Full name" value={payer.fullName} />
          <DataRow label="Email" value={payer.email} />

          {isCompany && (
            <>
              <div className="my-1.5 h-px bg-green-200/50" />
              <DataRow label="Company" value={payer.companyName} />
              <DataRow label="Company Reg" value={payer.companyRegNo} />
              <DataRow label="Director" value={payer.directorName} />
            </>
          )}

          <div className="my-1.5 h-px bg-green-200/50" />
          <DataRow label="Address" value={payer.address} />
          <DataRow label="Postcode" value={payer.postcode} />
          <DataRow label="Bank account" value="****1234" />
        </motion.div>

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 rounded-lg border border-[#9ac6f4] bg-[#e7f2ff] px-3 py-2.5 text-[11px] text-[#3b7dd8]"
        >
          <div className="flex items-start gap-2">
            <Info size={13} className="mt-[1px] flex-shrink-0" />
            <p>Your identity was previously verified. You can proceed directly to payment or update your details.</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-5 space-y-2"
        >
          <motion.button
            onClick={onContinueWithStored}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-lg bg-[#ff4c16] py-3 text-[16px] font-bold text-white shadow-md transition-colors hover:bg-[#e64516]"
          >
            Continue with these details
          </motion.button>
          <button
            onClick={onUseDifferent}
            className="w-full rounded-lg border border-[#d5d5d5] bg-white py-2.5 text-[13px] font-semibold text-[#666] transition-colors hover:bg-[#f9f9f9]"
          >
            Use different details
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ==========================================
// SCREEN 3: KYC FORM (New Users)
// ==========================================
interface DetailsScreenProps {
  payerMode: PayerMode;
  accountType: AccountType;
  payer: PayerDetails;
  fieldErrors: FieldErrors;
  attemptsRemaining: number;
  companyLoading: boolean;
  companyLoaded: boolean;
  directorLoading: boolean;
  directorLoaded: boolean;
  editingField: string | null;
  onChangePayer: (mode: PayerMode) => void;
  onChangeAccount: (type: AccountType) => void;
  onFieldChange: (field: keyof PayerDetails, value: string) => void;
  onCompanyRegChange: (val: string) => void;
  onDirectorSelect: (name: string) => void;
  onEditField: (field: string | null) => void;
  onContinue: () => void;
  onBack: () => void;
}

function DetailsScreen(props: DetailsScreenProps) {
  const {
    payerMode, accountType, payer, fieldErrors, attemptsRemaining,
    companyLoading, companyLoaded, directorLoading, directorLoaded, editingField,
    onChangePayer, onChangeAccount, onFieldChange, onCompanyRegChange,
    onDirectorSelect, onEditField, onContinue, onBack,
  } = props;

  const isPersonal = accountType === 'PERSONAL';
  const isSelf = payerMode === 'SELF';

  const infoText = isSelf
    ? 'You must be a passenger or a member in a passenger group'
    : "Paying for others only. Use the payer's details exactly as on bank account.";
  const companyInfoText = 'A director must be a passenger or part of a passenger group';

  const canContinue = useMemo(() => {
    if (isPersonal) {
      return payer.fullName.trim().length > 0 && payer.email.trim().length > 0 && payer.mobile.trim().length > 0 && payer.address.trim().length > 0 && payer.postcode.trim().length > 0;
    }
    return directorLoaded;
  }, [isPersonal, payer, directorLoaded]);

  return (
    <section className="flex flex-col px-3 pb-4">
      <button onClick={onBack} className="mb-2 flex items-center gap-1 text-[12px] text-[#777] hover:text-[#444]">
        <ArrowLeft size={14} /> Back
      </button>

      <Panel>
        <h2 className="text-[15px] font-semibold text-[#3a3a3a]">Purchase information</h2>
        <p className="mt-1 text-[12px] text-[#6e6e6e]">Are you paying on behalf of yourself?</p>

        <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-lg border border-[#e5e5e5] bg-[#f8f8f8] p-1">
          <SegmentTab active={payerMode === 'SELF'} onClick={() => onChangePayer('SELF')}>Self</SegmentTab>
          <SegmentTab active={payerMode === 'THIRD_PARTY'} onClick={() => onChangePayer('THIRD_PARTY')}>Third party</SegmentTab>
        </div>

        <motion.div key={`info-${payerMode}-${accountType}`} {...fadeIn}
          className="mt-3 rounded-lg border border-[#9ac6f4] bg-[#e7f2ff] px-3 py-2.5 text-[12px] text-[#3b7dd8]">
          <div className="flex items-start gap-2">
            <Info size={14} className="mt-[1px] flex-shrink-0" />
            <p>{accountType === 'COMPANY' ? companyInfoText : infoText}</p>
          </div>
        </motion.div>

        <p className="mt-4 text-[12px] text-[#6e6e6e]">Select payment account type</p>
        <div className="mt-2 flex items-center gap-5">
          <RadioOption active={isPersonal} onClick={() => onChangeAccount('PERSONAL')} label="Personal" />
          <RadioOption active={!isPersonal} onClick={() => onChangeAccount('COMPANY')} label="Company" />
        </div>
      </Panel>

      <motion.div {...fadeIn} className="mt-2.5 rounded-lg border border-[#e6d78d] bg-[#FEF9C3] px-3 py-2.5 text-[11px] leading-[18px] text-[#7c6a2a]">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#e2b81a]/20">
            <Check size={10} className="text-[#b8960e]" />
          </div>
          <p>Ensure the information provided matches your bank account details for a successful transaction.
            {!isPersonal && ' You must be a director of this company to complete this transaction successfully.'}</p>
        </div>
      </motion.div>

      {attemptsRemaining < MAX_ATTEMPTS && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={13} />
            <p className="font-medium">{attemptsRemaining} verification attempt{attemptsRemaining !== 1 ? 's' : ''} remaining</p>
          </div>
        </motion.div>
      )}

      <Panel className="mt-2.5">
        <h3 className="text-[14px] font-semibold text-[#3a3a3a]">Review payer details</h3>
        <AnimatePresence mode="wait">
          {isPersonal ? (
            <motion.div key="personal-form" {...fadeIn}>
              <PersonalForm payer={payer} payerMode={payerMode} fieldErrors={fieldErrors}
                editingField={editingField} onFieldChange={onFieldChange} onEditField={onEditField} />
            </motion.div>
          ) : (
            <motion.div key="company-form" {...fadeIn}>
              <CompanyForm payer={payer} fieldErrors={fieldErrors}
                companyLoading={companyLoading} companyLoaded={companyLoaded}
                directorLoading={directorLoading} directorLoaded={directorLoaded}
                onCompanyRegChange={onCompanyRegChange} onDirectorSelect={onDirectorSelect} onFieldChange={onFieldChange} />
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>

      <motion.button disabled={!canContinue} onClick={onContinue} whileTap={canContinue ? { scale: 0.98 } : {}}
        className={`mt-3 w-full rounded-lg py-3 text-[18px] font-bold text-white shadow-sm transition-all ${
          canContinue ? 'bg-[#ff4c16] hover:bg-[#e64516]' : 'cursor-not-allowed bg-[#efb8a8]'
        }`}>
        Review & Continue
      </motion.button>
      <p className="mt-2 text-center text-[10px] text-[#c8c8c8]">Powered by mito.money</p>
    </section>
  );
}

// ==========================================
// REVIEW SCREEN (Registered Users - Pre-filled)
// ==========================================
function ReviewScreen({
  payer,
  payerMode,
  accountType,
  fieldErrors,
  attemptsRemaining,
  onSubmit,
  onChangeDetails,
  onBack,
}: {
  payer: PayerDetails;
  payerMode: PayerMode;
  accountType: AccountType;
  fieldErrors: FieldErrors;
  attemptsRemaining: number;
  onSubmit: () => void;
  onChangeDetails: () => void;
  onBack: () => void;
}) {
  const isCompany = accountType === 'COMPANY';

  return (
    <section className="flex flex-col px-3 pb-4">
      <button onClick={onBack} className="mb-2 flex items-center gap-1 text-[12px] text-[#777] hover:text-[#444]">
        <ArrowLeft size={14} /> Back
      </button>

      {/* Header */}
      <Panel>
        <h2 className="text-[15px] font-semibold text-[#3a3a3a]">Confirm payment details</h2>
        <p className="mt-1 text-[12px] text-[#6e6e6e]">Review your stored details before proceeding</p>

        {/* Mode / Type badges */}
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-[#ff4c16]/10 px-3 py-1 text-[11px] font-semibold text-[#ff4c16]">
            {payerMode === 'SELF' ? 'Self' : 'Third Party'}
          </span>
          <span className="rounded-full bg-[#2a5f9e]/10 px-3 py-1 text-[11px] font-semibold text-[#2a5f9e]">
            {isCompany ? 'Company' : 'Personal'}
          </span>
        </div>
      </Panel>

      {/* Warning */}
      <motion.div {...fadeIn} className="mt-2.5 rounded-lg border border-[#e6d78d] bg-[#FEF9C3] px-3 py-2.5 text-[11px] leading-[18px] text-[#7c6a2a]">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#e2b81a]/20">
            <Check size={10} className="text-[#b8960e]" />
          </div>
          <p>Ensure the information provided matches your bank account details for a successful transaction.</p>
        </div>
      </motion.div>

      {attemptsRemaining < MAX_ATTEMPTS && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={13} />
            <p className="font-medium">{attemptsRemaining} verification attempt{attemptsRemaining !== 1 ? 's' : ''} remaining</p>
          </div>
        </motion.div>
      )}

      {/* Payer Details (read-only) */}
      <Panel className="mt-2.5">
        <h3 className="text-[14px] font-semibold text-[#3a3a3a]">Payer details</h3>

        <div className="mt-3 rounded-lg bg-[#f8f8f8] px-3 py-2.5">
          <p className="text-[12px] font-semibold text-[#575757]">Contact info</p>
          <DataRow label="Full name" value={payer.fullName} error={fieldErrors.fullName} />
          <DataRow label="Email" value={payer.email} />
          <DataRow label="Date of birth" value={payer.dob} />
          <DataRow label="Mobile" value={payer.mobile} />
        </div>

        <div className="mt-2 rounded-lg bg-[#f8f8f8] px-3 py-2.5">
          <p className="text-[12px] font-semibold text-[#575757]">Address</p>
          <DataRow label="Address" value={payer.address} error={fieldErrors.address} />
          <DataRow label="Postcode" value={payer.postcode} />
          <DataRow label="Country" value={payer.country} />
        </div>

        {isCompany && (
          <div className="mt-2 rounded-lg bg-[#f8f8f8] px-3 py-2.5">
            <p className="text-[12px] font-semibold text-[#575757]">Company info</p>
            <DataRow label="Company Reg" value={payer.companyRegNo} />
            <DataRow label="Company name" value={payer.companyName} />
            <DataRow label="Company address" value={payer.companyAddress} />
            <DataRow label="Director" value={payer.directorName} error={fieldErrors.directorName} />
          </div>
        )}

        <div className="mt-2 rounded-lg border border-green-200 bg-green-50/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-green-600" />
            <span className="text-[11px] font-medium text-green-700">Verified bank account: ****1234</span>
          </div>
        </div>
      </Panel>

      {/* Actions */}
      <motion.button onClick={onSubmit} whileTap={{ scale: 0.98 }}
        className="mt-3 w-full rounded-lg bg-[#ff4c16] py-3 text-[18px] font-bold text-white shadow-md transition-colors hover:bg-[#e64516]">
        Confirm & Pay
      </motion.button>
      <button onClick={onChangeDetails}
        className="mt-2 w-full rounded-lg border border-[#d5d5d5] bg-white py-2.5 text-[13px] font-semibold text-[#666] transition-colors hover:bg-[#f9f9f9]">
        Use different details
      </button>
      <p className="mt-2 text-center text-[10px] text-[#c8c8c8]">Powered by mito.money</p>
    </section>
  );
}

// ==========================================
// PERSONAL FORM
// ==========================================
interface PersonalFormProps {
  payer: PayerDetails; payerMode: PayerMode; fieldErrors: FieldErrors;
  editingField: string | null;
  onFieldChange: (field: keyof PayerDetails, value: string) => void;
  onEditField: (field: string | null) => void;
}

function PersonalForm({ payer, payerMode, fieldErrors, editingField, onFieldChange, onEditField }: PersonalFormProps) {
  const isSelf = payerMode === 'SELF';
  return (
    <>
      <div className="mt-3 rounded-lg bg-[#f8f8f8] px-3 py-2.5">
        <p className="text-[12px] font-semibold text-[#575757]">{isSelf ? 'Contact info' : 'Payer info'}</p>
        <EditableDataRow label="Full name" value={payer.fullName} field="fullName" error={fieldErrors.fullName}
          editing={editingField === 'fullName'} alwaysEditable={!isSelf} onEdit={onEditField} onChange={onFieldChange} placeholder="Enter full name" />
        <EditableDataRow label="Email" value={payer.email} field="email" error={fieldErrors.email}
          editing={editingField === 'email'} alwaysEditable={!isSelf} onEdit={onEditField} onChange={onFieldChange} placeholder="Enter email address" inputType="email" />
        <EditableDataRow label="Date of birth" value={payer.dob} field="dob" error={fieldErrors.dob}
          editing={editingField === 'dob'} alwaysEditable={!isSelf} onEdit={onEditField} onChange={onFieldChange} placeholder="DD/MM/YYYY" />
      </div>
      <div className="mt-2 rounded-lg bg-[#f8f8f8] px-3 py-2.5">
        <p className="text-[12px] font-semibold text-[#575757]">{isSelf ? 'Enter additional info' : 'Payer address'}</p>
        <div className="mt-2">
          <label className="text-[11px] text-[#717171]">Mobile No</label>
          <div className="mt-1 flex gap-2">
            <div className="flex w-[70px] items-center justify-center rounded-lg border border-[#d5d5d5] bg-white px-2 py-2 text-[12px] text-[#555]">+44</div>
            <input value={payer.mobile} onChange={(e) => onFieldChange('mobile', e.target.value)} placeholder="7911 123456"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-[12px] ${fieldErrors.mobile ? 'border-red-400 bg-red-50' : 'border-[#d5d5d5]'}`} />
          </div>
          {fieldErrors.mobile && <p className="mt-0.5 text-[10px] text-red-500">{fieldErrors.mobile}</p>}
        </div>
        <div className="mt-2">
          <label className="text-[11px] text-[#717171]">Address</label>
          <input value={payer.address} onChange={(e) => onFieldChange('address', e.target.value)} placeholder="E.g 54, Chevron Drive"
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[12px] ${fieldErrors.address ? 'border-red-400 bg-red-50' : 'border-[#d5d5d5]'}`} />
          {fieldErrors.address && <p className="mt-0.5 text-[10px] text-red-500">{fieldErrors.address}</p>}
        </div>
        <div className="mt-2">
          <label className="text-[11px] text-[#717171]">Post code</label>
          <input value={payer.postcode} onChange={(e) => onFieldChange('postcode', e.target.value)} placeholder="E.g. SW1A 1AA"
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[12px] ${fieldErrors.postcode ? 'border-red-400 bg-red-50' : 'border-[#d5d5d5]'}`} />
          {fieldErrors.postcode && <p className="mt-0.5 text-[10px] text-red-500">{fieldErrors.postcode}</p>}
        </div>
        <div className="mt-2 flex items-center justify-between py-1.5 text-[11px]">
          <span className="text-[#717171]">Country</span>
          <span className="font-semibold text-[#5a5a5a]">{payer.country}</span>
        </div>
      </div>
    </>
  );
}

// ==========================================
// COMPANY FORM
// ==========================================
interface CompanyFormProps {
  payer: PayerDetails; fieldErrors: FieldErrors;
  companyLoading: boolean; companyLoaded: boolean;
  directorLoading: boolean; directorLoaded: boolean;
  onCompanyRegChange: (val: string) => void;
  onDirectorSelect: (name: string) => void;
  onFieldChange: (field: keyof PayerDetails, value: string) => void;
}

function CompanyForm({ payer, fieldErrors, companyLoading, companyLoaded, directorLoading, directorLoaded, onCompanyRegChange, onDirectorSelect }: CompanyFormProps) {
  return (
    <>
      <div className="mt-3 rounded-lg bg-[#f8f8f8] px-3 py-2.5">
        <p className="text-[12px] font-semibold text-[#575757]">Payer info</p>
        <DataRow label="Full name" value={payer.fullName || 'John Doe'} />
        <DataRow label="Email" value={payer.email || 'johndoe@email.com'} />
        <DataRow label="Date of birth" value={payer.dob || '12/08/1990'} />
      </div>
      <div className="mt-2 rounded-lg bg-[#f8f8f8] px-3 py-2.5">
        <p className="text-[12px] font-semibold text-[#575757]">Company information</p>
        <div className="mt-2">
          <label className="text-[11px] text-[#717171]">Company reg. no</label>
          <input value={payer.companyRegNo} onChange={(e) => onCompanyRegChange(e.target.value)} placeholder="E.g. RC 123654"
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[12px] ${fieldErrors.companyRegNo ? 'border-red-400 bg-red-50' : 'border-[#d5d5d5]'}`} />
          {fieldErrors.companyRegNo && <p className="mt-0.5 text-[10px] text-red-500">{fieldErrors.companyRegNo}</p>}
        </div>
        {companyLoading && <CenterLoader text="Looking up company..." />}
        <AnimatePresence>
          {companyLoaded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <DataRow label="Company name" value={payer.companyName} />
              <DataRow label="Company address" value={payer.companyAddress} />
              <DataRow label="Country" value="United Kingdom" />
              <div className="mt-2">
                <label className="text-[11px] text-[#717171]">Directors</label>
                <div className="relative mt-1">
                  <select value={payer.directorName} onChange={(e) => onDirectorSelect(e.target.value)}
                    className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-8 text-[12px] ${fieldErrors.directorName ? 'border-red-400 bg-red-50' : 'border-[#d5d5d5]'}`}>
                    <option value="">Select director&apos;s name</option>
                    {MOCK_COMPANY_DATA.directors.map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#999]" />
                </div>
                {fieldErrors.directorName && <p className="mt-0.5 text-[10px] text-red-500">{fieldErrors.directorName}</p>}
              </div>
              {directorLoading && <CenterLoader text="Verifying director..." />}
              <AnimatePresence>
                {directorLoaded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mt-1 rounded-lg border border-green-200 bg-green-50/50 px-2 py-2">
                    <div className="mb-1 flex items-center gap-1"><Check size={12} className="text-green-600" /><span className="text-[10px] font-medium text-green-700">Director verified</span></div>
                    <DataRow label="Full name" value={payer.directorName} />
                    <DataRow label="Director's Address" value="54 Chevron Drive, Westminster" />
                    <DataRow label="Post code" value="SW1A 1AA" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ==========================================
// PROCESSING SCREEN
// ==========================================
function ProcessingScreen({ timer, onBack }: { timer: string; onBack: () => void }) {
  return (
    <section className="px-3">
      <div className="overflow-hidden rounded-xl bg-white px-4 py-4 shadow-sm">
        <button onClick={onBack} className="rounded-lg bg-[#f1f1f1] p-2 transition-colors hover:bg-[#e5e5e5]"><ArrowLeft size={16} /></button>
        <div className="mt-4"><Brand /></div>
        <p className="mt-5 text-center text-[12px] text-[#5f5f5f]">Payment securely processed via PLAID</p>
        <div className="mt-2 flex items-center justify-center gap-2 text-[13px] text-[#3c3c3c]">
          <Clock3 size={14} />
          <p className="font-semibold">You have <span className="text-[#ff4d1b]">{timer}</span> mins to make payment</p>
        </div>
        <div className="mt-10 flex justify-center">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0f0f0]">
            <PlaidLogo />
          </motion.div>
        </div>
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 text-center text-[28px] font-semibold text-[#434343]">Please wait...</motion.h2>
        <p className="mx-4 mt-2 text-center text-[12px] leading-5 text-[#666]">We are now redirecting you to Plaid to process your payment</p>
        <div className="mt-6 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#ff4c16]" /></div>
      </div>
    </section>
  );
}

// ==========================================
// SUCCESS SCREEN
// ==========================================
function SuccessScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <section className="px-3">
      <div className="overflow-hidden rounded-xl bg-white px-4 py-6 shadow-sm">
        <Brand large />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className="mt-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><Check className="h-8 w-8 text-green-600" /></div>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-4 text-center text-[32px] font-semibold text-[#353535]">Payment successful</motion.h2>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="mt-4 flex justify-center"><PlaidLogo /></div>
          <p className="mt-2 text-center text-[16px] text-[#666]">Please wait...</p>
          <div className="mt-5 rounded-lg bg-[#e6f2ff] px-4 py-3 text-[12px] leading-5 text-[#657387]">
            <div className="flex items-start gap-2">
              <Info size={14} className="mt-[1px] flex-shrink-0" />
              <p>You&apos;ll now be redirected to the merchant site to complete your transaction</p>
            </div>
          </div>
          <motion.button onClick={onRestart} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="mt-5 w-full rounded-lg border border-[#d5d5d5] bg-white py-2.5 text-[13px] font-semibold text-[#666] transition-colors hover:bg-[#f9f9f9]">
            Try another scenario
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ==========================================
// SHARED UI COMPONENTS
// ==========================================

function AirPeaceBrandText({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const titleClass = size === 'lg' ? 'text-[18px]' : size === 'md' ? 'text-[14px]' : 'text-[11px]';
  const subClass = size === 'lg' ? 'text-[8px] mt-[1px]' : size === 'md' ? 'text-[7px] mt-[1px]' : 'text-[6px] mt-[0.5px]';
  return (
    <div>
      <p className={`${titleClass} font-black italic leading-none text-[#2a5f9e]`}>AIR PEACE</p>
      <p className={`${subClass} font-semibold italic text-[#be4d44]`}>...your peace, our goal</p>
    </div>
  );
}

function HeaderLogo() {
  return (<div className="px-4 pb-2 pt-3"><AirPeaceBrandText size="sm" /></div>);
}

function Brand({ large = false }: { large?: boolean }) {
  return (
    <div className="text-center">
      <p className={`${large ? 'text-[40px]' : 'text-[28px]'} font-black italic leading-none tracking-tight text-[#2a5f9e]`}>AIR PEACE</p>
      <p className="mt-[2px] text-[10px] font-semibold italic text-[#be4d44]">...your peace, our goal</p>
    </div>
  );
}

function PlaidLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="grid h-8 w-8 grid-cols-3 grid-rows-3 gap-[2px]">
        {[...Array(9)].map((_, i) => (<div key={i} className={`rounded-[1px] ${[0, 1, 3, 4, 5, 7, 8].includes(i) ? 'bg-[#111]' : 'bg-transparent'}`} />))}
      </div>
      <span className="text-[14px] font-bold text-[#111]">plaid</span>
    </div>
  );
}

function DesktopProgress() {
  const steps = ['Flight Section', 'Passenger', 'Additional Services', 'Payment', 'Confirmation'];
  return (
    <div className="hidden flex-1 items-center justify-center gap-3 sm:flex">
      {steps.map((label, index) => {
        const done = index < 3;
        const current = index === 3;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-semibold ${
                done ? 'border-[#2f5b94] bg-[#2f5b94] text-white' : current ? 'border-[#2f5b94] bg-white text-[#2f5b94]' : 'border-[#9eb3ca] bg-white text-[#9eb3ca]'
              }`}>{done ? '✓' : index + 1}</span>
              <span className="mt-1 whitespace-nowrap text-[9px] text-[#2f5b94]">{label}</span>
            </div>
            {index < steps.length - 1 && <span className="mb-3 h-[1px] w-6 bg-[#9eb3ca]" />}
          </div>
        );
      })}
    </div>
  );
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-[#f6f6f6] p-3 ${className}`}>{children}</div>;
}

function SegmentTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`relative rounded-md py-2 text-[13px] font-semibold transition-all ${active ? 'bg-[#ff4c16] text-white shadow-sm' : 'text-[#7f7f7f] hover:text-[#555]'}`}>
      {children}
    </button>
  );
}

function RadioOption({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 text-[13px] transition-colors ${active ? 'text-[#ff4c16]' : 'text-[#9f9f9f]'}`}>
      <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors ${active ? 'border-[#ff4c16]' : 'border-[#d8d8d8]'}`}>
        {active && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-[#ff4c16]" />}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function KV({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[#5e5e5e]">{label}</span>
      <span className={`text-[#535353] ${bold ? 'text-[15px] font-bold' : 'font-semibold'}`}>{value}</span>
    </div>
  );
}

function DataRow({ label, value, error }: { label: string; value: string; error?: string }) {
  return (
    <div className="mt-1.5 flex items-center justify-between text-[11px]">
      <span className="text-[#707070]">{label}</span>
      <span className={`max-w-[55%] text-right font-semibold ${error ? 'text-red-500' : 'text-[#5a5a5a]'}`}>{value}</span>
    </div>
  );
}

interface EditableDataRowProps {
  label: string; value: string; field: string; error?: string;
  editing: boolean; alwaysEditable: boolean;
  onEdit: (field: string | null) => void;
  onChange: (field: keyof PayerDetails, value: string) => void;
  placeholder?: string; inputType?: string;
}

function EditableDataRow({ label, value, field, error, editing, alwaysEditable, onEdit, onChange, placeholder = '', inputType = 'text' }: EditableDataRowProps) {
  if (alwaysEditable || editing) {
    return (
      <div className="mt-2">
        <label className="text-[11px] text-[#717171]">{label}</label>
        <div className="mt-0.5 flex items-center gap-1">
          <input type={inputType} value={value} onChange={(e) => onChange(field as keyof PayerDetails, e.target.value)}
            placeholder={placeholder} autoFocus={editing} onBlur={() => !alwaysEditable && onEdit(null)}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-[12px] ${error ? 'border-red-400 bg-red-50' : 'border-[#d5d5d5]'}`} />
        </div>
        {error && <p className="mt-0.5 text-[10px] text-red-500">{error}</p>}
      </div>
    );
  }
  return (
    <div className="mt-1.5 flex items-center justify-between text-[11px]">
      <span className="text-[#707070]">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`font-semibold ${error ? 'text-red-500' : 'text-[#5a5a5a]'}`}>{value || <span className="text-[#ccc]">Not set</span>}</span>
        <button onClick={() => onEdit(field)} className="p-0.5"><Pencil size={11} className="text-[#bbb] hover:text-[#777]" /></button>
      </div>
    </div>
  );
}

function CenterLoader({ text }: { text?: string }) {
  return (
    <div className="my-3 flex flex-col items-center gap-1">
      <Loader2 className="h-6 w-6 animate-spin text-[#ff4c16]" />
      {text && <p className="text-[10px] text-[#999]">{text}</p>}
    </div>
  );
}
