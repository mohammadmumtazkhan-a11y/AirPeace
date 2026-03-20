'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Info,
  Loader2,
  RotateCcw,
  UserCheck,
  X,
  RefreshCcw,
  FileEdit,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Clock,
  BadgeCheck,
} from 'lucide-react';

// ==========================================
// TYPES & CONSTANTS
// ==========================================
type Stage =
  | 'scenario'
  | 'method'
  | 'summary'        // Screen 1: Entry / Payment Start
  | 'details'        // Screen 2: Account type selector (Personal / Company)
  | 'personal-form'  // Personal: Manual entry form (Use different details)
  | 'review'         // Screen 3: Review payer details
  | 'processing'     // Screen 4: Redirecting to bank
  | 'awaiting'       // Screen 5: Waiting for funds
  | 'received'       // Screen 6: Funds received / validating
  | 'success'        // Screen 7A: Payment approved
  | 'mismatch'       // Screen 7B: Name mismatch (Personal only)
  | 'refunding'      // Transitional: returning funds
  | 'refunded'       // Screen 7C: Funds returned
  | 'failure'        // Insufficient funds / generic failure
  | 'pending'
  | 'expired';       // Screen 8: Session expired

type AccountType = 'PERSONAL' | 'COMPANY';
type ExpectedOutcome = 'SUCCESS' | 'MISMATCH' | 'INSUFFICIENT_FUNDS' | 'PENDING';

// All users are pre-registered; partner provides name + email upfront
interface PayerDetails {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;       // Always pre-filled from partner, disabled
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

interface FieldErrors { [key: string]: string; }
interface ToastMessage { id: number; text: string; type: 'error' | 'success' | 'info'; }

interface DemoScenario {
  id: string;
  label: string;
  accountType: AccountType;
  expectedOutcome: ExpectedOutcome;
  description: string;
}

// ---- Mock partner data (supplied by AirPeace / the partner) ----
const PARTNER_DATA = {
  firstName: 'John',
  middleName: '',
  lastName: 'Doe',
  email: 'johndoe@email.com',
};

// Payer pre-populated with partner data (name + email always present)
const PARTNER_PAYER: PayerDetails = {
  firstName: PARTNER_DATA.firstName,
  middleName: PARTNER_DATA.middleName,
  lastName: PARTNER_DATA.lastName,
  email: PARTNER_DATA.email,
  dob: '', mobile: '', address: '', postcode: '',
  country: 'United Kingdom',
  companyRegNo: '', companyName: '', companyAddress: '', directorName: '',
};

const MOCK_COMPANY_DATA = {
  companyName: 'Acme Limited',
  companyAddress: '08 James Street, East London',
  directors: ['John Doe', 'Jane Smith', 'Michael Brown'],
};

const MOCK_MISMATCH_BANK_NAME = 'Jane A. Doe';

// Company has no name field → no mismatch scenario
const DEMO_SCENARIOS: DemoScenario[] = [
  { id: 'personal-success',     label: 'Personal — Success',         accountType: 'PERSONAL', expectedOutcome: 'SUCCESS',            description: 'Personal account payment. Name matches. Happy path.' },
  { id: 'personal-mismatch',    label: 'Personal — Name Mismatch',   accountType: 'PERSONAL', expectedOutcome: 'MISMATCH',           description: 'Name on bank account does not match payer profile.' },
  { id: 'company-success',      label: 'Company — Success',          accountType: 'COMPANY',  expectedOutcome: 'SUCCESS',            description: 'Company account payment. Happy path.' },
  { id: 'company-insufficient', label: 'Company — Insufficient Funds', accountType: 'COMPANY', expectedOutcome: 'INSUFFICIENT_FUNDS', description: 'Company payment fails due to insufficient balance.' },
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.25, ease: 'easeIn' } },
};
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

const TIMER_ACTIVE_STAGES: Stage[] = ['processing', 'awaiting', 'received'];

// Helper: build display name from payer fields
function getPayerFullName(p: PayerDetails): string {
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');
}

// ==========================================
// STATUS TRACKER
// ==========================================
const PAYMENT_STEPS         = ['Payment initiated from your bank', 'We are waiting to receive your funds', 'We have received your funds', 'We are validating that the bank account name matches the payer details provided', 'Payment approved'];
const PAYMENT_STEPS_MISMATCH = ['Payment initiated from your bank', 'We are waiting to receive your funds', 'We have received your funds', 'We are validating that the bank account name matches the payer details provided', 'Name mismatch — funds are being returned'];

