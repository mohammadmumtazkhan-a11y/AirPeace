"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

/* ─── colour tokens ─── */
const C = {
  navy: "#003366",
  red: "#C8102E",
  orange: "#F26522",
  blue: "#0066CC",
  lightBlue: "#E8F4FC",
  bg: "#F8F9FB",
  card: "#FFFFFF",
  border: "#E5E7EB",
  muted: "#6B7280",
  text: "#1F2937",
  success: "#16A34A",
  warnBg: "#FFF7ED",
  warnBorder: "#FDBA74",
  infoBg: "#EFF6FF",
  infoBorder: "#93C5FD",
  redBg: "#FEF2F2",
  redBorder: "#FCA5A5",
};

/* ─── icons (inline SVGs) ─── */
const ChevronRight = () => (
  <svg width="20" height="20" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
);
const Clock = () => (
  <svg width="18" height="18" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const InfoIcon = ({ color = C.blue }: { color?: string }) => (
  <svg width="16" height="16" fill={color} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
);
const CheckCircle = ({ color = C.orange }: { color?: string }) => (
  <svg width="20" height="20" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const EditPen = () => (
  <svg width="14" height="14" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
);
const QRIcon = () => (
  <svg width="20" height="20" fill={C.orange} viewBox="0 0 24 24"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h-2v4h2v2h-4v-2h-2v4h2v2h4v-2h2v-4h-2v-4zm0 6h-2v-2h2v2zm4 0h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>
);
const Spinner = ({ size = 24, color = C.orange }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
    <circle cx="12" cy="12" r="10" fill="none" stroke="#E5E7EB" strokeWidth="3"/>
    <path d="M12 2a10 10 0 0 1 8.66 5" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"/>
  </svg>
);
const BackArrow = () => (
  <svg width="20" height="20" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

/* ─── AirPeace Logo (stylised text) ─── */
const AirPeaceLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const s = size === "lg" ? { f1: 28, f2: 10 } : size === "sm" ? { f1: 16, f2: 7 } : { f1: 22, f2: 8 };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: s.f1, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: C.navy, letterSpacing: -1, fontStyle: "italic" }}>
          ✈ AIR PEACE
        </span>
      </div>
      <span style={{ fontSize: s.f2, color: C.red, fontStyle: "italic" }}>...your peace, our goal</span>
    </div>
  );
};

