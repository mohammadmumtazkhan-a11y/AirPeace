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
  RefreshCcw,
  FileEdit,
} from 'lucide-react';

// ==========================================
// TYPES & CONSTANTS
// ==========================================
type Stage =
  | 'scenario'
  | 'method'
  | 'summary'
  | 'recognition'
  | 'details'
  | 'review'
  | 'processing'
  | 'validation'
  | 'success'
  | 'failure'
  | 'pending';

type AccountType = 'PERSONAL' | 'COMPANY';
type UserType = 'NEW' | 'REGISTERED';
type ExpectedOutcome = 'SUCCESS' | 'MISMATCH' | 'INSUFFICIENT_FUNDS' | 'PENDING';

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
  type: 'error' | 'success' | 'info';
}

interface DemoScenario {
  id: string;
  label: string;
  userType: UserType;
  accountType: AccountType;
  expectedOutcome: ExpectedOutcome;
  description: string;
}

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

const REGISTERED_PERSONAL: PayerDetails = {
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

const REGISTERED_COMPANY: PayerDetails = {
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

const MOCK_COMPANY_DATA = {
  companyName: 'Acme Limited',
  companyAddress: '08 James Street, East London',
  directors: ['John Doe', 'Jane Smith', 'Michael Brown'],
};

const MAX_ATTEMPTS = 3;

const DEMO_SCENARIOS: DemoScenario[] = [
  { id: 'new-personal-success', label: 'Personal — Success', userType: 'NEW', accountType: 'PERSONAL', expectedOutcome: 'SUCCESS', description: 'New user paying via personal account. Happy path.' },
  { id: 'new-personal-mismatch', label: 'Personal — Name Mismatch', userType: 'NEW', accountType: 'PERSONAL', expectedOutcome: 'MISMATCH', description: 'Payment succeeds but bank-account name mismatches payer profile. Needs retry/correction.' },
  { id: 'new-company-success', label: 'Company — Success', userType: 'NEW', accountType: 'COMPANY', expectedOutcome: 'SUCCESS', description: 'New user paying via company account. Happy path.' },
  { id: 'new-company-mismatch', label: 'Company — Name Mismatch', userType: 'NEW', accountType: 'COMPANY', expectedOutcome: 'MISMATCH', description: 'New company user triggers name mismatch upon payment.' },
  { id: 'new-company-insufficient', label: 'Company — Insufficient Funds', userType: 'NEW', accountType: 'COMPANY', expectedOutcome: 'INSUFFICIENT_FUNDS', description: 'New company user fails due to insufficient balance.' },
  
  { id: 'reg-personal-success', label: 'Registered Personal — Success', userType: 'REGISTERED', accountType: 'PERSONAL', expectedOutcome: 'SUCCESS', description: 'Returning personal user recognised by email. Skips form.' },
  { id: 'reg-personal-mismatch', label: 'Registered Personal — Name Mismatch', userType: 'REGISTERED', accountType: 'PERSONAL', expectedOutcome: 'MISMATCH', description: 'Returning personal user triggers mismatch upon payment.' },
  { id: 'reg-company-success', label: 'Registered Company — Success', userType: 'REGISTERED', accountType: 'COMPANY', expectedOutcome: 'SUCCESS', description: 'Returning company user paying successfully. Happy path.' },
  { id: 'reg-company-mismatch', label: 'Registered Company — Mismatch', userType: 'REGISTERED', accountType: 'COMPANY', expectedOutcome: 'MISMATCH', description: 'Returning company user triggers mismatch upon payment.' },
  { id: 'reg-company-insufficient', label: 'Registered Company — Insufficient Funds', userType: 'REGISTERED', accountType: 'COMPANY', expectedOutcome: 'INSUFFICIENT_FUNDS', description: 'Returning company user fails due to insufficient balance.' },
];

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

function getRegisteredData(accountType: AccountType): PayerDetails {
  return accountType === 'PERSONAL' ? { ...REGISTERED_PERSONAL } : { ...REGISTERED_COMPANY };
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AirPeacePaymentFlow() {
  const [stage, setStage] = useState<Stage>('scenario');
  const [userType, setUserType] = useState<UserType>('NEW');
  const [accountType, setAccountType] = useState<AccountType>('PERSONAL');
  const [expectedOutcome, setExpectedOutcome] = useState<ExpectedOutcome>('SUCCESS');
  
  const [payer, setPayer] = useState<PayerDetails>({ ...EMPTY_PAYER });
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
  
  const [hasAcknowledgedWarning, setHasAcknowledgedWarning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);

  const toastIdRef = useRef(0);
  const companyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const addToast = useCallback((text: string, type: 'error' | 'success' | 'info' = 'error') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleStartScenario = useCallback((scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setUserType(scenario.userType);
    setAccountType(scenario.accountType);
    setExpectedOutcome(scenario.expectedOutcome);
    setAttemptsRemaining(MAX_ATTEMPTS);
    setFieldErrors({});
    setTimer(600);
    setCompanyLoaded(false);
    setCompanyLoading(false);
    setDirectorLoaded(false);
    setDirectorLoading(false);
    setEditingField(null);
    setIsVerifying(false);
    setHasAcknowledgedWarning(false);

    if (scenario.userType === 'NEW') setPayer({ ...EMPTY_PAYER });
    else setPayer(getRegisteredData(scenario.accountType));

    setStage('method');
  }, []);

  const handleRestart = useCallback(() => {
    setStage('scenario');
    setSelectedScenario(null);
    setToasts([]);
  }, []);

  const handleAfterSummary = useCallback(() => {
    if (userType === 'REGISTERED') {
      setRecognitionChecking(true);
      setStage('recognition');
    } else {
      setStage('details');
    }
  }, [userType]);

  const handleAccountTypeChange = useCallback((type: AccountType) => {
    setAccountType(type);
    setFieldErrors({});
    setEditingField(null);
    setCompanyLoaded(false);
    setCompanyLoading(false);
    setDirectorLoaded(false);
    setDirectorLoading(false);
    setPayer((prev) => ({ ...prev, companyRegNo: '', companyName: '', companyAddress: '', directorName: '' }));
  }, []);

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
        setPayer((prev) => ({ ...prev, companyName: MOCK_COMPANY_DATA.companyName, companyAddress: MOCK_COMPANY_DATA.companyAddress }));
      }, 1200);
    } else {
      setCompanyLoading(false);
    }
  }, []);

  const handleDirectorSelect = useCallback((name: string) => {
    setPayer((prev) => ({ ...prev, directorName: name }));
    if (!name) { setDirectorLoaded(false); return; }
    setDirectorLoading(true);
    setTimeout(() => { setDirectorLoading(false); setDirectorLoaded(true); }, 900);
  }, []);

  const handleFieldChange = useCallback((field: keyof PayerDetails, value: string) => {
    setPayer((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  }, []);

  const handleSubmitDetails = useCallback(async () => {
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
        if (!payer.fullName.trim()) errors.fullName = 'Full name is required';
        if (!payer.email.trim()) errors.email = 'Email is required';
        if (!payer.companyRegNo.trim()) errors.companyRegNo = 'Required';
        if (!companyLoaded) errors.companyRegNo = 'Invalid';
        if (!payer.directorName.trim()) errors.directorName = 'Required';
        if (!directorLoaded) errors.directorName = 'Wait for verification';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        addToast('Please fill in all required fields to proceed.');
        return;
      }
    }
    
    setIsVerifying(true);
    setFieldErrors({});
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const nameToCheck = accountType === 'PERSONAL' ? payer.fullName.toLowerCase() : payer.directorName.toLowerCase();
    if (nameToCheck.includes('fail kyc')) {
      const remaining = attemptsRemaining - 1;
      setAttemptsRemaining(remaining);
      if (remaining <= 0) {
        addToast('Maximum verification attempts exceeded. Transaction blocked.', 'error');
        setIsVerifying(false);
        return;
      }
      const errorField = accountType === 'PERSONAL' ? 'fullName' : 'directorName';
      setFieldErrors({ [errorField]: 'Name does not match KYC address records.' });
      addToast(`Verification Failed. Check details. ${remaining} Attempt(s) Remaining.`, 'error');
      setIsVerifying(false);
      return;
    }

    setIsVerifying(false);
    setStage('processing');
  }, [userType, accountType, payer, attemptsRemaining, companyLoaded, directorLoaded, addToast]);

  useEffect(() => {
    if (stage === 'recognition' && recognitionChecking) {
      const id = setTimeout(() => setRecognitionChecking(false), 1500);
      return () => clearTimeout(id);
    }
  }, [stage, recognitionChecking]);

  useEffect(() => {
    if (stage !== 'processing') return;
    const id = setTimeout(() => {
      setStage('validation');
    }, 3000);
    return () => clearTimeout(id);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'validation') return;
    const id = setTimeout(() => {
      if (expectedOutcome === 'SUCCESS') setStage('success');
      else if (expectedOutcome === 'MISMATCH' || expectedOutcome === 'INSUFFICIENT_FUNDS') setStage('failure');
      else setStage('pending');
    }, 3500);
    return () => clearTimeout(id);
  }, [stage, expectedOutcome]);

  const showWarningModal = (stage === 'details' || stage === 'review') && !hasAcknowledgedWarning;

  if (stage === 'scenario') return <main className="min-h-screen bg-[#1a1a2e]"><ScenarioSelector scenarios={DEMO_SCENARIOS} onSelect={handleStartScenario} /></main>;
  if (stage === 'method') return <main className="min-h-screen bg-[#ebeced]"><MethodSelectionScreen onContinue={() => setStage('summary')} onBack={handleRestart} scenario={selectedScenario} /></main>;

  return (
    <main className="min-h-screen bg-[#474747]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[#efefef]">
        
        <button onClick={handleRestart} className="fixed right-3 top-3 z-50 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#555] shadow-md backdrop-blur-sm hover:bg-white">
          <RotateCcw size={12} /> Switch Flow
        </button>

        {selectedScenario && (
          <div className="mx-3 mt-2 rounded-lg bg-[#2a5f9e]/10 px-3 py-1.5 text-center">
            <p className="text-[10px] font-semibold text-[#2a5f9e]">{selectedScenario.label}</p>
          </div>
        )}

        <div className="fixed left-1/2 top-10 z-50 w-full max-w-[480px] -translate-x-1/2 px-3">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div key={toast.id} initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
                className={`mb-2 flex items-start gap-2 rounded-lg px-3 py-3 shadow-lg ${toast.type === 'error' ? 'border border-red-200 bg-red-50 text-red-800' : 'border border-blue-200 bg-blue-50 text-blue-800'}`}>
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p className="flex-1 text-[12px] font-medium leading-snug">{toast.text}</p>
                <button onClick={() => removeToast(toast.id)} className="flex-shrink-0"><X size={14} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mandatory Warning Modal */}
        <AnimatePresence>
          {showWarningModal && (
            <ImportantInformationModal onConfirm={() => setHasAcknowledgedWarning(true)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isVerifying && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl">
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
            <motion.div key="summary" {...pageVariants}><SummaryScreen timer={timerDisplay} onContinue={handleAfterSummary} /></motion.div>
          )}

          {stage === 'recognition' && (
            <motion.div key="recognition" {...pageVariants}>
              <RecognitionScreen
                payer={payer} accountType={accountType} isChecking={recognitionChecking}
                onContinueWithStored={() => setStage('review')}
                onUseDifferent={() => { setUserType('NEW'); setPayer({ ...EMPTY_PAYER }); setStage('details'); }}
              />
            </motion.div>
          )}

          {stage === 'details' && (
            <motion.div key="details" {...pageVariants} className="flex-1">
              <DetailsScreen
                accountType={accountType} payer={payer} fieldErrors={fieldErrors} attemptsRemaining={attemptsRemaining}
                companyLoading={companyLoading} companyLoaded={companyLoaded} directorLoading={directorLoading} directorLoaded={directorLoaded}
                editingField={editingField}
                onChangeAccount={handleAccountTypeChange} onFieldChange={handleFieldChange} onCompanyRegChange={handleCompanyRegChange}
                onDirectorSelect={handleDirectorSelect} onEditField={setEditingField} onContinue={handleSubmitDetails} onBack={() => setStage('summary')}
              />
            </motion.div>
          )}

          {stage === 'review' && (
            <motion.div key="review" {...pageVariants} className="flex-1">
              <ReviewScreen
                payer={payer} accountType={accountType} attemptsRemaining={attemptsRemaining} onSubmit={handleSubmitDetails}
                onChangeDetails={() => { setUserType('NEW'); setStage('details'); }} onBack={() => setStage('recognition')}
              />
            </motion.div>
          )}

          {stage === 'processing' && (
            <motion.div key="processing" {...pageVariants}>
              <ProcessingScreen timer={timerDisplay} onBack={() => setStage(userType === 'REGISTERED' ? 'review' : 'details')} />
            </motion.div>
          )}
          
          {stage === 'validation' && (
            <motion.div key="validation" {...pageVariants}>
              <ValidationScreen timer={timerDisplay} />
            </motion.div>
          )}

          {stage === 'success' && (
            <motion.div key="success" {...pageVariants}><SuccessScreen onRestart={handleRestart} /></motion.div>
          )}
          
          {stage === 'failure' && (
            <motion.div key="failure" {...pageVariants}>
              <FailureScreen 
                reason={expectedOutcome}
                onRetryBank={() => setStage('processing')} 
                onRestartNew={() => {
                  setExpectedOutcome('SUCCESS'); // For demo loop
                  setUserType('NEW');
                  setPayer({ ...EMPTY_PAYER });
                  setHasAcknowledgedWarning(false);
                  setStage('details');
                }} 
              />
            </motion.div>
          )}
          
          {stage === 'pending' && (
            <motion.div key="pending" {...pageVariants}><PendingScreen onRestart={handleRestart} /></motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ==========================================
// SCENARIO SELECTOR
// ==========================================
function ScenarioSelector({ scenarios, onSelect }: { scenarios: DemoScenario[]; onSelect: (s: DemoScenario) => void; }) {
  return (
    <div className="mx-auto max-w-[600px] px-4 py-8">
      <div className="text-center">
        <p className="text-[28px] font-black italic leading-none text-[#2a5f9e]">AIR PEACE</p>
        <p className="mt-1 text-[10px] font-semibold italic text-[#be4d44]">...your peace, our goal</p>
        <h1 className="mt-6 text-[22px] font-bold text-white">Mito.Money Payment Pages Flow</h1>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2"><User size={16} className="text-[#ff4c16]" /><h2 className="text-[15px] font-bold text-white">New User</h2></div>
        <div className="grid gap-2">
          {scenarios.filter(s => s.userType === 'NEW').map(s => (
            <motion.button key={s.id} onClick={() => onSelect(s)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left">
              <p className="text-[13px] font-semibold text-white">{s.label}</p>
              <p className="mt-0.5 text-[11px] text-white/50">{s.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2"><UserCheck size={16} className="text-green-400" /><h2 className="text-[15px] font-bold text-white">Registered User</h2></div>
        <div className="grid gap-2">
          {scenarios.filter(s => s.userType === 'REGISTERED').map(s => (
            <motion.button key={s.id} onClick={() => onSelect(s)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-left">
              <p className="text-[13px] font-semibold text-white">{s.label}</p>
              <p className="mt-0.5 text-[11px] text-white/50">{s.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SCREENS
// ==========================================
function MethodSelectionScreen({ onContinue, onBack, scenario }: { onContinue: () => void; onBack: () => void; scenario: DemoScenario | null; }) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const canContinue = selectedMethod === 'bank';
  return (
    <div className="mx-auto min-h-screen w-full max-w-[886px] bg-white">
      <div className="flex items-center border-b border-[#dee4ea] px-4 py-3 sm:px-10"><div className="w-[170px]"><AirPeaceBrandText size="lg" /></div><DesktopProgress /></div>
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
          {[{ id: 'paystack', title: 'Paystack' }, { id: 'bank', title: 'Pay by Bank (instant transfer)', highlight: true }].map(m => (
            <motion.button key={m.id} onClick={() => setSelectedMethod(m.id)} whileTap={{ scale: 0.99 }} className={`w-full rounded-[4px] border bg-white px-3 py-3 text-left ${selectedMethod === m.id ? 'border-[#89a9d2] shadow-sm' : m.highlight ? 'border-[#ff7043]' : 'border-[#d8e0e6]'}`}>
              <div className="flex items-center justify-between"><p className={`text-[16px] font-semibold sm:text-[20px] ${m.highlight && selectedMethod !== m.id ? 'text-[#e64a19]' : 'text-[#2f2f2f]'}`}>{m.title}</p><ChevronRight size={16} className="text-[#202020]" /></div>
            </motion.button>
          ))}
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button type="button" onClick={onBack} className="rounded-[4px] border border-[#6885a6] bg-[#f8fbff] px-10 py-2.5 text-[12px] font-semibold text-[#3f5f81]">BACK</button>
          <div className="flex items-center justify-between gap-4 sm:gap-6">
            <p className="text-[13px] font-semibold text-[#1f2d3d]">TOTAL £550.00</p>
            <motion.button type="button" disabled={!canContinue} onClick={onContinue} whileTap={canContinue ? { scale: 0.97 } : {}} className={`rounded-[4px] px-8 py-2.5 text-[12px] font-semibold text-white ${canContinue ? 'bg-[#3457a5]' : 'bg-[#9aa8c9]'}`}>Make Payment</motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryScreen({ timer, onContinue }: { timer: string; onContinue: () => void }) {
  return (
    <section className="px-3 pb-4">
      <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm">
        <Brand />
        <p className="mt-5 text-center text-[12px] text-[#5f5f5f]">Payment securely processed via <span className="font-semibold">PLAID</span></p>
        <div className="mt-3 flex items-center justify-center gap-2 text-[13px] text-[#3c3c3c]">
          <Clock3 size={14} />
          <p className="font-semibold">You have <span className="text-[#ff4d1b]">{timer}</span> mins to make payment</p>
        </div>
        <div className="mt-5 space-y-2 rounded-lg bg-[#f4f4f4] px-4 py-3 text-[13px]">
          <KV label="Total" value="£ 550.00" bold />
          <KV label="Paying to" value="Air Peace via PLAID" />
        </div>
        <motion.button onClick={onContinue} whileTap={{ scale: 0.98 }} className="mt-8 w-full rounded-lg bg-[#ff4c16] py-3.5 text-[18px] font-bold text-white">Continue to Payment</motion.button>
      </div>
    </section>
  );
}

function RecognitionScreen({ payer, accountType, isChecking, onContinueWithStored, onUseDifferent }: any) {
  if (isChecking) {
    return (
      <section className="px-3 pb-4">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-10 shadow-sm flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#2a5f9e]" />
          <p className="mt-3 text-[14px] font-semibold text-[#444]">Checking your details...</p>
        </div>
      </section>
    );
  }
  return (
    <section className="px-3 pb-4">
      <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm text-center">
        <UserCheck className="mx-auto h-12 w-12 text-green-600 rounded-full bg-green-100 p-2" />
        <h2 className="mt-3 text-[20px] font-bold">Welcome back!</h2>
        <p className="text-[12px] text-[#777]">We found your previously verified payer details.</p>
        <div className="mt-5 text-left bg-[#f8f8f8] p-3 rounded-lg border border-[#eee]">
          <DataRow label="Name" value={payer.fullName} />
          <DataRow label="Email" value={payer.email} />
          {accountType === 'COMPANY' && <DataRow label="Company" value={payer.companyName} />}
        </div>
        <motion.button onClick={onContinueWithStored} whileTap={{ scale: 0.98 }} className="mt-6 w-full rounded-lg bg-[#ff4c16] py-3 text-[16px] font-bold text-white">Continue with these details</motion.button>
        <button onClick={onUseDifferent} className="mt-2 w-full rounded-lg border border-[#ccc] bg-white py-2.5 text-[13px] font-medium text-[#666]">Use different details</button>
      </div>
    </section>
  );
}

// Modal component matching the user's styling exactly
function ImportantInformationModal({ onConfirm }: { onConfirm: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-[380px] rounded-lg bg-[#fffdf5] border-2 border-[#fce3a1] p-5 shadow-2xl">
        
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-[#cca01d]" />
          <h3 className="text-[17px] font-bold text-[#b08518]">Important Information</h3>
        </div>
        
        <p className="mt-3 text-[14px] leading-relaxed text-[#73643b]">
          To prevent payment rejection, the payer name on your profile <strong className="font-bold text-[#62532d]">must exactly match</strong> the name on the bank account you are about to use.
        </p>
        
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[6px] border border-[#fce3a1] bg-white p-3.5 shadow-sm transition-colors hover:bg-[#fafafa]">
          <input 
            type="checkbox" 
            checked={checked} 
            onChange={(e) => setChecked(e.target.checked)} 
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#cca01d] focus:ring-[#cca01d]" 
          />
          <span className="text-[14px] font-bold leading-snug text-[#1f2d3d]">
            I confirm that the name provided matches the bank account name exactly.
          </span>
        </label>

        <button 
          onClick={onConfirm}
          disabled={!checked}
          className={`mt-5 w-full rounded-lg py-2.5 text-[15px] font-bold text-white transition-colors ${checked ? 'bg-[#ff4c16] hover:bg-[#e64516]' : 'bg-[#f4c2b3] cursor-not-allowed'}`}
        >
          Acknowledge
        </button>
      </motion.div>
    </motion.div>
  );
}

function DetailsScreen({
  accountType, payer, fieldErrors, attemptsRemaining, companyLoading, companyLoaded, directorLoading, directorLoaded, editingField,
  onChangeAccount, onFieldChange, onCompanyRegChange, onDirectorSelect, onEditField, onContinue, onBack,
}: any) {
  const isPersonal = accountType === 'PERSONAL';
  const canContinue = isPersonal ? payer.fullName.trim().length > 0 : directorLoaded && payer.fullName.trim().length > 0;

  return (
    <section className="flex flex-col px-3 pb-4">
      <button onClick={onBack} className="mb-2 flex items-center gap-1 text-[12px] text-[#777]"><ArrowLeft size={14} /> Back</button>
      
      <Panel>
        <div className="flex items-start gap-2 text-[#3b7dd8] bg-[#e7f2ff] px-3 py-2.5 rounded-lg border border-[#9ac6f4] text-[12px] mb-3">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <p>Please enter the details of the individual or company who is actually paying. This information is required for compliance onboarding.</p>
        </div>
        <p className="text-[12px] text-[#6e6e6e] mt-1">Select payer account type</p>
        <div className="mt-2 flex items-center gap-5">
          <RadioOption active={isPersonal} onClick={() => onChangeAccount('PERSONAL')} label="Personal" />
          <RadioOption active={!isPersonal} onClick={() => onChangeAccount('COMPANY')} label="Company" />
        </div>
      </Panel>

      <Panel className="mt-2.5">
        <h3 className="text-[14px] font-semibold text-[#3a3a3a]">Payer Onboarding Information</h3>
        <AnimatePresence mode="wait">
          {isPersonal ? (
            <motion.div key="personal" {...fadeIn}><PersonalForm payer={payer} fieldErrors={fieldErrors} editingField={editingField} onFieldChange={onFieldChange} onEditField={onEditField} /></motion.div>
          ) : (
            <motion.div key="company" {...fadeIn}><CompanyForm payer={payer} fieldErrors={fieldErrors} companyLoading={companyLoading} companyLoaded={companyLoaded} directorLoading={directorLoading} directorLoaded={directorLoaded} onCompanyRegChange={onCompanyRegChange} onDirectorSelect={onDirectorSelect} onFieldChange={onFieldChange} /></motion.div>
          )}
        </AnimatePresence>
      </Panel>

      <motion.button disabled={!canContinue} onClick={onContinue} whileTap={canContinue ? { scale: 0.98 } : {}}
        className={`mt-4 w-full rounded-lg py-3 text-[18px] font-bold text-white shadow-sm transition-all ${canContinue ? 'bg-[#ff4c16] hover:bg-[#e64516]' : 'cursor-not-allowed bg-[#efb8a8]'}`}>
        Review & Continue
      </motion.button>
    </section>
  );
}

function ReviewScreen({ payer, accountType, attemptsRemaining, onSubmit, onChangeDetails, onBack }: any) {
  const isCompany = accountType === 'COMPANY';

  return (
    <section className="flex flex-col px-3 pb-4">
      <button onClick={onBack} className="mb-2 flex items-center gap-1 text-[12px] text-[#777]"><ArrowLeft size={14} /> Back</button>
      <Panel>
        <h2 className="text-[15px] font-semibold text-[#3a3a3a]">Confirm your payer details</h2>
        <p className="mt-1 text-[12px] text-[#6e6e6e]">Review your verified profile before proceeding</p>
      </Panel>

      <Panel className="mt-2.5">
        <div className="bg-[#f8f8f8] px-3 py-2.5 rounded-lg">
          <DataRow label="Payer Name" value={payer.fullName} />
          <DataRow label="Email" value={payer.email} />
          {isCompany && <><DataRow label="Company" value={payer.companyName} /><DataRow label="Director" value={payer.directorName} /></>}
        </div>
        <div className="mt-2 rounded-lg border border-green-200 bg-green-50/50 px-3 py-2 text-[11px] text-green-700 flex items-center gap-2"><Check size={14} />Verified profile active</div>
      </Panel>

      <motion.button onClick={onSubmit} whileTap={{ scale: 0.98 }} className="mt-4 w-full rounded-lg py-3 text-[18px] font-bold text-white shadow-md transition-colors bg-[#ff4c16] hover:bg-[#e64516]">
        Confirm & Pay
      </motion.button>
      <button onClick={onChangeDetails} className="mt-2 w-full rounded-lg border border-[#ccc] bg-white py-2.5 text-[13px] font-semibold text-[#666]">I want to use different payer details</button>
    </section>
  );
}

// Post-payment States
function ProcessingScreen({ timer, onBack }: any) {
  return (
    <section className="px-3">
      <div className="overflow-hidden rounded-xl bg-white px-4 py-8 shadow-sm text-center">
        <Brand />
        <p className="mt-8 text-[13px] font-medium text-[#555]">Redirecting to your bank...</p>
        <Loader2 className="mx-auto mt-4 h-8 w-8 animate-spin text-[#ff4c16]" />
      </div>
    </section>
  );
}

function ValidationScreen({ timer }: any) {
  return (
    <section className="px-3">
      <div className="overflow-hidden rounded-xl bg-white px-6 py-10 shadow-sm text-center space-y-4">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#2a5f9e]" />
        <h2 className="text-[20px] font-bold text-[#333]">Validation in progress</h2>
      </div>
    </section>
  );
}

function SuccessScreen({ onRestart }: any) {
  return (
    <section className="px-3">
      <div className="overflow-hidden rounded-xl bg-white px-6 py-10 shadow-sm text-center">
        <div className="flex justify-center mb-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><Check className="h-8 w-8 text-green-600" /></div></div>
        <h2 className="text-[24px] font-bold text-[#333]">Payment successful</h2>
        <button onClick={onRestart} className="mt-8 w-full rounded-lg bg-[#f0f0f0] py-3 text-[14px]">Return</button>
      </div>
    </section>
  );
}

function FailureScreen({ reason, onRetryBank, onRestartNew }: any) {
  const isMismatch = reason === 'MISMATCH';
  
  const title = isMismatch ? "Verification Failed" : "Payment Declined";
  const message = isMismatch 
    ? "The bank account name does not match the payer profile you registered. Please restart with matching details."
    : "Transaction declined due to insufficient funds. Please try another bank account with sufficient balance.";
    
  return (
    <section className="px-3 pb-8">
      <div className="overflow-hidden rounded-xl bg-white px-5 py-8 text-center border-t-4 border-red-500 shadow-sm">
        <X className="mx-auto h-12 w-12 text-red-500 bg-red-50 rounded-full p-2 mb-4" />
        <h2 className="text-[20px] font-bold text-[#333]">{title}</h2>
        <p className="mt-2 text-[13px] text-[#666] leading-relaxed">{message}</p>
        
        <div className="mt-6 space-y-3">
          {reason === 'INSUFFICIENT_FUNDS' && (
            <button onClick={onRetryBank} className="w-full rounded-lg bg-[#333] hover:bg-[#222] py-3 text-[13px] text-white flex items-center justify-center gap-2">
              <RefreshCcw size={15}/> Retry with another bank account
            </button>
          )}
          
          {isMismatch && (
            <button onClick={onRestartNew} className="w-full rounded-lg border border-[#d5d5d5] hover:bg-[#fafafa] py-3 text-[13px] text-[#333] flex items-center justify-center gap-2">
              <FileEdit size={15}/> Restart with new payer details
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function PendingScreen({ onRestart }: any) {
  return (
    <section className="px-3">
      <div className="overflow-hidden rounded-xl bg-white px-6 py-10 text-center">
        <Clock3 className="mx-auto h-12 w-12 text-[#b38600] bg-[#fffbf0] rounded-full p-2 mb-4" />
        <h2 className="text-[20px] font-bold">Payment Pending</h2>
      </div>
    </section>
  );
}

function PersonalForm({ payer, fieldErrors, onFieldChange }: any) {
  return (
    <div className="mt-3 space-y-3">
      <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5]">
        <label className="text-[11px] text-[#717171] font-semibold">Legal Full Name</label>
        <input value={payer.fullName} onChange={e => onFieldChange('fullName', e.target.value)} placeholder="Must be exactly as written" className="mt-1 w-full rounded bg-white px-3 py-2 text-[12px] border border-[#d5d5d5]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5]">
           <label className="text-[11px] text-[#717171] font-semibold">Email Address</label>
           <input value={payer.email} onChange={e => onFieldChange('email', e.target.value)} placeholder="name@domain.com" className="mt-1 w-full rounded bg-white px-3 py-2 text-[12px] border border-[#d5d5d5]" />
        </div>
        <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5]">
           <label className="text-[11px] text-[#717171] font-semibold">Date of Birth</label>
           <input value={payer.dob} onChange={e => onFieldChange('dob', e.target.value)} placeholder="DD/MM/YYYY" className="mt-1 w-full rounded bg-white px-3 py-2 text-[12px] border border-[#d5d5d5]" />
        </div>
      </div>
      <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5]">
        <label className="text-[11px] text-[#717171] font-semibold">Mobile Number</label>
        <input value={payer.mobile} onChange={e => onFieldChange('mobile', e.target.value)} placeholder="+44 7911 123456" className="mt-1 w-full rounded bg-white px-3 py-2 text-[12px] border border-[#d5d5d5]" />
      </div>
      <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5]">
        <label className="text-[11px] text-[#717171] font-semibold">Home Address</label>
        <input value={payer.address} onChange={e => onFieldChange('address', e.target.value)} placeholder="123 Example Street" className="mt-1 w-full rounded bg-white px-3 py-2 text-[12px] border border-[#d5d5d5]" />
        <input value={payer.postcode} onChange={e => onFieldChange('postcode', e.target.value)} placeholder="SW1A 1AA" className="mt-2 w-full rounded bg-white px-3 py-2 text-[12px] border border-[#d5d5d5]" />
      </div>
    </div>
  );
}

function CompanyForm({ payer, companyLoading, companyLoaded, directorLoading, directorLoaded, onCompanyRegChange, onDirectorSelect, onFieldChange }: any) {
  return (
    <div className="mt-3 space-y-3">
      <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5]">
        <label className="text-[11px] text-[#717171] font-semibold">Your Full Name (Authorised Representative)</label>
        <input value={payer.fullName} onChange={e => onFieldChange('fullName', e.target.value)} placeholder="Enter your full legal name" className="mt-1 w-full rounded bg-white px-3 py-2 text-[12px] border border-[#d5d5d5]" />
      </div>
      <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5]">
        <label className="text-[11px] text-[#717171] font-semibold">Company Email</label>
        <input value={payer.email} onChange={e => onFieldChange('email', e.target.value)} placeholder="name@company.com" className="mt-1 w-full rounded bg-white px-3 py-2 text-[12px] border border-[#d5d5d5]" />
      </div>
      <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5]">
        <label className="text-[11px] text-[#717171] font-semibold">Company Registration Number</label>
        <input value={payer.companyRegNo} onChange={e => onCompanyRegChange(e.target.value)} placeholder="E.g. RC 123654" className="mt-1 w-full rounded bg-white px-3 py-2 text-[12px] border border-[#d5d5d5]" />
        
        {companyLoading && (
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[#2a5f9e]">
            <Loader2 size={12} className="animate-spin" /> Fetching company details...
          </div>
        )}
        
        {companyLoaded && (
          <div className="mt-3">
            <div className="mb-3 rounded border border-green-200 bg-green-50 p-2">
              <p className="text-[12px] font-bold text-green-800">{payer.companyName}</p>
              <p className="text-[11px] text-green-700">{payer.companyAddress}</p>
            </div>
            <select aria-label="Director Name" value={payer.directorName} onChange={e => onDirectorSelect(e.target.value)} className="w-full mt-1 rounded border bg-white px-3 py-2 text-[12px]">
              <option value="">Select director...</option>
              {MOCK_COMPANY_DATA.directors.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            
            {directorLoading && (
              <div className="mt-2 flex items-center gap-2 text-[11px] text-[#2a5f9e]">
                <Loader2 size={12} className="animate-spin" /> Verifying director...
              </div>
            )}
            {directorLoaded && <span className="text-[11px] text-green-600 font-semibold mt-2 flex items-center gap-1"><Check size={12}/> Director Verified</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function RadioOption({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (<button onClick={onClick} className={`flex items-center gap-2 text-[13px] ${active ? 'text-[#ff4c16]' : 'text-[#9f9f9f]'}`}><span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${active ? 'border-[#ff4c16]' : 'border-[#d8d8d8]'}`}>{active && <span className="h-2 w-2 rounded-full bg-[#ff4c16]" />}</span><span className="font-semibold">{label}</span></button>);
}
function Panel({ children, className = '' }: any) { return <div className={`rounded-xl bg-white shadow-sm p-4 ${className}`}>{children}</div>; }
function KV({ label, value, bold = false }: any) { return (<div className="flex justify-between py-1"><span className="text-[#666]">{label}</span><span className={`${bold ? 'font-bold' : 'font-semibold'} text-[#333]`}>{value}</span></div>); }
function DataRow({ label, value }: any) { return (<div className="flex justify-between text-[12px] py-1 border-b border-[#eee] last:border-0"><span className="text-[#777]">{label}</span><span className="font-medium text-[#333]">{value}</span></div>); }
function AirPeaceBrandText({ size = 'md' }: any) { return (<div><p className={`${size==='sm'?'text-[12px]':'text-[16px]'} font-black italic text-[#2a5f9e]`}>AIR PEACE</p></div>); }
function Brand() { return <AirPeaceBrandText size="lg" />; }
function HeaderLogo() { return <div className="p-3"><AirPeaceBrandText size="sm" /></div>; }
function DesktopProgress() { return <div className="hidden sm:block flex-1"></div>; }