function StatusTracker({ activeStep, isMismatch = false, isComplete = false }: { activeStep: number; isMismatch?: boolean; isComplete?: boolean }) {
  const steps = (isMismatch ? PAYMENT_STEPS_MISMATCH : PAYMENT_STEPS).map((label, idx) => {
    const n = idx + 1;
    let status: 'done' | 'active' | 'pending' = 'pending';
    if (isComplete || n < activeStep) status = 'done';
    else if (n === activeStep)        status = 'active';
    return { status, label };
  });
  return (
    <div className="w-full space-y-1">
      {steps.map((step, idx) => {
        const mismatchLast = isMismatch && idx === 4;
        return (
          <div key={idx} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold
                ${step.status === 'done'   ? (mismatchLast ? 'bg-amber-500 text-white' : 'bg-green-500 text-white')
                : step.status === 'active' ? (mismatchLast ? 'bg-amber-500 text-white' : 'bg-[#ff4c16] text-white')
                : 'bg-[#e0e0e0] text-[#aaa]'}`}>
                {step.status === 'done'   ? (mismatchLast ? <X size={11} /> : <Check size={11} />)
                : step.status === 'active' ? (mismatchLast ? <X size={11} /> : <Loader2 size={11} className="animate-spin" />)
                : <span>{idx + 1}</span>}
              </div>
              {idx < steps.length - 1 && <div className={`mt-0.5 h-3 w-0.5 ${step.status === 'done' ? 'bg-green-400' : 'bg-[#e0e0e0]'}`} />}
            </div>
            <p className={`pt-0.5 text-[11px] leading-snug
              ${step.status === 'done'   ? (mismatchLast ? 'text-amber-700 font-medium' : 'text-green-700 font-medium')
              : step.status === 'active' ? 'text-[#333] font-semibold'
              : 'text-[#bbb]'}`}>{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function TimerBadge({ display, urgent = false }: { display: string; urgent?: boolean }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${urgent ? 'bg-red-100 text-red-700' : 'bg-[#fff3ee] text-[#cc3a00]'}`}>
      <Clock3 size={13} />
      <span>You have <strong>{display}</strong> to complete this transaction</span>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AirPeacePaymentFlow() {
  const [stage, setStage]                   = useState<Stage>('scenario');
  const [accountType, setAccountType]       = useState<AccountType | null>(null);
  const [expectedOutcome, setExpectedOutcome] = useState<ExpectedOutcome>('SUCCESS');
  // Track which stage to go back to from Review
  const [prevPaymentStage, setPrevPaymentStage] = useState<Stage>('details');

  const [payer, setPayer]                   = useState<PayerDetails>({ ...PARTNER_PAYER });
  const [bankAccountName, setBankAccountName] = useState('');

  const [timer, setTimer]                   = useState(600);
  const [redirectCountdown, setRedirectCountdown] = useState(15);

  const [fieldErrors, setFieldErrors]       = useState<FieldErrors>({});

  const [isVerifying, setIsVerifying]       = useState(false);
  const [toasts, setToasts]                 = useState<ToastMessage[]>([]);

  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyLoaded, setCompanyLoaded]   = useState(false);
  const [directorLoading, setDirectorLoading] = useState(false);
  const [directorLoaded, setDirectorLoaded] = useState(false);

  const [recognitionChecking, setRecognitionChecking] = useState(false);
  const [hasAcknowledgedWarning, setHasAcknowledgedWarning] = useState(false);
  const [isShowingWarningModal, setIsShowingWarningModal] = useState(false);

  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);

  const toastIdRef      = useRef(0);
  const companyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Countdown timer ----
  useEffect(() => {
    if (!TIMER_ACTIVE_STAGES.includes(stage) || timer <= 0) return;
    const id = setInterval(() => setTimer(v => v > 0 ? v - 1 : 0), 1000);
    return () => clearInterval(id);
  }, [stage, timer]);

  // ---- Session expiry ----
  useEffect(() => {
    if (timer === 0 && TIMER_ACTIVE_STAGES.includes(stage)) setStage('expired');
  }, [timer, stage]);

  const timerDisplay  = useMemo(() => `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`, [timer]);
  const isTimerUrgent = timer < 120;

  const addToast = useCallback((text: string, type: 'error' | 'success' | 'info' = 'error') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);
  const removeToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  // ---- Scenario start ----
  const handleStartScenario = useCallback((scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setExpectedOutcome(scenario.expectedOutcome);
    setAccountType(null);
    setFieldErrors({});
    setTimer(600);
    setRedirectCountdown(15);
    setBankAccountName('');
    setCompanyLoaded(false); setCompanyLoading(false);
    setDirectorLoaded(false); setDirectorLoading(false);
    setIsVerifying(false);
    setHasAcknowledgedWarning(false);
    setIsShowingWarningModal(false);
    setPrevPaymentStage('details');
    setPayer({ ...PARTNER_PAYER }); // pre-populate with partner data
    setStage('method');
  }, []);

  const handleRestart = useCallback(() => {
    setStage('scenario');
    setSelectedScenario(null);
    setToasts([]);
    setTimer(600);
    setRedirectCountdown(15);
    setBankAccountName('');
    setAccountType(null);
  }, []);

  // ---- Summary → Details (account type selector) ----
  const handleAfterSummary = useCallback(() => {
    setAccountType(null);
    setStage('details');
  }, []);

  // ---- Personal selected → recognition ----
  const handleSelectPersonal = useCallback(() => {
    setAccountType('PERSONAL');
    setFieldErrors({});
  }, []);

  // ---- Company selected → company form ----
  const handleSelectCompany = useCallback(() => {
    setAccountType('COMPANY');
    setFieldErrors({});
    setCompanyLoaded(false); setCompanyLoading(false);
    setDirectorLoaded(false); setDirectorLoading(false);
    // Keep email from partner, clear everything else
    setPayer(prev => ({ ...prev, firstName: '', middleName: '', lastName: '', companyRegNo: '', companyName: '', companyAddress: '', directorName: '' }));
  }, [setAccountType, setFieldErrors, setCompanyLoaded, setCompanyLoading, setDirectorLoaded, setDirectorLoading, setPayer]);

  // ---- Recognition check simulation ----
  useEffect(() => {
    if (stage === 'recognition' && recognitionChecking) {
      const id = setTimeout(() => setRecognitionChecking(false), 1500);
      return () => clearTimeout(id);
    }
  }, [stage, recognitionChecking]);

  // ---- Company lookup ----
  const handleCompanyRegChange = useCallback((val: string) => {
    setPayer(prev => ({ ...prev, companyRegNo: val }));
    setCompanyLoaded(false); setDirectorLoaded(false); setDirectorLoading(false);
    if (companyTimerRef.current) clearTimeout(companyTimerRef.current);
    if (val.trim().length >= 4) {
      setCompanyLoading(true);
      companyTimerRef.current = setTimeout(() => {
        setCompanyLoading(false); setCompanyLoaded(true);
        setPayer(prev => ({ ...prev, companyName: MOCK_COMPANY_DATA.companyName, companyAddress: MOCK_COMPANY_DATA.companyAddress }));
      }, 1200);
    } else {
      setCompanyLoading(false);
    }
  }, []);

  const handleDirectorSelect = useCallback((name: string) => {
    setPayer(prev => ({ ...prev, directorName: name }));
    if (!name) { setDirectorLoaded(false); return; }
    setDirectorLoading(true);
    setTimeout(() => { setDirectorLoading(false); setDirectorLoaded(true); }, 900);
  }, []);

  const handleFieldChange = useCallback((field: keyof PayerDetails, value: string) => {
    setPayer(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  // ---- Personal form submit → review ----
  const handlePersonalFormSubmit = useCallback(() => {
    const errors: FieldErrors = {};
    if (!payer.firstName.trim()) errors.firstName = 'First name is required';
    if (!payer.lastName.trim())  errors.lastName  = 'Last name is required';
    if (!payer.dob.trim())       errors.dob       = 'Date of birth is required';
    if (!payer.mobile.trim())    errors.mobile    = 'Mobile number is required';
    if (!payer.address.trim())   errors.address   = 'Address is required';
    if (!payer.postcode.trim())  errors.postcode  = 'Postcode is required';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); addToast('Please fill in all required fields.'); return; }
    setPrevPaymentStage('personal-form');
    setStage('review');
  }, [payer, addToast]);

  // ---- Company form submit → review ----
  const handleCompanyFormSubmit = useCallback(() => {
    const errors: FieldErrors = {};
    if (!payer.firstName.trim()) errors.firstName = 'Full name is required';
    if (!payer.companyRegNo.trim() || !companyLoaded) errors.companyRegNo = 'Valid company registration required';
    if (!payer.directorName.trim() || !directorLoaded) errors.directorName = 'Verified director required';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); addToast('Please fill in all required fields.'); return; }
    setPrevPaymentStage('details');
    setStage('review');
  }, [payer, companyLoaded, directorLoaded, addToast]);



  // ---- Review "Confirm and continue" → processing ----
  // Warning modal only applies to Personal (name mismatch check)
  const handleConfirmAndPay = useCallback((force = false) => {
    if (!hasAcknowledgedWarning && !force) {
      setIsShowingWarningModal(true);
      return;
    }
    setStage('processing');
  }, [hasAcknowledgedWarning]);

  // ---- Post-payment stage transitions ----
  useEffect(() => { if (stage !== 'processing') return; const id = setTimeout(() => setStage('awaiting'), 3000);  return () => clearTimeout(id); }, [stage]);
  useEffect(() => { if (stage !== 'awaiting')   return; const id = setTimeout(() => setStage('received'), 5000);  return () => clearTimeout(id); }, [stage]);
  useEffect(() => {
    if (stage !== 'received') return;
    const id = setTimeout(() => {
      if      (expectedOutcome === 'SUCCESS')            setStage('success');
      else if (expectedOutcome === 'MISMATCH' && accountType === 'PERSONAL') { setBankAccountName(MOCK_MISMATCH_BANK_NAME); setStage('mismatch'); }
      else if (expectedOutcome === 'MISMATCH' && accountType === 'COMPANY')  setStage('success'); // Company has no mismatch — always approve
      else if (expectedOutcome === 'INSUFFICIENT_FUNDS') setStage('failure');
      else                                               setStage('pending');
    }, 5000);
    return () => clearTimeout(id);
  }, [stage, expectedOutcome, accountType]);

  // ---- 15-second auto-redirect on success ----
  useEffect(() => {
    if (stage !== 'success') return;
    setRedirectCountdown(15);
    const id = setInterval(() => {
      setRedirectCountdown(prev => { if (prev <= 1) { clearInterval(id); handleRestart(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [stage, handleRestart]);

  // ---- Refunding → refunded ----
  useEffect(() => { if (stage !== 'refunding') return; const id = setTimeout(() => setStage('refunded'), 3000); return () => clearTimeout(id); }, [stage]);

  const showWarningModal = isShowingWarningModal && !hasAcknowledgedWarning;

  return (
    <main className={`min-h-screen ${stage === 'scenario' ? 'bg-[#1a1a2e]' : stage === 'method' ? 'bg-[#ebeced]' : 'bg-[#474747]'}`}>
      <div className={`relative mx-auto flex min-h-screen w-full flex-col ${stage === 'scenario' || stage === 'method' ? '' : 'max-w-[480px] bg-[#efefef] shadow-2xl sm:my-8 sm:min-h-[800px] sm:rounded-[40px] overflow-hidden'}`}>

        {stage !== 'scenario' && (
          <button onClick={handleRestart} className="fixed right-3 top-3 z-50 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#555] shadow-md backdrop-blur-sm hover:bg-white">
            <RotateCcw size={12} /> Switch Flow
          </button>
        )}

        {selectedScenario && stage !== 'method' && (
          <div className="mx-3 mt-2 rounded-lg bg-[#2a5f9e]/10 px-3 py-1.5 text-center">
            <p className="text-[10px] font-semibold text-[#2a5f9e]">{selectedScenario.label}</p>
          </div>
        )}

        <div className="fixed left-1/2 top-10 z-50 w-full max-w-[480px] -translate-x-1/2 px-3">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div key={toast.id} initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
                className={`mb-2 flex items-start gap-2 rounded-lg px-3 py-3 shadow-lg ${toast.type === 'error' ? 'border border-red-200 bg-red-50 text-red-800' : 'border border-blue-200 bg-blue-50 text-blue-800'}`}>
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p className="flex-1 text-[12px] font-medium leading-snug">{toast.text}</p>
                <button onClick={() => removeToast(toast.id)} className="flex-shrink-0"><X size={14} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showWarningModal && (
            <ImportantInformationModal
              onConfirm={() => { setHasAcknowledgedWarning(true); setIsShowingWarningModal(false); handleConfirmAndPay(true); }}
              onBack={() => {
                setIsShowingWarningModal(false);
                setFieldErrors({});
                setStage('personal-form');
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isVerifying && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl">
                <Loader2 className="h-10 w-10 animate-spin text-[#ff4c16]" />
                <p className="text-[14px] font-semibold text-[#444]">Verifying your details...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {stage !== 'scenario' && stage !== 'method' && <HeaderLogo />}

        <AnimatePresence mode="wait">

          {stage === 'scenario' && (
            <motion.div key="scenario" {...fadeIn} className="w-full h-full">
              <ScenarioSelector scenarios={DEMO_SCENARIOS} onSelect={handleStartScenario} />
            </motion.div>
          )}

          {stage === 'method' && (
            <motion.div key="method" {...fadeIn} className="w-full h-full">
              <MethodSelectionScreen onContinue={() => setStage('summary')} onBack={handleRestart} scenario={selectedScenario} />
            </motion.div>
          )}

          {/* Screen 1: Entry / Payment Start */}
          {stage === 'summary' && (
            <motion.div key="summary" {...pageVariants}>
              <SummaryScreen timer={timerDisplay} onContinue={handleAfterSummary} />
            </motion.div>
          )}

          {/* Screen 2: Account type selector / Personal details */}
          {stage === 'details' && (
            <motion.div key="details" {...pageVariants}>
              <DetailsScreen
                accountType={accountType}
                payer={payer}
                onSelectPersonal={handleSelectPersonal}
                onSelectCompany={handleSelectCompany}
                onConfirmPersonal={() => {
                  // Ensure partner name is always set before payment (guards against edge case where names were cleared)
                  if (!payer.firstName.trim() && !payer.lastName.trim()) {
                    setPayer(prev => ({ ...prev, firstName: PARTNER_DATA.firstName, middleName: PARTNER_DATA.middleName, lastName: PARTNER_DATA.lastName }));
                  }
                  handleConfirmAndPay();
                }}
                onConfirmCompany={handleCompanyFormSubmit}
                companyLoading={companyLoading}
                companyLoaded={companyLoaded}
                directorLoading={directorLoading}
                directorLoaded={directorLoaded}
                onFieldChange={handleFieldChange}
                onCompanyRegChange={handleCompanyRegChange}
                onDirectorSelect={handleDirectorSelect}
                onUseDifferent={() => {
                  setPayer(prev => ({ ...prev, firstName: '', middleName: '', lastName: '' }));
                  setFieldErrors({});
                  setStage('personal-form');
                }}
                onBack={() => setStage('summary')}
              />
            </motion.div>
          )}



          {/* Personal: Manual form */}
          {stage === 'personal-form' && (
            <motion.div key="personal-form" {...pageVariants} className="flex-1">
              <PersonalFormScreen
                payer={payer}
                fieldErrors={fieldErrors}
                onFieldChange={handleFieldChange}
                onContinue={handlePersonalFormSubmit}
                onBack={() => {
                  // Restore partner data names when returning to the pre-filled details screen
                  setPayer(prev => ({ ...prev, firstName: PARTNER_DATA.firstName, middleName: PARTNER_DATA.middleName, lastName: PARTNER_DATA.lastName }));
                  setAccountType(null);
                  setStage('details');
                }}
              />
            </motion.div>
          )}



          {/* Screen 3: Review */}
          {stage === 'review' && (
            <motion.div key="review" {...pageVariants} className="flex-1">
              <ReviewScreen
                payer={payer}
                accountType={accountType!}
                onSubmit={() => handleConfirmAndPay()}
                onBack={() => setStage(prevPaymentStage)}
              />
            </motion.div>
          )}

          {/* Screen 4: Redirecting */}
          {stage === 'processing' && (
            <motion.div key="processing" {...pageVariants}>
              <ProcessingScreen timer={timerDisplay} isUrgent={isTimerUrgent} />
            </motion.div>
          )}

          {/* Screen 5: Awaiting funds */}
          {stage === 'awaiting' && (
            <motion.div key="awaiting" {...pageVariants}>
              <AwaitingScreen timer={timerDisplay} isUrgent={isTimerUrgent} />
            </motion.div>
          )}

          {/* Screen 6: Received / Validating */}
          {stage === 'received' && (
            <motion.div key="received" {...pageVariants}>
              <ReceivedScreen timer={timerDisplay} isUrgent={isTimerUrgent} />
            </motion.div>
          )}

          {/* Screen 7A: Approved */}
          {stage === 'success' && (
            <motion.div key="success" {...pageVariants}>
              <SuccessScreen redirectCountdown={redirectCountdown} onReturnNow={handleRestart} />
            </motion.div>
          )}

          {/* Screen 7B: Name Mismatch (Personal only) */}
          {stage === 'mismatch' && (
            <motion.div key="mismatch" {...pageVariants}>
              <MismatchScreen
                payerName={getPayerFullName(payer)}
                bankName={bankAccountName}
                onCorrectDetails={() => {
                  setHasAcknowledgedWarning(false);
                  setPayer(prev => ({ ...prev, firstName: '', middleName: '', lastName: '' }));
                  setStage('personal-form');
                }}
                onRefunding={() => setStage('refunding')}
              />
            </motion.div>
          )}

          {stage === 'refunding' && (
            <motion.div key="refunding" {...pageVariants}><RefundingScreen /></motion.div>
          )}

          {/* Screen 7C: Funds returned */}
          {stage === 'refunded' && (
            <motion.div key="refunded" {...pageVariants}>
              <RefundedScreen
                onCorrectDetails={() => {
                  setHasAcknowledgedWarning(false);
                  setPayer(prev => ({ ...prev, firstName: '', middleName: '', lastName: '' }));
                  setStage('personal-form');
                }}
                onRestart={handleRestart}
              />
            </motion.div>
          )}

          {/* Insufficient funds */}
          {stage === 'failure' && (
            <motion.div key="failure" {...pageVariants}>
              <FailureScreen
                onRetryBank={() => setStage('processing')}
                onRestartNew={() => { setHasAcknowledgedWarning(false); setAccountType(null); setStage('details'); }}
              />
            </motion.div>
          )}

          {/* Screen 8: Expired */}
          {stage === 'expired' && (
            <motion.div key="expired" {...pageVariants}>
              <SessionExpiredScreen onRestart={handleRestart} />
            </motion.div>
          )}

          {stage === 'pending' && (
            <motion.div key="pending" {...pageVariants}>
              <PendingScreen onRestart={handleRestart} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}

// ==========================================
// SCENARIO SELECTOR
// ==========================================
function ScenarioSelector({ scenarios, onSelect }: { scenarios: DemoScenario[]; onSelect: (s: DemoScenario) => void }) {
  return (
    <div className="mx-auto max-w-[600px] px-4 py-8">
      <div className="text-center">
        <p className="text-[28px] font-black italic leading-none text-[#2a5f9e]">AIR PEACE</p>
        <p className="mt-1 text-[10px] font-semibold italic text-[#be4d44]">...your peace, our goal</p>
        <h1 className="mt-6 text-[22px] font-bold text-white">Mito.Money Payment Pages Flow</h1>
        <p className="mt-1 text-[12px] text-white/50">Select a scenario to preview the payment journey</p>
      </div>
      <div className="mt-8 grid gap-2">
        {scenarios.map(s => (
          <motion.button key={s.id} onClick={() => onSelect(s)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left">
            <p className="text-[13px] font-semibold text-white">{s.label}</p>
            <p className="mt-0.5 text-[11px] text-white/50">{s.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// METHOD SELECTION SCREEN
// ==========================================
function MethodSelectionScreen({ onContinue, onBack, scenario }: { onContinue: () => void; onBack: () => void; scenario: DemoScenario | null }) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
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
            <div className={`h-2 w-2 rounded-full ${scenario.accountType === 'PERSONAL' ? 'bg-[#ff4c16]' : 'bg-green-500'}`} />
            <p className="text-[11px] font-semibold text-[#2a5f9e]">{scenario.label}</p>
            <button onClick={onBack} className="ml-auto text-[11px] text-[#2a5f9e] underline">Change</button>
          </div>
        )}
        <h2 className="text-[22px] font-semibold text-[#1f1f1f] sm:text-[31px]">Please Choose a Payment Method</h2>
        <div className="mt-5 space-y-1.5">
          {[{ id: 'paystack', title: 'Paystack' }, { id: 'bank', title: 'Pay by Bank (instant transfer)', highlight: true }].map(m => (
            <motion.button key={m.id} onClick={() => setSelectedMethod(m.id)} whileTap={{ scale: 0.99 }}
              className={`w-full rounded-[4px] border bg-white px-3 py-3 text-left ${selectedMethod === m.id ? 'border-[#89a9d2] shadow-sm' : m.highlight ? 'border-[#ff7043]' : 'border-[#d8e0e6]'}`}>
              <div className="flex items-center justify-between">
                <p className={`text-[16px] font-semibold sm:text-[20px] ${m.highlight && selectedMethod !== m.id ? 'text-[#e64a19]' : 'text-[#2f2f2f]'}`}>{m.title}</p>
                <ChevronRight size={16} className="text-[#202020]" />
              </div>
            </motion.button>
          ))}
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button type="button" onClick={onBack} className="rounded-[4px] border border-[#6885a6] bg-[#f8fbff] px-10 py-2.5 text-[12px] font-semibold text-[#3f5f81]">BACK</button>
          <div className="flex items-center justify-between gap-4 sm:gap-6">
            <p className="text-[13px] font-semibold text-[#1f2d3d]">TOTAL £550.00</p>
            <motion.button type="button" disabled={!canContinue} onClick={onContinue} whileTap={canContinue ? { scale: 0.97 } : {}}
              className={`rounded-[4px] px-8 py-2.5 text-[12px] font-semibold text-white ${canContinue ? 'bg-[#3457a5]' : 'bg-[#9aa8c9]'}`}>Make Payment</motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SCREEN 1: ENTRY / PAYMENT START
// ==========================================
function SummaryScreen({ timer, onContinue }: { timer: string; onContinue: () => void }) {
  return (
    <section className="px-3 pb-4">
      <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm">
        <Brand />
        <div className="mt-5 space-y-2 rounded-lg bg-[#f4f4f4] px-4 py-3 text-[13px]">
          <KV label="Total" value="£ 550.00" bold />
          <KV label="Reference" value="BNSCD1234567788TG" />
          <KV label="Paying to" value="Air Peace" />
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#fff3ee] px-3 py-2 text-[12px] text-[#cc3a00]">
          <Clock3 size={13} />
          <p className="font-semibold">You have <span className="text-[#ff4d1b] font-bold">{timer}</span> to make payment</p>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#dceeff] bg-[#f0f6ff] px-3 py-3 text-[12px] text-[#2a5f9e]">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <p>Please provide the payer details for this transaction. The bank account used for payment must be in the payer's name.</p>
        </div>
        <motion.button onClick={onContinue} whileTap={{ scale: 0.98 }} className="mt-6 w-full rounded-lg bg-[#ff4c16] py-3.5 text-[18px] font-bold text-white">
          Continue
        </motion.button>
      </div>
    </section>
  );
}

// ==========================================
// SCREEN 2: ACCOUNT TYPE SELECTOR
// ==========================================
function DetailsScreen({
  accountType, payer, onSelectPersonal, onSelectCompany, onConfirmPersonal, onConfirmCompany,
  onUseDifferent, onBack, companyLoading, companyLoaded, directorLoading, directorLoaded,
  onFieldChange, onCompanyRegChange, onDirectorSelect, fieldErrors = {}
}: {
  accountType: AccountType | null;
  payer: PayerDetails;
  onSelectPersonal: () => void;
  onSelectCompany: () => void;
  onConfirmPersonal: () => void;
  onConfirmCompany: () => void;
  onUseDifferent: () => void;
  onBack: () => void;
  companyLoading?: boolean;
  companyLoaded?: boolean;
  directorLoading?: boolean;
  directorLoaded?: boolean;
  onFieldChange?: (f: keyof PayerDetails, v: string) => void;
  onCompanyRegChange?: (v: string) => void;
  onDirectorSelect?: (v: string) => void;
  fieldErrors?: FieldErrors;
}) {
  const canContinueCompany = companyLoaded && directorLoaded;
  return (
    <section className="flex flex-col px-3 pb-4">
      <button onClick={onBack} className="mb-2 flex items-center gap-1 text-[12px] text-[#777]"><ArrowLeft size={14} /> Back</button>
      <Panel>
        <div className="flex items-start gap-2 text-[#3b7dd8] bg-[#e7f2ff] px-3 py-2.5 rounded-lg border border-[#9ac6f4] text-[12px] mb-4">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <p>Please select how you will be paying. The bank account used must be in the payer's name.</p>
        </div>
        <p className="text-[12px] font-semibold text-[#3a3a3a] mb-3">Select payer account type</p>
        <div className="flex items-center gap-5">
          <RadioOption active={accountType === 'PERSONAL'} onClick={onSelectPersonal} label="Personal" />
          <RadioOption active={accountType === 'COMPANY'} onClick={onSelectCompany} label="Company" />
        </div>
      </Panel>

      <AnimatePresence mode="wait">
        {accountType === 'PERSONAL' && (
          <motion.div key="personal" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-4 overflow-hidden">
            {/* Payer details + warning card */}
            <div className="overflow-hidden rounded-xl bg-white px-4 py-4 shadow-sm border border-[#e0e0e0]">
              <h3 className="text-[14px] font-bold text-[#3a3a3a] mb-3">Payer Information</h3>
              <div className="bg-[#f8f8f8] px-3 py-2.5 rounded-lg">
                <DataRow label="Payer Name" value={getPayerFullName(payer)} />
                <DataRow label="Email"      value={payer.email} />
              </div>
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
                <span>The bank account used for payment must be in the payer's name. Mismatches will cause verification to fail and funds to be returned.</span>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button onClick={onConfirmPersonal} whileTap={{ scale: 0.98 }} className="w-full rounded-lg bg-[#ff4c16] py-3.5 text-[18px] font-bold text-white shadow-md">
                Confirm and continue
              </motion.button>
              <button onClick={onUseDifferent} className="w-full rounded-lg bg-white border border-[#ddd] py-3.5 text-[16px] font-semibold text-[#555] shadow-sm">
                Use different details
              </button>
            </div>
          </motion.div>
        )}

        {accountType === 'COMPANY' && (
          <motion.div key="company" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-4 overflow-hidden">
            <div className="overflow-hidden rounded-xl bg-white px-4 py-4 shadow-sm border border-[#e0e0e0]">
              <h3 className="text-[14px] font-bold text-[#3a3a3a] mb-3">Payer Information</h3>
              
              <div className="space-y-4">
                {/* Payer Name */}
                <div className="bg-[#f4f4f4] p-3 rounded-lg border border-[#e5e5e5]">
                  <label className="text-[11px] text-[#717171] font-bold">Full Legal Name</label>
                  <input
                    value={payer.firstName}
                    onChange={e => onFieldChange?.('firstName', e.target.value)}
                    placeholder="Enter your full legal name"
                    className={`mt-1 w-full rounded border border-[#d5d5d5] bg-white px-3 py-2.5 text-[12px] text-[#333] ${fieldErrors?.firstName ? 'border-red-400' : ''}`}
                  />
                  {fieldErrors?.firstName && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.firstName}</p>}
                </div>

                {/* Company Email */}
                <div className="bg-[#f4f4f4] p-3 rounded-lg border border-[#e5e5e5]">
                  <label className="text-[11px] text-[#717171] font-bold">Company Email</label>
                  <input
                    value={payer.email}
                    onChange={e => onFieldChange?.('email', e.target.value)}
                    placeholder="name@company.com"
                    className="mt-1 w-full rounded border border-[#d5d5d5] bg-white px-3 py-2.5 text-[12px] text-[#333]"
                  />
                </div>

                {/* Company Registration Number */}
                <div className="bg-[#f4f4f4] p-3 rounded-lg border border-[#e5e5e5]">
                  <label className="text-[11px] text-[#717171] font-bold">Company Registration Number</label>
                  <input
                    value={payer.companyRegNo}
                    onChange={e => onCompanyRegChange?.(e.target.value)}
                    placeholder="E.g. RC 123654"
                    className={`mt-1 w-full rounded border px-3 py-2.5 text-[12px] bg-white ${fieldErrors?.companyRegNo ? 'border-red-400' : 'border-[#d5d5d5]'}`}
                  />
                  {fieldErrors?.companyRegNo && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.companyRegNo}</p>}

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
                      <label className="text-[11px] text-[#717171] font-bold">Select Director</label>
                      <select
                        aria-label="Director Name"
                        value={payer.directorName}
                        onChange={e => onDirectorSelect?.(e.target.value)}
                        className="mt-1 w-full rounded border border-[#d5d5d5] bg-white px-3 py-2.5 text-[12px]"
                      >
                        <option value="">Select director...</option>
                        {MOCK_COMPANY_DATA.directors.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      {directorLoading && (
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-[#2a5f9e]">
                          <Loader2 size={12} className="animate-spin" /> Verifying director...
                        </div>
                      )}
                      {directorLoaded && (
                        <span className="text-[11px] text-green-600 font-bold mt-2 flex items-center gap-1">
                          <Check size={12} /> Director Verified
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <motion.button
              disabled={!canContinueCompany}
              onClick={onConfirmCompany}
              whileTap={canContinueCompany ? { scale: 0.98 } : {}}
              className={`w-full rounded-lg py-3.5 text-[18px] font-bold text-white shadow-md transition-all ${canContinueCompany ? 'bg-[#ff4c16]' : 'bg-[#f4a18e] cursor-not-allowed'}`}
            >
              Review details
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}



// ==========================================
// PERSONAL: MANUAL FORM (Use different details)
// ==========================================
function PersonalFormScreen({ payer, fieldErrors, onFieldChange, onContinue, onBack }: {
  payer: PayerDetails; fieldErrors: FieldErrors; onFieldChange: (f: keyof PayerDetails, v: string) => void; onContinue: () => void; onBack: () => void;
}) {
  const canContinue = payer.firstName.trim().length > 0 && payer.lastName.trim().length > 0;
  return (
    <section className="flex flex-col px-3 pb-4">
      <button onClick={onBack} className="mb-2 flex items-center gap-1 text-[12px] text-[#777]"><ArrowLeft size={14} /> Back</button>
      <Panel>
        <h3 className="text-[14px] font-semibold text-[#3a3a3a] mb-3">Payer Information</h3>

        {/* Legal Name — split into three fields */}
        <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5] mb-3">
          <label className="text-[11px] text-[#717171] font-semibold">Legal Name</label>
          <input
            value={payer.firstName} onChange={e => onFieldChange('firstName', e.target.value)}
            placeholder="Must be exactly as on your bank account"
            className={`mt-2 w-full rounded bg-white px-3 py-2 text-[12px] border ${fieldErrors.firstName ? 'border-red-400' : 'border-[#d5d5d5]'}`}
          />
          {fieldErrors.firstName && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.firstName}</p>}
          <input
            value={payer.middleName} onChange={e => onFieldChange('middleName', e.target.value)}
            placeholder="Middle name (optional)"
            className="mt-2 w-full rounded bg-white px-3 py-2 text-[12px] border border-[#d5d5d5]"
          />
          <input
            value={payer.lastName} onChange={e => onFieldChange('lastName', e.target.value)}
            placeholder="Last name"
            className={`mt-2 w-full rounded bg-white px-3 py-2 text-[12px] border ${fieldErrors.lastName ? 'border-red-400' : 'border-[#d5d5d5]'}`}
          />
          {fieldErrors.lastName && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.lastName}</p>}
        </div>

        {/* Email — pre-filled and disabled */}
        <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5] mb-3">
          <label className="text-[11px] text-[#717171] font-semibold">Email Address</label>
          <input value={payer.email} disabled className="mt-1 w-full rounded bg-[#efefef] px-3 py-2 text-[12px] border border-[#d5d5d5] text-[#888] cursor-not-allowed" />
        </div>

        {/* DOB + Mobile */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5]">
            <label className="text-[11px] text-[#717171] font-semibold">Date of Birth</label>
            <input value={payer.dob} onChange={e => onFieldChange('dob', e.target.value)} placeholder="DD/MM/YYYY"
              className={`mt-1 w-full rounded bg-white px-3 py-2 text-[12px] border ${fieldErrors.dob ? 'border-red-400' : 'border-[#d5d5d5]'}`} />
          </div>
          <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5]">
            <label className="text-[11px] text-[#717171] font-semibold">Mobile Number</label>
            <input value={payer.mobile} onChange={e => onFieldChange('mobile', e.target.value)} placeholder="+44 7911 123456"
              className={`mt-1 w-full rounded bg-white px-3 py-2 text-[12px] border ${fieldErrors.mobile ? 'border-red-400' : 'border-[#d5d5d5]'}`} />
          </div>
        </div>

        {/* Home Address */}
        <div className="bg-[#f8f8f8] p-3 rounded-lg border border-[#e5e5e5]">
          <label className="text-[11px] text-[#717171] font-semibold">Home Address</label>
          <input value={payer.address} onChange={e => onFieldChange('address', e.target.value)} placeholder="123 Example Street"
            className={`mt-1 w-full rounded bg-white px-3 py-2 text-[12px] border ${fieldErrors.address ? 'border-red-400' : 'border-[#d5d5d5]'}`} />
          <input value={payer.postcode} onChange={e => onFieldChange('postcode', e.target.value)} placeholder="SW1A 1AA"
            className={`mt-2 w-full rounded bg-white px-3 py-2 text-[12px] border ${fieldErrors.postcode ? 'border-red-400' : 'border-[#d5d5d5]'}`} />
        </div>
      </Panel>

      <motion.button disabled={!canContinue} onClick={onContinue} whileTap={canContinue ? { scale: 0.98 } : {}}
        className={`mt-4 w-full rounded-lg py-3 text-[18px] font-bold text-white shadow-sm transition-all ${canContinue ? 'bg-[#ff4c16] hover:bg-[#e64516]' : 'cursor-not-allowed bg-[#efb8a8]'}`}>
        Review details
      </motion.button>
    </section>
  );
}



// ==========================================
// SCREEN 3: REVIEW PAYER DETAILS
// ==========================================
function ReviewScreen({ payer, accountType, onSubmit, onBack }: { payer: PayerDetails; accountType: AccountType; onSubmit: () => void; onBack: () => void }) {
  const isCompany = accountType === 'COMPANY';
  return (
    <section className="flex flex-col px-3 pb-4">
      <button onClick={onBack} className="mb-2 flex items-center gap-1 text-[12px] text-[#777]"><ArrowLeft size={14} /> Back</button>
      <Panel>
        <h2 className="text-[15px] font-semibold text-[#3a3a3a]">Review your payer details</h2>
        <p className="mt-1 text-[12px] text-[#6e6e6e]">Please confirm your information is correct before continuing</p>
      </Panel>

      <Panel className="mt-2.5">
        <div className="bg-[#f8f8f8] px-3 py-2.5 rounded-lg">
          {isCompany ? (
            <>
              <DataRow label="Company"  value={payer.companyName} />
              <DataRow label="Director" value={payer.directorName} />
              <DataRow label="Email"    value={payer.email} />
            </>
          ) : (
            <>
              <DataRow label="Payer Name" value={getPayerFullName(payer)} />
              <DataRow label="Email"      value={payer.email} />
            </>
          )}
        </div>
        {!isCompany && (
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span>The bank account used for payment must be in the payer's name. Mismatches will cause verification to fail and funds to be returned.</span>
          </div>
        )}
      </Panel>

      <motion.button onClick={onSubmit} whileTap={{ scale: 0.98 }} className="mt-4 w-full rounded-lg py-3 text-[18px] font-bold text-white shadow-md bg-[#ff4c16] hover:bg-[#e64516]">
        Confirm and continue
      </motion.button>
      <button onClick={onBack} className="mt-2 w-full rounded-lg border border-[#ccc] bg-white py-2.5 text-[13px] font-semibold text-[#666]">
        Edit details
      </button>
    </section>
  );
}

// ==========================================
// IMPORTANT INFORMATION MODAL (Personal only)
// ==========================================
function ImportantInformationModal({ onConfirm, onBack }: { onConfirm: () => void; onBack: () => void }) {
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
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[6px] border border-[#fce3a1] bg-white p-3.5 shadow-sm">
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#cca01d]" />
          <span className="text-[14px] font-bold leading-snug text-[#1f2d3d]">I confirm that the name provided matches the bank account name exactly.</span>
        </label>
        <button onClick={onConfirm} disabled={!checked}
          className={`mt-5 w-full rounded-lg py-2.5 text-[15px] font-bold text-white transition-colors ${checked ? 'bg-[#ff4c16] hover:bg-[#e64516]' : 'bg-[#f4c2b3] cursor-not-allowed'}`}>
          Acknowledge
        </button>
        <button onClick={onBack} className="mt-3 w-full py-1 text-[13px] font-semibold text-[#b08518] underline">Change payer info</button>
      </motion.div>
    </motion.div>
  );
}

// ==========================================
// SCREEN 4: REDIRECTING TO BANK
// ==========================================
function ProcessingScreen({ timer, isUrgent }: { timer: string; isUrgent: boolean }) {
  return (
    <section className="px-3">
      <div className="overflow-hidden rounded-xl bg-white px-4 py-8 shadow-sm text-center">
        <Brand />
        <div className="mt-6 flex items-center justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-[#fff3ee] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff4c16]" />
            </div>
            <motion.div className="absolute inset-0 rounded-full border-4 border-[#ff4c16]/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </div>
        <h2 className="mt-5 text-[20px] font-bold text-[#333]">Redirecting you securely</h2>
        <p className="mt-2 text-[13px] text-[#666] leading-relaxed">You will now complete the transfer from your bank. Please do not close this page.</p>
        <div className="mt-5"><TimerBadge display={timer} urgent={isUrgent} /></div>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#999]">
          <ShieldCheck size={12} /><span>Secured by Mito.Money</span>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// SCREEN 5: AWAITING FUNDS
// ==========================================
function AwaitingScreen({ timer, isUrgent }: { timer: string; isUrgent: boolean }) {
  return (
    <section className="px-3 pb-4 space-y-3">
      <Panel>
        <Brand />
        <div className="mt-4"><TimerBadge display={timer} urgent={isUrgent} /></div>
        <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 px-3 py-3 text-[12px] text-blue-800 flex items-start gap-2">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <span>Your transfer has been initiated from your bank. Please do not close this page while we wait to receive your funds.</span>
        </div>
      </Panel>
      <Panel>
        <h3 className="text-[13px] font-bold text-[#333] mb-3">Payment Status</h3>
        <StatusTracker activeStep={2} />
      </Panel>
      <Panel>
        <div className="flex items-center gap-2 text-[12px] text-[#666]">
          <Loader2 size={13} className="animate-spin text-[#ff4c16]" />
          <span>Waiting to receive your funds...</span>
        </div>
      </Panel>
    </section>
  );
}

// ==========================================
// SCREEN 6: FUNDS RECEIVED / VALIDATING
// ==========================================
function ReceivedScreen({ timer, isUrgent }: { timer: string; isUrgent: boolean }) {
  return (
    <section className="px-3 pb-4 space-y-3">
      <Panel>
        <Brand />
        <div className="mt-4"><TimerBadge display={timer} urgent={isUrgent} /></div>
        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-3 py-3 text-[12px] text-green-800 flex items-start gap-2">
          <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-green-600" />
          <span>We have received your funds. We are now validating that the bank account name matches the payer details you provided.</span>
        </div>
      </Panel>
      <Panel>
        <h3 className="text-[13px] font-bold text-[#333] mb-3">Payment Status</h3>
        <StatusTracker activeStep={4} />
      </Panel>
      <Panel>
        <div className="flex items-center gap-2 text-[12px] text-[#666]">
          <Loader2 size={13} className="animate-spin text-[#2a5f9e]" />
          <span>Validating bank account name against payer details...</span>
        </div>
      </Panel>
    </section>
  );
}

// ==========================================
// SCREEN 7A: PAYMENT APPROVED
// ==========================================
function SuccessScreen({ redirectCountdown, onReturnNow }: { redirectCountdown: number; onReturnNow: () => void }) {
  return (
    <section className="px-3 pb-4 space-y-3">
      <div className="overflow-hidden rounded-xl bg-white px-5 py-8 shadow-sm text-center border-t-4 border-green-500">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <BadgeCheck className="h-9 w-9 text-green-600" />
        </motion.div>
        <h2 className="text-[22px] font-bold text-[#333]">Payment approved</h2>
        <p className="mt-2 text-[13px] text-[#555] leading-relaxed">The bank account name matches the payer details provided.</p>
        <p className="mt-1 text-[13px] text-[#555] leading-relaxed">AirPeace is now processing your order.</p>
        <div className="mt-5 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-[12px] text-green-800">
          You will be redirected automatically in <strong>{redirectCountdown}</strong> second{redirectCountdown !== 1 ? 's' : ''}.
        </div>
        <motion.button onClick={onReturnNow} whileTap={{ scale: 0.97 }} className="mt-4 w-full rounded-lg bg-[#ff4c16] py-3 text-[16px] font-bold text-white">
          Return now
        </motion.button>
      </div>
      <Panel>
        <h3 className="text-[13px] font-bold text-[#333] mb-3">Payment Status</h3>
        <StatusTracker activeStep={6} isComplete />
      </Panel>
    </section>
  );
}

// ==========================================
// SCREEN 7B: NAME MISMATCH (Personal only)
// ==========================================
function MismatchScreen({ payerName, bankName, onCorrectDetails, onRefunding }: { payerName: string; bankName: string; onCorrectDetails: () => void; onRefunding: () => void }) {
  return (
    <section className="px-3 pb-4 space-y-3">
      <div className="overflow-hidden rounded-xl bg-white px-5 py-7 shadow-sm border-t-4 border-amber-500 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="h-8 w-8 text-amber-600" />
        </motion.div>
        <h2 className="text-[20px] font-bold text-[#333]">We could not approve this payment</h2>
        <p className="mt-2 text-[13px] text-[#666] leading-relaxed">The payer name you entered does not match the name on the bank account used for payment.</p>
        <div className="mt-5 rounded-lg bg-[#f8f8f8] border border-[#e5e5e5] px-4 py-4 text-left space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">Name you provided</p>
            <p className="mt-0.5 text-[14px] font-semibold text-[#333]">{payerName || '—'}</p>
          </div>
          <div className="border-t border-dashed border-[#ddd] pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">Name on bank account received</p>
            <p className="mt-0.5 text-[14px] font-semibold text-red-600">{bankName || '—'}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-[12px] text-amber-800 text-left flex items-start gap-2">
          <Info size={14} className="mt-0.5 flex-shrink-0 text-amber-600" />
          <span>For security and compliance reasons, your funds are being returned to the originating account. This typically takes 1–3 business days.</span>
        </div>
        <div className="mt-5 space-y-2">
          <motion.button onClick={onCorrectDetails} whileTap={{ scale: 0.97 }} className="w-full rounded-lg bg-[#ff4c16] py-3 text-[14px] font-bold text-white flex items-center justify-center gap-2">
            <FileEdit size={15} /> Correct payer details
          </motion.button>
          <motion.button onClick={onRefunding} whileTap={{ scale: 0.97 }} className="w-full rounded-lg border border-[#d5d5d5] bg-white py-3 text-[13px] font-semibold text-[#555] flex items-center justify-center gap-2">
            <RefreshCcw size={14} /> Retry with a bank account in your name
          </motion.button>
        </div>
      </div>
      <Panel>
        <h3 className="text-[13px] font-bold text-[#333] mb-3">Payment Status</h3>
        <StatusTracker activeStep={5} isMismatch />
      </Panel>
    </section>
  );
}

// ==========================================
// REFUNDING (Transitional)
// ==========================================
function RefundingScreen() {
  return (
    <section className="px-3">
      <div className="overflow-hidden rounded-xl bg-white px-5 py-10 shadow-sm text-center">
        <Brand />
        <div className="mt-6 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2a5f9e]" />
          </div>
        </div>
        <h2 className="mt-5 text-[18px] font-bold text-[#333]">Returning your funds</h2>
        <p className="mt-2 text-[13px] text-[#666]">Please wait while we process the return of your funds.</p>
      </div>
    </section>
  );
}

// ==========================================
// SCREEN 7C: FUNDS RETURNED SUCCESSFULLY
// ==========================================
function RefundedScreen({ onCorrectDetails, onRestart }: { onCorrectDetails: () => void; onRestart: () => void }) {
  return (
    <section className="px-3 pb-4">
      <div className="overflow-hidden rounded-xl bg-white px-5 py-8 shadow-sm text-center border-t-4 border-blue-500">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <CheckCircle2 className="h-8 w-8 text-blue-600" />
        </motion.div>
        <h2 className="text-[20px] font-bold text-[#333]">Your funds have been returned successfully</h2>
        <p className="mt-2 text-[13px] text-[#666] leading-relaxed">The returned funds should appear in your account within 1–3 business days, depending on your bank.</p>
        <div className="mt-5 space-y-2">
          <motion.button onClick={onCorrectDetails} whileTap={{ scale: 0.97 }} className="w-full rounded-lg bg-[#ff4c16] py-3 text-[14px] font-bold text-white flex items-center justify-center gap-2">
            <FileEdit size={15} /> Correct payer details
          </motion.button>
          <motion.button onClick={onRestart} whileTap={{ scale: 0.97 }} className="w-full rounded-lg border border-[#d5d5d5] bg-white py-3 text-[13px] font-semibold text-[#555] flex items-center justify-center gap-2">
            <RefreshCcw size={14} /> Retry with a bank account in your name
          </motion.button>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// FAILURE (Insufficient Funds)
// ==========================================
function FailureScreen({ onRetryBank, onRestartNew }: { onRetryBank: () => void; onRestartNew: () => void }) {
  return (
    <section className="px-3 pb-8">
      <div className="overflow-hidden rounded-xl bg-white px-5 py-8 text-center border-t-4 border-red-500 shadow-sm">
        <X className="mx-auto h-12 w-12 text-red-500 bg-red-50 rounded-full p-2 mb-4" />
        <h2 className="text-[20px] font-bold text-[#333]">Payment Declined</h2>
        <p className="mt-2 text-[13px] text-[#666] leading-relaxed">Transaction declined due to insufficient funds. Please try another bank account with sufficient balance.</p>
        <div className="mt-6 space-y-3">
          <button onClick={onRetryBank} className="w-full rounded-lg bg-[#333] py-3 text-[13px] text-white flex items-center justify-center gap-2">
            <RefreshCcw size={15} /> Retry with a different bank account in your name
          </button>
          <button onClick={onRestartNew} className="w-full rounded-lg border border-[#d5d5d5] py-3 text-[13px] text-[#333] flex items-center justify-center gap-2">
            <FileEdit size={15} /> Restart with new payer details
          </button>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// SCREEN 8: SESSION EXPIRED
// ==========================================
function SessionExpiredScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <section className="px-3 pb-4">
      <div className="overflow-hidden rounded-xl bg-white px-5 py-10 shadow-sm text-center border-t-4 border-slate-400">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Clock className="h-8 w-8 text-slate-500" />
        </motion.div>
        <h2 className="text-[20px] font-bold text-[#333]">This payment session has expired</h2>
        <p className="mt-2 text-[13px] text-[#666] leading-relaxed">You did not complete this transaction within the allowed time. Your booking is still saved and no funds have been taken.</p>
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-[12px] text-slate-600">
          If you have already transferred funds, please contact support and we will assist you.
        </div>
        <motion.button onClick={onRestart} whileTap={{ scale: 0.97 }} className="mt-6 w-full rounded-lg bg-[#ff4c16] py-3 text-[16px] font-bold text-white flex items-center justify-center gap-2">
          <ArrowRight size={16} /> Restart payment
        </motion.button>
      </div>
    </section>
  );
}

// ==========================================
// PENDING
// ==========================================
function PendingScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <section className="px-3">
      <div className="overflow-hidden rounded-xl bg-white px-6 py-10 text-center">
        <Clock3 className="mx-auto h-12 w-12 text-[#b38600] bg-[#fffbf0] rounded-full p-2 mb-4" />
        <h2 className="text-[20px] font-bold">Payment Pending</h2>
        <p className="mt-2 text-[13px] text-[#666]">Your payment is still being processed. We will notify you once it is complete.</p>
        <button onClick={onRestart} className="mt-6 w-full rounded-lg bg-[#f0f0f0] py-3 text-[14px] font-medium text-[#555]">Return to start</button>
      </div>
    </section>
  );
}

// ==========================================
// SHARED UTILITY COMPONENTS
// ==========================================
function RadioOption({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 text-[13px] ${active ? 'text-[#ff4c16]' : 'text-[#9f9f9f]'}`}>
      <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${active ? 'border-[#ff4c16]' : 'border-[#d8d8d8]'}`}>
        {active && <span className="h-2 w-2 rounded-full bg-[#ff4c16]" />}
      </span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}
function Panel({ children, className = '' }: any) { return <div className={`rounded-xl bg-white shadow-sm p-4 ${className}`}>{children}</div>; }
function KV({ label, value, bold = false }: any) { return <div className="flex justify-between py-1"><span className="text-[#666]">{label}</span><span className={`${bold ? 'font-bold' : 'font-semibold'} text-[#333]`}>{value}</span></div>; }
function DataRow({ label, value }: any) { return <div className="flex justify-between text-[12px] py-1 border-b border-[#eee] last:border-0"><span className="text-[#777]">{label}</span><span className="font-medium text-[#333]">{value}</span></div>; }
function AirPeaceBrandText({ size = 'md' }: any) { return <div><p className={`${size === 'sm' ? 'text-[12px]' : 'text-[16px]'} font-black italic text-[#2a5f9e]`}>AIR PEACE</p></div>; }
function Brand() { return <AirPeaceBrandText size="lg" />; }
function HeaderLogo() { return <div className="p-3"><AirPeaceBrandText size="sm" /></div>; }
function DesktopProgress() { return <div className="hidden sm:block flex-1"></div>; }