/* ─── PLAID Logo ─── */
const PlaidLogo = ({ size = 40 }: { size?: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#1A1A2E", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "white", fontSize: size * 0.4, fontWeight: 700 }}>⊞</span>
    </div>
    <div style={{ width: size * 0.6, height: size * 0.7, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: size * 0.5, fontWeight: 800, color: C.red }}>⟨/⟩</span>
    </div>
  </div>
);

/* ─── Stepper (Screen 1) ─── */
const stepLabels = ["Flight Section", "Passenger", "Additional Services", "Payment", "Confirmation"];
const Stepper = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, padding: "16px 0", background: "white", borderBottom: `1px solid ${C.border}` }}>
    {stepLabels.map((s, i) => (
      <div key={s} style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: i < 3 ? C.navy : i === 3 ? "white" : "white",
            border: i < 3 ? "none" : `2px solid ${i === 3 ? C.navy : C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600, color: i < 3 ? "white" : i === 3 ? C.navy : C.muted,
          }}>
            {i < 3 ? "✓" : i + 1}
          </div>
          <span style={{ fontSize: 10, color: i <= 3 ? C.navy : C.muted, fontWeight: i === 3 ? 600 : 400, whiteSpace: "nowrap" }}>{s}</span>
        </div>
        {i < stepLabels.length - 1 && (
          <div style={{ width: 40, height: 2, background: i < 3 ? C.navy : C.border, margin: "0 4px", marginBottom: 18 }} />
        )}
      </div>
    ))}
  </div>
);

/* ─── Payment Method Card ─── */
const PaymentOption = ({ title, desc, icon, selected, onClick }: {
  title: string; desc?: string; icon?: string; selected: boolean; onClick: () => void;
}) => (
  <button onClick={onClick} style={{
    width: "100%", padding: "16px 20px", background: "white",
    border: `1.5px solid ${selected ? C.blue : C.border}`,
    borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between",
    cursor: "pointer", textAlign: "left", transition: "all 0.15s",
    boxShadow: selected ? `0 0 0 1px ${C.blue}` : "none",
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{title}</div>
      {desc && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{desc}</div>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {icon && <span style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>{icon}</span>}
      <ChevronRight />
    </div>
  </button>
);

/* ─── Toggle Button (Self / Third party) ─── */
const Toggle = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
  <div style={{ display: "flex", border: `1.5px solid ${C.orange}`, borderRadius: 28, overflow: "hidden", width: "100%" }}>
    {options.map((o) => (
      <button key={o} onClick={() => onChange(o)} style={{
        flex: 1, padding: "10px 0", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
        background: value === o ? C.orange : "white",
        color: value === o ? "white" : C.text,
        transition: "all 0.2s",
      }}>{o}</button>
    ))}
  </div>
);

/* ─── Radio selector ─── */
const Radio = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
  <div style={{ display: "flex", gap: 20 }}>
    {options.map((o) => (
      <div key={o} onClick={() => onChange(o)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, color: C.text, userSelect: "none" }}>
        <div style={{
          width: 18, height: 18, borderRadius: "50%",
          border: `2px solid ${value === o ? C.orange : C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "border-color 0.15s",
        }}>
          {value === o && <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.orange }} />}
        </div>
        {o}
      </div>
    ))}
  </div>
);

/* ─── Info Banner ─── */
const InfoBanner = ({ children, variant = "blue" }: { children: ReactNode; variant?: "blue" | "orange" | "red" | "green" }) => {
  const styles = {
    blue: { bg: C.infoBg, border: C.infoBorder, icon: C.blue },
    orange: { bg: C.warnBg, border: C.warnBorder, icon: C.orange },
    red: { bg: C.redBg, border: C.redBorder, icon: C.red },
    green: { bg: "#F0FDF4", border: "#86EFAC", icon: C.success },
  };
  const st = styles[variant];
  return (
    <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderRadius: 8, background: st.bg, border: `1px solid ${st.border}`, fontSize: 13, lineHeight: 1.5, color: C.text }}>
      <div style={{ marginTop: 2, flexShrink: 0 }}>
        {variant === "green" ? <CheckCircle color={st.icon} /> : <InfoIcon color={st.icon} />}
      </div>
      <div>{children}</div>
    </div>
  );
};

/* ─── Input field ─── */
const Input = ({ label, value, onChange, placeholder, prefix, disabled }: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string; prefix?: string; disabled?: boolean;
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
    <label style={{ fontSize: 13, color: C.muted, minWidth: 90, flexShrink: 0 }}>{label}</label>
    <div style={{ flex: 1, display: "flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden", background: disabled ? "#F9FAFB" : "white" }}>
      {prefix && (
        <div style={{ padding: "8px 10px", background: "#F3F4F6", borderRight: `1px solid ${C.border}`, fontSize: 13, color: C.text }}>{prefix}</div>
      )}
      <input
        value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{ flex: 1, padding: "8px 10px", border: "none", outline: "none", fontSize: 13, color: C.text, background: "transparent" }}
      />
    </div>
  </div>
);

/* ─── Detail Row ─── */
const DetailRow = ({ label, value, editable }: { label: string; value: string; editable?: boolean }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
    <span style={{ fontSize: 13, color: C.muted }}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{value}</span>
      {editable && <button style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}><EditPen /></button>}
    </div>
  </div>
);

/* ═══════════════════════════════════════
   SCREEN 1 — Payment Method Selection
   ═══════════════════════════════════════ */
const Screen1 = ({ onNext }: { onNext: () => void }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const methods = [
    { id: "paystack", title: "Paystack", desc: "Pay with Local & International cards / Transfers / Bank / DirectDebit by Paystack" },
    { id: "globalpay", title: "GlobalPay", desc: "Convenient payment via Bank Transfer, Local / International Debit / Credit Cards, and USSD", icon: "GlobalPay" },
    { id: "transfer", title: "Pay with Transfer" },
    { id: "bank", title: "Pay by Bank (instant transfer)" },
    { id: "hold", title: "I want to Book On Hold And Pay Later" },
    { id: "small", title: "I want to Pay Small Small" },
    { id: "flutter", title: "I want to pay with Mobile Money/USSD/local/international debit/credit card by Flutterwave", desc: "I want to pay with Mobile Money/USSD/local/international debit/credit card by Flutterwave" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6" }}>
      <div style={{ background: "white", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <AirPeaceLogo size="sm" />
      </div>
      <Stepper />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 24 }}>Please Choose a Payment Method</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {methods.map((m) => (
            <PaymentOption key={m.id} {...m} selected={selected === m.id} onClick={() => { setSelected(m.id); if (m.id === "bank") setTimeout(() => onNext(), 400); }} />
          ))}
        </div>

        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} style={{ accentColor: C.navy }} />
          <span style={{ fontSize: 13, color: C.muted }}>
            Please read and accept <a href="#" style={{ color: C.blue, textDecoration: "underline" }}>Terms and Conditions</a> AND <a href="#" style={{ color: C.blue, textDecoration: "underline" }}>Privacy Policy</a>
          </span>
        </div>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button style={{ padding: "10px 28px", border: `1.5px solid ${C.navy}`, borderRadius: 4, background: "white", color: C.navy, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>BACK</button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 14, color: C.text }}>TOTAL <strong>259600 NGN</strong></span>
            <button onClick={() => selected === "bank" && onNext()} style={{
              padding: "10px 28px", border: "none", borderRadius: 4, background: C.navy, color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: selected ? 1 : 0.5,
            }}>Make Payment</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   SCREEN 2 — Payment Summary
   ═══════════════════════════════════════ */
const Screen2 = ({ onNext }: { onNext: () => void }) => {
  const [time, setTime] = useState(600);
  useEffect(() => {
    const t = setInterval(() => setTime((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(time / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 380, background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "28px 24px 20px", textAlign: "center" }}>
          <AirPeaceLogo size="lg" />
          <p style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>Payment securely processed via PLAID</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, padding: "8px 16px", background: "#FAFAFA", borderRadius: 8 }}>
            <Clock />
            <span style={{ fontSize: 14, color: C.text }}>You have <strong style={{ color: C.orange }}>{mm}:{ss}</strong> mins make payment</span>
          </div>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
              <span style={{ color: C.muted, fontSize: 14 }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>£ 550.00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
              <span style={{ color: C.muted, fontSize: 14 }}>Paying to</span>
              <span style={{ fontWeight: 500, fontSize: 14, color: C.text }}>Air Peace via PLAID</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
              <span style={{ color: C.muted, fontSize: 14 }}>Reference</span>
              <span style={{ fontWeight: 500, fontSize: 13, color: C.text, fontFamily: "monospace" }}>BNSCD1234567788TG</span>
            </div>
          </div>

          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginTop: 16, textAlign: "center" }}>
            By clicking on the button you give permission to Mito.Money to initiate a payment via PLAID and share your account details with Mito.money. You also agree to our <a href="#" style={{ color: C.blue }}>Terms of Service</a> and <a href="#" style={{ color: C.blue }}>Privacy Policy</a>
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 12, fontSize: 12, color: C.muted }}>
            <InfoIcon color={C.muted} />
            Mito.Money collects payments for AirPeace
          </div>
        </div>

        <div style={{ padding: "0 24px 28px" }}>
          <button onClick={onNext} style={{
            width: "100%", padding: "14px 0", border: "none", borderRadius: 28,
            background: `linear-gradient(135deg, ${C.orange}, #E85D10)`,
            color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "0 4px 14px rgba(242,101,34,0.35)", transition: "transform 0.15s",
          }}>
            <QRIcon /> Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   SCREEN 3 — Purchase Information
   ═══════════════════════════════════════ */
const Screen3 = ({ onNext }: { onNext: () => void }) => {
  const [payerType, setPayerType] = useState("Self");
  const [accountType, setAccountType] = useState("Personal");
  const [userMode, setUserMode] = useState("New user");
  const isReturnee = userMode !== "New user";
  const hasEmailBanner = userMode === "Returnee (registered email)";

  // Personal fields
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [postCode, setPostCode] = useState("");

  // Company fields
  const [companyReg, setCompanyReg] = useState("");
  const [companyStage, setCompanyStage] = useState(0);
  const [companyData, setCompanyData] = useState<{ name: string; address: string; country: string } | null>(null);
  const [directorData, setDirectorData] = useState<{ directors: string; fullName: string; address?: string; postCode?: string } | null>(null);
  const [selectedDirector, setSelectedDirector] = useState("");
  const stageTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Simulate progressive company lookup with debounce
  useEffect(() => {
    stageTimers.current.forEach(clearTimeout);
    stageTimers.current = [];

    setCompanyData(null);
    setDirectorData(null);
    setCompanyStage(0);
    setSelectedDirector("");

    if (companyReg.length >= 6) {
      const debounce = setTimeout(() => {
        setCompanyStage(1);

        const t1 = setTimeout(() => {
          setCompanyData({
            name: "Acme limited",
            address: "08 James str, east London",
            country: "United Kingdom",
          });
          setCompanyStage(2);
        }, 1800);

        stageTimers.current.push(t1);
      }, 500);

      stageTimers.current = [debounce];
    }

    return () => {
      stageTimers.current.forEach(clearTimeout);
    };
  }, [companyReg]);

  const handleDirectorSelect = (val: string) => {
    setSelectedDirector(val);
    if (val) {
      setCompanyStage(3);

      const t1 = setTimeout(() => {
        setDirectorData({ directors: "John Doe", fullName: "John Doe" });
        setCompanyStage(4);
      }, 1800);

      const t2 = setTimeout(() => {
        setDirectorData({
          directors: "John Doe", fullName: "John Doe",
          address: "54 chevron drive, Westminster", postCode: "131245",
        });
        setCompanyStage(5);
      }, 3500);

      stageTimers.current.push(t1, t2);
    }
  };

  const returneeData = {
    name: "John Doe", email: "johndoe@email.com", mobile: "+2348012345678",
    country: "United Kingdom", address: "54 Chevron drive, Westminster",
    postCode: "1324", dob: "12/08/1990",
  };

  const infoBannerText = () => {
    if (accountType === "Company") return "A director must be a passenger or part of a passenger group";
    if (payerType === "Self") return "You must be a passenger or a member in a passenger group";
    return "Paying for others only. Use the payer's details exactly as on bank account.";
  };

  const warnText = () => {
    if (accountType === "Company") return "Ensure the information provided matches your bank account details for a successful transaction. You must be a director of this company to complete this transaction successfully.";
    return "Ensure the information provided matches your bank account details for a successful transaction";
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 380, background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
          <AirPeaceLogo size="sm" />
        </div>

        <div style={{ padding: "20px" }}>
          {/* Demo toggle for user mode */}
          <div style={{ marginBottom: 16, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {["New user", "Returnee", "Returnee (registered email)"].map((mode) => (
              <button key={mode} onClick={() => setUserMode(mode)} style={{
                fontSize: 11, color: userMode === mode ? "white" : C.muted, background: userMode === mode ? C.orange : "#F3F4F6",
                padding: "4px 10px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 500,
              }}>
                {mode}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Purchase information</h2>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 16 }}>Are you paying on behalf of yourself?</p>

          <Toggle options={["Self", "Third party"]} value={payerType} onChange={setPayerType} />

          <div style={{ marginTop: 12 }}>
            <InfoBanner variant="blue">{infoBannerText()}</InfoBanner>
          </div>

          <p style={{ fontSize: 13, color: C.muted, margin: "16px 0 8px" }}>Select payment account type</p>
          <Radio options={["Personal", "Company"]} value={accountType} onChange={setAccountType} />

          {hasEmailBanner && accountType === "Personal" && (
            <div style={{ marginTop: 12 }}>
              <InfoBanner variant="red">
                This email is registered to an individual account type with the email: john*****1.com. To switch to a company account type you&apos;ll need to register with a new email.
              </InfoBanner>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <InfoBanner variant="orange">{warnText()}</InfoBanner>
          </div>

          {isReturnee && accountType === "Personal" ? (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>Review payer details</h3>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Contact info</p>
              <DetailRow label="Full name" value={returneeData.name} editable />
              <DetailRow label="Email" value={returneeData.email} editable />
              <DetailRow label="Mobile no" value={returneeData.mobile} editable />
              <DetailRow label="Country" value={returneeData.country} />
              <DetailRow label="Address" value={returneeData.address} editable />
              <DetailRow label="Post code" value={returneeData.postCode} editable />
              <DetailRow label="Date of birth" value={returneeData.dob} />
            </div>
          ) : (
            <>
              <div style={{ marginTop: 20, padding: "16px", border: `1px solid ${C.border}`, borderRadius: 10, background: "#FAFAFA" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12 }}>Review payer details</h3>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8 }}>Payer info</p>
                <DetailRow label="Full name" value="John Doe" editable={accountType === "Company"} />
                <DetailRow label="Email" value="johndoe@email.com" />
                <DetailRow label="Date of birth" value="12/08/1990" />
              </div>

              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Enter additional info</p>

                {accountType === "Personal" ? (
                  <>
                    <Input label="Mobile no" value={mobile} onChange={setMobile} placeholder="1245 6789" prefix="+44" />
                    <Input label="Address" value={address} onChange={setAddress} placeholder="E.g 54, chevron drive" />
                    <Input label="Post code" value={postCode} onChange={setPostCode} placeholder="E.g 1234" />
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                      <span style={{ fontSize: 13, color: C.muted }}>Country</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>United Kingdom</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Input label="Company reg. no" value={companyReg} onChange={setCompanyReg} placeholder="E.g. RC 123654" />

                    {companyStage === 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                        <span style={{ fontSize: 13, color: C.muted }}>Country</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>United Kingdom</span>
                      </div>
                    )}

                    {companyStage === 1 && (
                      <>
                        <div style={{ display: "flex", justifyContent: "center", padding: 16 }}><Spinner /></div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                          <span style={{ fontSize: 13, color: C.muted }}>Country</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>United Kingdom</span>
                        </div>
                      </>
                    )}

                    {companyStage >= 2 && companyData && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 13, color: C.muted }}>Company name</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{companyData.name}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 13, color: C.muted }}>Company address</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{companyData.address}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 13, color: C.muted }}>Country</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{companyData.country}</span>
                        </div>
                      </>
                    )}

                    {companyStage === 2 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
                        <span style={{ fontSize: 13, color: C.muted, minWidth: 90, flexShrink: 0 }}>Directors</span>
                        <select
                          value={selectedDirector}
                          onChange={(e) => handleDirectorSelect(e.target.value)}
                          style={{
                            flex: 1, padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 6,
                            fontSize: 13, color: selectedDirector ? C.text : C.muted, background: "white",
                            cursor: "pointer", outline: "none",
                          }}
                        >
                          <option value="">Select director&apos;s name</option>
                          <option value="John Doe">John Doe</option>
                          <option value="Jane Smith">Jane Smith</option>
                        </select>
                      </div>
                    )}

                    {companyStage === 3 && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 13, color: C.muted }}>Directors</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedDirector}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", padding: 12 }}><Spinner size={20} /></div>
                      </>
                    )}

                    {companyStage === 4 && directorData && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 13, color: C.muted }}>Directors</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{directorData.directors}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 13, color: C.muted }}>Full name</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{directorData.fullName}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", padding: 12 }}><Spinner size={20} /></div>
                      </>
                    )}

                    {companyStage === 5 && directorData && (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 13, color: C.muted, minWidth: 90, flexShrink: 0 }}>Directors</span>
                          <select
                            value={selectedDirector}
                            onChange={(e) => handleDirectorSelect(e.target.value)}
                            style={{
                              flex: 1, padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 6,
                              fontSize: 13, color: C.text, background: "white", cursor: "pointer", outline: "none",
                            }}
                          >
                            <option value="John Doe">John Doe</option>
                            <option value="Jane Smith">Jane Smith</option>
                          </select>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 13, color: C.muted }}>Full name</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{directorData.fullName}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 13, color: C.muted }}>Director&apos;s Address</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{directorData.address}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                          <span style={{ fontSize: 13, color: C.muted }}>Post code</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{directorData.postCode}</span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div style={{ padding: "0 20px 24px" }}>
          <button onClick={onNext} style={{
            width: "100%", padding: "14px 0", border: "none", borderRadius: 28,
            background: `linear-gradient(135deg, ${C.orange}, #E85D10)`,
            color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(242,101,34,0.35)",
          }}>
            Review &amp; Continue
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: C.muted, marginTop: 10 }}>
            <InfoIcon color={C.muted} /> Powered by mito.money
          </p>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   SCREEN 4 — Redirecting to PLAID
   ═══════════════════════════════════════ */
const Screen4 = ({ onNext }: { onNext: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onNext, 4000);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 380, background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "32px 24px", textAlign: "center" }}>
        <button style={{ alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}><BackArrow /></button>
        <AirPeaceLogo size="lg" />
        <p style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>Payment securely processed via PLAID</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, fontSize: 14, color: C.text }}>
          <Clock />
          You have <strong style={{ color: C.orange }}>10:00</strong> mins make payment
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
          <PlaidLogo size={48} />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginTop: 16 }}>Please wait...</h2>
        <p style={{ fontSize: 14, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>
          We are now redirecting you to Plaid to process your payment
        </p>

        <div style={{ marginTop: 24 }}><Spinner size={32} /></div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   SCREEN 5 — Payment Successful
   ═══════════════════════════════════════ */
const Screen5 = ({ onRestart }: { onRestart: () => void }) => (
  <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div style={{ width: "100%", maxWidth: 380, background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "32px 24px", textAlign: "center" }}>
      <AirPeaceLogo size="lg" />

      <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginTop: 20 }}>Payment successful</h2>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <PlaidLogo size={48} />
      </div>
      <p style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Please wait...</p>

      <div style={{ marginTop: 24 }}>
        <InfoBanner variant="blue">
          You&apos;ll now be redirected to merchant site to complete your transaction
        </InfoBanner>
      </div>

      <button onClick={onRestart} style={{
        marginTop: 24, padding: "10px 24px", border: `1.5px solid ${C.orange}`, borderRadius: 20,
        background: "white", color: C.orange, fontWeight: 600, fontSize: 13, cursor: "pointer",
      }}>
        ↻ Restart Demo
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════
   ROOT APP
   ═══════════════════════════════════════ */
export default function AirPeacePaymentFlow() {
  const [step, setStep] = useState(0);

  return (
    <>
      {step === 0 && <Screen1 onNext={() => setStep(1)} />}
      {step === 1 && <Screen2 onNext={() => setStep(2)} />}
      {step === 2 && <Screen3 onNext={() => setStep(3)} />}
      {step === 3 && <Screen4 onNext={() => setStep(4)} />}
      {step === 4 && <Screen5 onRestart={() => setStep(0)} />}
    </>
  );
}
