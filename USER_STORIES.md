# MITO v3 Payment & KYC Gateway — User Stories & Acceptance Criteria

> **Product:** AirPeace / Mito.Money Payment Gateway (Pay-by-Bank via Plaid)
> **Version:** 3.0
> **Date:** 2026-02-10
> **Derived from:** Working prototype (AirPeacePaymentFlow.tsx), Screens.docx, types.ts

---

## Table of Contents

1. [Glossary & Domain Definitions](#glossary)
2. [Flow Matrix (8 Combinations)](#flow-matrix)
3. [Epic 1 — Payment Method Selection](#epic-1)
4. [Epic 2 — Transaction Summary & Consent](#epic-2)
5. [Epic 3 — Payer Mode Selection (Self vs Third Party)](#epic-3)
6. [Epic 4 — Account Type Selection (Personal vs Company)](#epic-4)
7. [Epic 5 — KYC Data Collection (New User — Personal)](#epic-5)
8. [Epic 6 — KYC Data Collection (New User — Company)](#epic-6)
9. [Epic 7 — Returning User Recognition & Profile Retrieval](#epic-7)
10. [Epic 8 — Returning User Review & Confirmation](#epic-8)
11. [Epic 9 — KYC Verification & Error Handling](#epic-9)
12. [Epic 10 — Plaid Bank Handoff & Payment Processing](#epic-10)
13. [Epic 11 — Payment Success & Merchant Redirect](#epic-11)
14. [Epic 12 — Session Timer & Timeout Management](#epic-12)
15. [Epic 13 — Onboarded User Persistence (Post-KYC)](#epic-13)
16. [Epic 14 — UI/UX, Accessibility & Responsive Design](#epic-14)
17. [Epic 15 — Security, Privacy & Compliance](#epic-15)
18. [Epic 16 — API Integration & Data Contracts](#epic-16)
19. [Epic 17 — Analytics, Observability & Monitoring](#epic-17)

---

<a id="glossary"></a>
## Glossary & Domain Definitions

| Term | Definition |
|------|-----------|
| **Payer** | The person whose bank account will be debited |
| **Passenger** | The person travelling (may or may not be the Payer) |
| **Self Mode** | Payer IS the passenger — form pre-filled from booking data |
| **Third Party Mode** | Payer is NOT the passenger — form starts blank; payer must enter their own legal details |
| **Personal Account** | Payer uses their individual bank account |
| **Company Account** | Payer uses a company bank account; a verified director must be identified |
| **New User** | First-time payer with no previous KYC record in the system |
| **Registered/Returning User** | Payer whose email matches a previously verified KYC profile (within 180-day validity) |
| **Mini-KYC** | Lightweight identity check via ID3 Global — name + address matched against bank records |
| **Plaid** | Open banking provider used for bank account authentication and payment initiation |
| **OnePipe** | Upstream booking API that supplies passenger name, email, phone, ticket ref, amount, currency |
| **Mito.Money** | Payment processing intermediary between AirPeace and Plaid |
| **KYC Profile Validity** | 180 days from last successful verification |
| **MAX_KYC_ATTEMPTS** | 3 attempts per session before the transaction is blocked |
| **PAYMENT_TIMEOUT** | 10 minutes from the moment the user enters the payment flow |

---

<a id="flow-matrix"></a>
## Flow Matrix — All 8 Combinations

| # | User Type | Payer Mode | Account Type | Flow Path |
|---|-----------|-----------|-------------|-----------|
| 1 | New | Self | Personal | Method → Summary → KYC Form (pre-filled) → Verify → Plaid → Success |
| 2 | New | Self | Company | Method → Summary → KYC Form (pre-filled) + Company Lookup → Verify → Plaid → Success |
| 3 | New | Third Party | Personal | Method → Summary → KYC Form (blank) → Verify → Plaid → Success |
| 4 | New | Third Party | Company | Method → Summary → KYC Form (blank) + Company Lookup → Verify → Plaid → Success |
| 5 | Registered | Self | Personal | Method → Summary → Recognition → Review (read-only) → Verify → Plaid → Success |
| 6 | Registered | Self | Company | Method → Summary → Recognition → Review (read-only + company) → Verify → Plaid → Success |
| 7 | Registered | Third Party | Personal | Method → Summary → Recognition → Review (read-only) → Verify → Plaid → Success |
| 8 | Registered | Third Party | Company | Method → Summary → Recognition → Review (read-only + company) → Verify → Plaid → Success |

**Escape hatches:**
- Registered user can click "Use different details" → falls back to New User KYC Form (flow 1-4)
- Any verification failure → stays on current screen with error toast + red field highlights
- 3 failed attempts → transaction blocked

---

<a id="epic-1"></a>
## Epic 1 — Payment Method Selection

### US-1.1: View available payment methods
**As a** customer on the AirPeace booking site,
**I want to** see all available payment methods listed as selectable cards,
**So that** I can choose how to pay for my flight.

**Acceptance Criteria:**
- [ ] AC-1.1.1: The screen displays the AirPeace logo (top-left) and a progress stepper showing: Flight Section ✓ → Passenger ✓ → Additional Services ✓ → **Payment** (active) → Confirmation
- [ ] AC-1.1.2: The title "Please Choose a Payment Method" is displayed prominently
- [ ] AC-1.1.3: The following payment methods are displayed as bordered card rows, each with a title, optional subtitle, and a chevron-right icon:
  - Paystack
  - GlobalPay (with badge)
  - Pay with Transfer
  - Pay by Bank (instant transfer) — **visually highlighted** with orange border
  - Book On Hold And Pay Later
  - Pay Small Small
  - Flutterwave
- [ ] AC-1.1.4: Only one method can be selected at a time (radio-style selection)
- [ ] AC-1.1.5: The selected method receives a distinct border/shadow treatment
- [ ] AC-1.1.6: A "Mobile Money" section with a Terms & Conditions + Privacy Policy checkbox is shown below the method list
- [ ] AC-1.1.7: The footer displays: a BACK button, the total amount (e.g., "TOTAL £550.00"), and a "Make Payment" button

---

### US-1.2: Select "Pay by Bank" and proceed
**As a** customer,
**I want to** select "Pay by Bank (instant transfer)" and click "Make Payment",
**So that** I am routed into the Mito/Plaid payment flow.

**Acceptance Criteria:**
- [ ] AC-1.2.1: Clicking "Pay by Bank" selects it and visually highlights the card
- [ ] AC-1.2.2: The "Make Payment" button remains **disabled** (grayed out, cursor-not-allowed) until "Pay by Bank" is selected
- [ ] AC-1.2.3: Once "Pay by Bank" is selected, the "Make Payment" button becomes **enabled** (blue background, clickable)
- [ ] AC-1.2.4: Clicking "Make Payment" navigates the user to the Transaction Summary screen
- [ ] AC-1.2.5: Selecting any other payment method keeps "Make Payment" disabled (only "Pay by Bank" activates the Mito flow)
- [ ] AC-1.2.6: The BACK button returns the user to the previous booking step

---

### US-1.3: View payment method details
**As a** customer,
**I want to** see descriptive subtitles for each payment method,
**So that** I understand what each option offers.

**Acceptance Criteria:**
- [ ] AC-1.3.1: Paystack shows subtitle: "Pay with Local & International cards / Transfers / Bank / DirectDebit by Paystack"
- [ ] AC-1.3.2: GlobalPay shows subtitle and a "GlobalPay" badge in red text
- [ ] AC-1.3.3: Flutterwave shows subtitle: "I want to pay with Mobile Money/USSD/local/international debit/credit card by Flutterwave"
- [ ] AC-1.3.4: Methods without subtitles (Transfer, Bank, Hold, Small Small) display title only

---

<a id="epic-2"></a>
## Epic 2 — Transaction Summary & Consent

### US-2.1: View transaction summary before payment
**As a** customer who selected "Pay by Bank",
**I want to** see a summary of my transaction details,
**So that** I can confirm the amount, recipient, and reference before proceeding.

**Acceptance Criteria:**
- [ ] AC-2.1.1: The screen displays the AirPeace logo centered at the top
- [ ] AC-2.1.2: Text reads: "Payment securely processed via PLAID"
- [ ] AC-2.1.3: A countdown timer is displayed: "You have **MM:SS** mins to make payment" starting at 10:00
- [ ] AC-2.1.4: A summary box with gray background shows:
  - Total: £ 550.00 (bold)
  - Paying to: Air Peace via PLAID
  - Reference: BNSCD1234567788TG
- [ ] AC-2.1.5: Legal consent text is displayed: "By clicking on the button you give permission to Mito.Money to initiate a payment via PLAID and share your account details with Mito.money. You also agree to our Terms of Service and Privacy Policy"
- [ ] AC-2.1.6: Terms of Service and Privacy Policy are clickable links (underlined, blue)
- [ ] AC-2.1.7: A shield icon with "MitoMoney collects payments for AirPeace" is shown
- [ ] AC-2.1.8: The "Continue to Payment" button is full-width, orange (#FF5722), white text, prominent

---

### US-2.2: Consent and proceed to payer identification
**As a** customer,
**I want to** click "Continue to Payment" to acknowledge the terms and proceed,
**So that** I can provide my payer details.

**Acceptance Criteria:**
- [ ] AC-2.2.1: Clicking "Continue to Payment" navigates new users to the KYC Form screen
- [ ] AC-2.2.2: Clicking "Continue to Payment" navigates returning users to the Recognition screen (lookup animation → Welcome Back)
- [ ] AC-2.2.3: The 10-minute countdown timer starts (or continues if already started) upon entering this screen
- [ ] AC-2.2.4: The transaction data (amount, currency, reference, merchant) is received from the OnePipe API payload

---

### US-2.3: View countdown timer with visual urgency
**As a** customer,
**I want to** see how much time I have remaining to complete payment,
**So that** I don't lose my booking.

**Acceptance Criteria:**
- [ ] AC-2.3.1: The timer counts down in real-time (updates every second) in MM:SS format
- [ ] AC-2.3.2: When the timer is above 5:00, the time value is displayed in orange (#FF5722)
- [ ] AC-2.3.3: When the timer drops below 5:00, the time value turns red and pulses (CSS animation)
- [ ] AC-2.3.4: When the timer reaches 00:00, the session expires (see Epic 12)

---

<a id="epic-3"></a>
## Epic 3 — Payer Mode Selection (Self vs Third Party)

### US-3.1: Select "Self" payment mode
**As a** customer paying for my own flight,
**I want to** select "Self" to indicate I am both the passenger and the payer,
**So that** my booking details are auto-populated into the form.

**Acceptance Criteria:**
- [ ] AC-3.1.1: The KYC form screen header reads "Purchase information" with sub-text "Are you paying on behalf of yourself?"
- [ ] AC-3.1.2: A segmented control toggle with two options is displayed: **Self** | **Third party**
- [ ] AC-3.1.3: "Self" is the default selected state (orange background, white text)
- [ ] AC-3.1.4: When "Self" is selected, the form fields are **pre-filled** with passenger data received from the booking system:
  - Full Name: from `passengerName`
  - Email: from `passengerEmail`
  - Phone: from `passengerPhone`
  - Date of Birth: from booking record (if available)
- [ ] AC-3.1.5: A blue info alert box displays: "You must be a passenger or a member in a passenger group"
- [ ] AC-3.1.6: Pre-filled fields (Name, Email, DOB) appear as **read-only display rows** with a pencil icon to enable editing
- [ ] AC-3.1.7: Additional fields (Mobile, Address, Postcode) are editable input fields
- [ ] AC-3.1.8: Country defaults to "United Kingdom" and is displayed as read-only text

---

### US-3.2: Select "Third Party" payment mode
**As a** person paying for someone else's flight (e.g., travel agent, family member, employer),
**I want to** select "Third Party" to enter my own legal details,
**So that** the payer identity matches my bank account — not the passenger's.

**Acceptance Criteria:**
- [ ] AC-3.2.1: When the user toggles from "Self" to "Third Party", **ALL form fields are WIPED CLEAN** immediately
- [ ] AC-3.2.2: This is a **compliance-critical requirement** — no passenger data may persist in Third Party mode
- [ ] AC-3.2.3: All payer info fields (Full Name, Email, DOB) become **editable input fields** with empty placeholders
- [ ] AC-3.2.4: All address fields (Mobile, Address, Postcode) become editable input fields with empty placeholders
- [ ] AC-3.2.5: The blue info alert text changes to: "Paying for others only. Use the payer's details exactly as on bank account."
- [ ] AC-3.2.6: The "Review & Continue" button remains disabled until all required fields are filled

---

### US-3.3: Toggle between Self and Third Party
**As a** customer,
**I want to** freely switch between "Self" and "Third Party" modes,
**So that** I can correct my selection if I made a mistake.

**Acceptance Criteria:**
- [ ] AC-3.3.1: Toggling from Third Party back to Self re-populates the form with passenger data
- [ ] AC-3.3.2: Toggling from Self to Third Party clears all form data (compliance reset)
- [ ] AC-3.3.3: Toggling resets all field validation errors
- [ ] AC-3.3.4: Toggling resets the account type radio selection state (company fields cleared)
- [ ] AC-3.3.5: The toggle animation is smooth (no jarring layout shifts)

---

<a id="epic-4"></a>
## Epic 4 — Account Type Selection (Personal vs Company)

### US-4.1: Select "Personal" account type
**As a** customer paying from a personal bank account,
**I want to** select "Personal" as my account type,
**So that** I see the individual KYC fields.

**Acceptance Criteria:**
- [ ] AC-4.1.1: Below the Self/Third Party toggle, a radio-style control shows: (o) **Personal** ( ) **Company**
- [ ] AC-4.1.2: "Personal" is the default selected state (orange radio fill)
- [ ] AC-4.1.3: When "Personal" is selected, the form shows individual payer fields: Full Name, Email, DOB, Mobile, Address, Postcode, Country
- [ ] AC-4.1.4: No company-specific fields are visible

---

### US-4.2: Select "Company" account type
**As a** customer paying from a company bank account,
**I want to** select "Company" as my account type,
**So that** I can identify the company and a director for KYC purposes.

**Acceptance Criteria:**
- [ ] AC-4.2.1: When "Company" is selected, the form replaces personal detail inputs with company-specific fields
- [ ] AC-4.2.2: The blue info alert text changes to: "A director must be a passenger or part of a passenger group"
- [ ] AC-4.2.3: The yellow warning box appends: "You must be a director of this company to complete this transaction successfully."
- [ ] AC-4.2.4: Switching from Company back to Personal clears all company fields (companyRegNo, companyName, companyAddress, directorName)
- [ ] AC-4.2.5: Switching resets company lookup state (loading spinners, loaded flags)

---

### US-4.3: Dynamic info alert based on mode + account type
**As a** customer,
**I want to** see context-appropriate guidance messages,
**So that** I understand what details are required and why.

**Acceptance Criteria:**
- [ ] AC-4.3.1: Self + Personal → "You must be a passenger or a member in a passenger group"
- [ ] AC-4.3.2: Third Party + Personal → "Paying for others only. Use the payer's details exactly as on bank account."
- [ ] AC-4.3.3: Self + Company → "A director must be a passenger or part of a passenger group"
- [ ] AC-4.3.4: Third Party + Company → "A director must be a passenger or part of a passenger group"
- [ ] AC-4.3.5: The info alert animates in/out when the mode or account type changes

---

<a id="epic-5"></a>
## Epic 5 — KYC Data Collection (New User — Personal)

### US-5.1: View and complete personal payer form (Self mode)
**As a** new customer paying for myself with a personal account,
**I want to** review my pre-filled details and enter any missing information,
**So that** my identity can be verified against my bank records.

**Acceptance Criteria:**
- [ ] AC-5.1.1: A "Review payer details" section with gray background is displayed
- [ ] AC-5.1.2: "Contact info" sub-header is shown for Self mode
- [ ] AC-5.1.3: Pre-filled read-only rows display: Full name, Email, Date of birth — each with a pencil edit icon
- [ ] AC-5.1.4: Clicking the pencil icon on a pre-filled field converts it to an editable input
- [ ] AC-5.1.5: Blurring an edited field (in Self mode) converts it back to read-only display
- [ ] AC-5.1.6: "Enter additional info" sub-header is shown with editable fields:
  - Mobile No: Country code selector (+44 default) + phone number input
  - Address: Free text input with placeholder "E.g 54, Chevron Drive"
  - Post code: Free text input with placeholder "E.g. SW1A 1AA"
  - Country: Read-only, displays "United Kingdom"

---

### US-5.2: Complete personal payer form (Third Party mode)
**As a** third-party payer with a personal account,
**I want to** enter all my legal details from scratch,
**So that** my identity (not the passenger's) is verified.

**Acceptance Criteria:**
- [ ] AC-5.2.1: "Payer info" sub-header is shown (not "Contact info")
- [ ] AC-5.2.2: All fields are **editable inputs** (not read-only): Full name, Email, Date of birth
- [ ] AC-5.2.3: "Payer address" sub-header is shown (not "Enter additional info")
- [ ] AC-5.2.4: Mobile, Address, Postcode fields are all empty and editable
- [ ] AC-5.2.5: All fields have appropriate placeholder text

---

### US-5.3: See yellow bank-match warning
**As a** customer,
**I want to** be reminded that my details must match my bank account,
**So that** I avoid verification failures.

**Acceptance Criteria:**
- [ ] AC-5.3.1: A yellow (#FEF9C3) warning box is always visible below the mode/type selectors
- [ ] AC-5.3.2: The box contains a checkmark icon and text: "Ensure the information provided matches your bank account details for a successful transaction."
- [ ] AC-5.3.3: When Company is selected, additional text is appended: "You must be a director of this company to complete this transaction successfully."

---

### US-5.4: Submit personal KYC form
**As a** customer,
**I want to** click "Review & Continue" to submit my details for verification,
**So that** I can proceed to payment.

**Acceptance Criteria:**
- [ ] AC-5.4.1: The "Review & Continue" button is **disabled** (muted orange, cursor-not-allowed) until all required fields have values:
  - Required: Full Name, Email, Mobile, Address, Postcode
- [ ] AC-5.4.2: The button becomes **enabled** (bright orange #FF5722) when all required fields are non-empty
- [ ] AC-5.4.3: Clicking the enabled button triggers the verification flow (see Epic 9)
- [ ] AC-5.4.4: The button is sticky/prominent at the bottom of the screen

---

<a id="epic-6"></a>
## Epic 6 — KYC Data Collection (New User — Company)

### US-6.1: Enter company registration number
**As a** customer paying via a company account,
**I want to** enter the company registration number,
**So that** the system can look up the company details.

**Acceptance Criteria:**
- [ ] AC-6.1.1: A "Company information" section is displayed within the "Review payer details" panel
- [ ] AC-6.1.2: A "Company reg. no" input field is shown with placeholder "E.g. RC 123654"
- [ ] AC-6.1.3: When the user types 4+ characters, a debounced company lookup is triggered automatically
- [ ] AC-6.1.4: During lookup, a loading spinner with text "Looking up company..." is displayed
- [ ] AC-6.1.5: Clearing the input or typing fewer than 4 characters cancels any pending lookup
- [ ] AC-6.1.6: If the registration number is invalid or not found, an error message is displayed

---

### US-6.2: View fetched company details
**As a** customer,
**I want to** see the company details populated after the lookup completes,
**So that** I can confirm it's the correct company.

**Acceptance Criteria:**
- [ ] AC-6.2.1: After successful lookup, the following fields are auto-populated as read-only rows:
  - Company name (e.g., "Acme Limited")
  - Company address (e.g., "08 James Street, East London")
  - Country: "United Kingdom"
- [ ] AC-6.2.2: The fields animate in smoothly (fade + height transition)
- [ ] AC-6.2.3: Changing the registration number resets the lookup and clears fetched data

---

### US-6.3: Select a company director
**As a** customer paying via company account,
**I want to** select a director from a dropdown list,
**So that** the system can verify the human behind the company payment.

**Acceptance Criteria:**
- [ ] AC-6.3.1: After company lookup, a "Directors" dropdown is displayed with placeholder "Select director's name"
- [ ] AC-6.3.2: The dropdown is populated with director names from the company registry API
- [ ] AC-6.3.3: Selecting a director triggers a director verification lookup (loading spinner: "Verifying director...")
- [ ] AC-6.3.4: After verification, director details are displayed in a green-bordered success box:
  - Full name
  - Director's Address
  - Post code
  - A green checkmark with "Director verified" label
- [ ] AC-6.3.5: Changing the selected director resets the verification state
- [ ] AC-6.3.6: The "Review & Continue" button remains **disabled** until a director is selected AND verified

---

### US-6.4: Company form shows payer info (read-only)
**As a** customer in company mode,
**I want to** see the payer's personal info displayed as read-only above the company fields,
**So that** I know whose details are being used.

**Acceptance Criteria:**
- [ ] AC-6.4.1: A "Payer info" section displays: Full name, Email, Date of birth — as read-only data rows
- [ ] AC-6.4.2: In Self mode, these show the passenger data
- [ ] AC-6.4.3: In Third Party mode, these show the payer data entered earlier (or defaults if entering company first)

---

<a id="epic-7"></a>
## Epic 7 — Returning User Recognition & Profile Retrieval

### US-7.1: Detect returning user by email
**As a** returning customer,
**I want to** be automatically recognised based on my email from the booking,
**So that** I don't have to re-enter all my KYC details.

**Acceptance Criteria:**
- [ ] AC-7.1.1: After the Transaction Summary, the system checks if the passenger's email matches a stored KYC profile
- [ ] AC-7.1.2: The lookup is performed against the onboarded users store (localStorage in prototype; backend API in production)
- [ ] AC-7.1.3: During the lookup, a loading screen is shown: spinner + "Checking your details..." + "Looking up your previous verification"
- [ ] AC-7.1.4: The loading animation displays for a minimum of 2 seconds (UX polish, even if lookup is instant)
- [ ] AC-7.1.5: If no match is found, the user is routed to the standard KYC form (new user flow)

---

### US-7.2: View "Welcome Back" recognition screen
**As a** returning customer whose profile was found,
**I want to** see a "Welcome back" screen with my stored details,
**So that** I can review and confirm them quickly.

**Acceptance Criteria:**
- [ ] AC-7.2.1: A green checkmark icon with spring animation is displayed at the top
- [ ] AC-7.2.2: Heading: "Welcome back!" with sub-text "We found your previously verified details"
- [ ] AC-7.2.3: A green-bordered "KYC Verified Profile" card displays:
  - Payment type: "Self (Passenger)" or "Third Party"
  - Account type: "Personal" or "Company"
  - Full name
  - Email
  - (If Company): Company name, Company Reg, Director name
  - Address
  - Postcode
  - Bank account hint: "****1234"
- [ ] AC-7.2.4: A blue info box states: "Your identity was previously verified. You can proceed directly to payment or update your details."
- [ ] AC-7.2.5: Two action buttons:
  - Primary: "Continue with these details" (orange, full width)
  - Secondary: "Use different details" (white/outlined, full width)

---

### US-7.3: Continue with stored details
**As a** returning customer,
**I want to** click "Continue with these details" to skip the form,
**So that** I can proceed to payment faster.

**Acceptance Criteria:**
- [ ] AC-7.3.1: Clicking "Continue with these details" navigates to the Review & Confirmation screen
- [ ] AC-7.3.2: The Review screen is populated with the stored profile data
- [ ] AC-7.3.3: No form editing is required — the user goes straight to "Confirm & Pay"

---

### US-7.4: Opt out and use different details
**As a** returning customer,
**I want to** click "Use different details" to enter new payer information,
**So that** I can pay from a different account or update my details.

**Acceptance Criteria:**
- [ ] AC-7.4.1: Clicking "Use different details" navigates to the standard KYC form (new user flow)
- [ ] AC-7.4.2: The user type is switched to NEW internally
- [ ] AC-7.4.3: If payer mode is Self, the form is pre-filled with passenger data
- [ ] AC-7.4.4: If payer mode is Third Party, the form is blank
- [ ] AC-7.4.5: The previously stored profile is NOT deleted (preserved for future use)

---

### US-7.5: Handle expired KYC profile
**As a** returning customer whose KYC was verified more than 180 days ago,
**I want to** be informed that my verification has expired,
**So that** I understand why I need to re-verify.

**Acceptance Criteria:**
- [ ] AC-7.5.1: If the stored KYC profile is older than 180 days (KYC_PROFILE_VALIDITY_DAYS), the shortcut is not offered
- [ ] AC-7.5.2: The user is sent to the standard KYC form with a yellow banner: "Verification refresh required" + reason text
- [ ] AC-7.5.3: The form is pre-filled with the stored (stale) profile data to reduce re-typing
- [ ] AC-7.5.4: The user must complete full re-verification

---

<a id="epic-8"></a>
## Epic 8 — Returning User Review & Confirmation

### US-8.1: Review stored details before payment
**As a** returning customer who chose "Continue with these details",
**I want to** see a read-only review of all my stored information,
**So that** I can confirm everything is correct before paying.

**Acceptance Criteria:**
- [ ] AC-8.1.1: The screen header reads "Confirm payment details" with sub-text "Review your stored details before proceeding"
- [ ] AC-8.1.2: Badges show the payment mode ("Self" or "Third Party") and account type ("Personal" or "Company") as coloured pills
- [ ] AC-8.1.3: Contact info section displays: Full name, Email, Date of birth, Mobile — all read-only
- [ ] AC-8.1.4: Address section displays: Address, Postcode, Country — all read-only
- [ ] AC-8.1.5: (If Company) Company info section displays: Company Reg, Company name, Company address, Director — all read-only
- [ ] AC-8.1.6: A green box shows: "Verified bank account: ****1234"
- [ ] AC-8.1.7: The yellow warning box is displayed: "Ensure the information provided matches your bank account details for a successful transaction."

---

### US-8.2: Confirm and proceed to verification
**As a** returning customer,
**I want to** click "Confirm & Pay" to submit my details for re-verification,
**So that** the payment can be processed.

**Acceptance Criteria:**
- [ ] AC-8.2.1: The "Confirm & Pay" button is full-width, orange (#FF5722), always enabled (stored data is pre-validated)
- [ ] AC-8.2.2: Clicking triggers the KYC verification flow (same as new user — see Epic 9)
- [ ] AC-8.2.3: Returning users skip front-end validation (all fields are pre-populated from stored profile)

---

### US-8.3: Switch to different details from review screen
**As a** returning customer on the review screen,
**I want to** click "Use different details" to go back and enter new information,
**So that** I can update my payer details if needed.

**Acceptance Criteria:**
- [ ] AC-8.3.1: A "Use different details" button (white/outlined) is displayed below "Confirm & Pay"
- [ ] AC-8.3.2: Clicking navigates to the full KYC form (new user flow)
- [ ] AC-8.3.3: The user type is switched to NEW internally

---

<a id="epic-9"></a>
## Epic 9 — KYC Verification & Error Handling

### US-9.1: Submit details for KYC verification
**As a** customer (new or returning),
**I want to** have my details verified against bank records,
**So that** compliance requirements are met before processing payment.

**Acceptance Criteria:**
- [ ] AC-9.1.1: Clicking "Review & Continue" (new) or "Confirm & Pay" (returning) triggers a backend KYC verification call
- [ ] AC-9.1.2: A full-screen overlay is displayed with: spinner + "Verifying your details..." + "Checking against bank records"
- [ ] AC-9.1.3: The overlay blocks all user interaction during verification
- [ ] AC-9.1.4: The API call is made to ID3 Global Mini-KYC service
- [ ] AC-9.1.5: For Personal accounts: full name + address + postcode are verified against bank records
- [ ] AC-9.1.6: For Company accounts: director name + company registration + address are verified

---

### US-9.2: Handle verification success
**As a** customer whose details pass verification,
**I want to** be seamlessly redirected to the bank payment step,
**So that** I can authorize the payment.

**Acceptance Criteria:**
- [ ] AC-9.2.1: On KYC PASS, the overlay is dismissed
- [ ] AC-9.2.2: The user is navigated to the Processing/Plaid Handoff screen
- [ ] AC-9.2.3: The user's KYC profile is saved/updated for future returning-user recognition
- [ ] AC-9.2.4: The saved profile includes: email, form data, entity type, payer mode, verification timestamp, bank account hint

---

### US-9.3: Handle soft verification failure (retryable)
**As a** customer whose details did NOT pass verification,
**I want to** see what went wrong and have a chance to correct my details,
**So that** I can retry without starting over.

**Acceptance Criteria:**
- [ ] AC-9.3.1: On KYC FAIL with attempts remaining, the user stays on the **same screen** (form or review)
- [ ] AC-9.3.2: A toast notification slides in from the top: "Verification Failed. [Error message]. [N] Attempt(s) Remaining."
- [ ] AC-9.3.3: Toast has a red background, alert icon, and dismiss (X) button
- [ ] AC-9.3.4: Toast auto-dismisses after 5 seconds
- [ ] AC-9.3.5: The specific failing field is highlighted with a red border and red error message below it
- [ ] AC-9.3.6: A persistent red warning box shows: "[N] verification attempt(s) remaining"
- [ ] AC-9.3.7: Error types and their affected fields:
  - NAME_MISMATCH → fullName field (Personal) or directorName field (Company)
  - ADDRESS_MISMATCH → address / postcode field
  - MISSING_FIELDS → all empty required fields highlighted
- [ ] AC-9.3.8: The user can edit the flagged field(s) and re-submit

---

### US-9.4: Handle hard verification failure (max attempts exceeded)
**As a** customer who has failed verification 3 times,
**I want to** be clearly informed that the transaction is blocked,
**So that** I understand I cannot proceed.

**Acceptance Criteria:**
- [ ] AC-9.4.1: MAX_KYC_ATTEMPTS is set to 3
- [ ] AC-9.4.2: On the 3rd failed attempt, a toast displays: "Maximum verification attempts exceeded. Transaction blocked."
- [ ] AC-9.4.3: The form/review screen remains visible but the submit button is disabled
- [ ] AC-9.4.4: No further verification attempts are allowed in this session
- [ ] AC-9.4.5: The user may be shown a failure screen with instructions to contact support

---

### US-9.5: Validate required fields before submission (client-side)
**As a** new customer,
**I want to** see clear field-level errors if I try to submit with missing data,
**So that** I know exactly what to fix.

**Acceptance Criteria:**
- [ ] AC-9.5.1: For Personal accounts, the following fields are validated as required: Full Name, Email, DOB, Mobile, Address, Postcode
- [ ] AC-9.5.2: For Company accounts, the following are validated: Company Reg No (must be looked up), Director Name (must be selected and verified)
- [ ] AC-9.5.3: Empty required fields receive a red border and a red error message (e.g., "Full name is required")
- [ ] AC-9.5.4: A toast notification displays: "Please fill in all required fields."
- [ ] AC-9.5.5: The backend verification is NOT called until all client-side validations pass

---

<a id="epic-10"></a>
## Epic 10 — Plaid Bank Handoff & Payment Processing

### US-10.1: View Plaid redirect screen
**As a** customer whose KYC passed,
**I want to** see a "Please wait" screen while being redirected to Plaid,
**So that** I know the payment is being processed.

**Acceptance Criteria:**
- [ ] AC-10.1.1: The screen shows: AirPeace logo + "Payment securely processed via PLAID"
- [ ] AC-10.1.2: The countdown timer continues to display
- [ ] AC-10.1.3: A pulsing Plaid logo animation is displayed (scale breathing effect)
- [ ] AC-10.1.4: Heading: "Please wait..."
- [ ] AC-10.1.5: Sub-text: "We are now redirecting you to Plaid to process your payment"
- [ ] AC-10.1.6: A loading spinner is shown below the text
- [ ] AC-10.1.7: A back button is available in case the user needs to return to the form
- [ ] AC-10.1.8: After ~3 seconds, the user is redirected to the Plaid Link widget (in production) or the success screen (in prototype)

---

### US-10.2: Launch Plaid Link for bank authentication
**As a** customer,
**I want to** authenticate with my bank via Plaid's secure interface,
**So that** the payment can be initiated directly from my account.

**Acceptance Criteria:**
- [ ] AC-10.2.1: The system creates a Currency Cloud Virtual Account (backend)
- [ ] AC-10.2.2: A Plaid Link session is initialized with the payment details (amount, reference, recipient)
- [ ] AC-10.2.3: The Plaid Link widget opens in the user's browser (embedded or redirect)
- [ ] AC-10.2.4: The user selects their bank and authenticates using their bank's credentials/biometrics
- [ ] AC-10.2.5: On successful Plaid auth, the payment is initiated and the user returns to the MITO flow

---

<a id="epic-11"></a>
## Epic 11 — Payment Success & Merchant Redirect

### US-11.1: View payment success confirmation
**As a** customer who completed the bank payment,
**I want to** see a clear "Payment successful" confirmation,
**So that** I know my booking is secured.

**Acceptance Criteria:**
- [ ] AC-11.1.1: The screen shows: AirPeace logo (large) centered
- [ ] AC-11.1.2: A green checkmark icon animates in with a spring bounce effect
- [ ] AC-11.1.3: Heading: "Payment successful" (large, bold, animates in with delay)
- [ ] AC-11.1.4: The Plaid logo is displayed
- [ ] AC-11.1.5: Sub-text: "Please wait..."
- [ ] AC-11.1.6: A blue info box states: "You'll now be redirected to the merchant site to complete your transaction"
- [ ] AC-11.1.7: After a brief delay, the user is redirected to the AirPeace booking confirmation page

---

### US-11.2: Save KYC profile on successful payment
**As a** first-time customer who completed payment,
**I want to** have my verified details saved for future bookings,
**So that** I get the faster returning-user experience next time.

**Acceptance Criteria:**
- [ ] AC-11.2.1: On successful payment, the user's KYC profile is persisted (localStorage in prototype; backend API in production)
- [ ] AC-11.2.2: The saved profile includes: email, full form data, entity type (Personal/Company), payer mode (Self/Third Party), KYC verification timestamp (ISO string), bank account hint (last 4 digits)
- [ ] AC-11.2.3: The profile is keyed by email (case-insensitive matching)
- [ ] AC-11.2.4: Subsequent bookings with the same email trigger the returning-user recognition flow

---

<a id="epic-12"></a>
## Epic 12 — Session Timer & Timeout Management

### US-12.1: Payment session has a 10-minute time limit
**As a** system administrator,
**I want to** enforce a 10-minute payment window,
**So that** expired sessions don't hold booking inventory.

**Acceptance Criteria:**
- [ ] AC-12.1.1: The 10-minute timer starts when the user enters the Transaction Summary screen
- [ ] AC-12.1.2: The timer is displayed on the Summary, Details, Review, and Processing screens
- [ ] AC-12.1.3: The timer does NOT run on the Payment Method Selection screen (pre-handoff)
- [ ] AC-12.1.4: The timer counts down in real-time (1-second intervals)

---

### US-12.2: Handle session timeout
**As a** customer whose session has expired,
**I want to** be informed that my time has run out,
**So that** I can restart the payment process.

**Acceptance Criteria:**
- [ ] AC-12.2.1: When the timer reaches 00:00, all payment actions are disabled
- [ ] AC-12.2.2: A timeout modal/screen is displayed: "Your payment session has expired. Please start again."
- [ ] AC-12.2.3: The user is provided a button to restart or return to the booking
- [ ] AC-12.2.4: No partial or late payments can be submitted after timeout

---

<a id="epic-13"></a>
## Epic 13 — Onboarded User Persistence (Post-KYC)

### US-13.1: Store onboarded user profile
**As a** system,
**I want to** persist verified KYC profiles,
**So that** returning users get a streamlined experience.

**Acceptance Criteria:**
- [ ] AC-13.1.1: The OnboardedUser record contains: email, PayerFormData, EntityType, PayerMode, kycVerifiedAt (ISO timestamp), bankAccountHint
- [ ] AC-13.1.2: The profile is saved after successful KYC verification (not after payment — verification is the trigger)
- [ ] AC-13.1.3: Profile lookup is by email (case-insensitive)
- [ ] AC-13.1.4: In production, this is stored server-side; the prototype uses localStorage

---

### US-13.2: Check profile freshness
**As a** system,
**I want to** validate that a stored KYC profile is not older than 180 days,
**So that** stale profiles are re-verified per compliance requirements.

**Acceptance Criteria:**
- [ ] AC-13.2.1: The `isOnboardedUserFresh()` function compares `kycVerifiedAt` against the current date
- [ ] AC-13.2.2: If the profile age exceeds KYC_PROFILE_VALIDITY_DAYS (180), the shortcut is NOT offered
- [ ] AC-13.2.3: The stale profile data is still used to pre-fill the form (reduces re-typing)
- [ ] AC-13.2.4: A "Verification refresh required" banner is shown with a reason message

---

### US-13.3: Clear stored profile (admin/test)
**As a** tester or admin,
**I want to** clear the stored onboarded user profile,
**So that** I can test the new-user flow from scratch.

**Acceptance Criteria:**
- [ ] AC-13.3.1: A `clearOnboardedUser()` function removes the stored profile
- [ ] AC-13.3.2: After clearing, the next payment session treats the user as new
- [ ] AC-13.3.3: This function is available via a dev/admin utility (not exposed to end users)

---

<a id="epic-14"></a>
## Epic 14 — UI/UX, Accessibility & Responsive Design

### US-14.1: Mobile-first responsive layout
**As a** customer on a mobile device,
**I want to** use the payment flow comfortably on my phone,
**So that** I can complete payment without switching to desktop.

**Acceptance Criteria:**
- [ ] AC-14.1.1: The payment flow is constrained to max-width 480px on desktop, centered with dark background
- [ ] AC-14.1.2: On mobile, the flow fills the full screen width
- [ ] AC-14.1.3: All touch targets are minimum 44px height
- [ ] AC-14.1.4: Form inputs have appropriate mobile keyboard types (email → email keyboard, tel → numeric, etc.)
- [ ] AC-14.1.5: The Method Selection screen supports wider layout on desktop (max-width 886px)

---

### US-14.2: Smooth transitions and animations
**As a** customer,
**I want to** experience smooth screen transitions and micro-interactions,
**So that** the payment flow feels polished and trustworthy.

**Acceptance Criteria:**
- [ ] AC-14.2.1: Screen transitions use fade + slide animations (0.35s ease-out enter, 0.25s ease-in exit)
- [ ] AC-14.2.2: Toggle/radio selections animate state changes
- [ ] AC-14.2.3: Company lookup and director verification fields animate in/out (height + opacity)
- [ ] AC-14.2.4: Toast notifications slide in from top and fade out
- [ ] AC-14.2.5: The verification overlay fades in with a scale-up effect on the modal
- [ ] AC-14.2.6: The success checkmark uses a spring bounce animation
- [ ] AC-14.2.7: The Plaid logo on the processing screen has a gentle breathing/pulse animation

---

### US-14.3: Design system compliance
**As a** designer,
**I want to** ensure all screens follow the established design language,
**So that** the experience is consistent with AirPeace branding.

**Acceptance Criteria:**
- [ ] AC-14.3.1: Primary action color: Orange #FF5722 (buttons, active toggles, active radios)
- [ ] AC-14.3.2: Brand color: Deep Blue #2A5F9E (AirPeace logo text, progress stepper)
- [ ] AC-14.3.3: Secondary accent: Red #BE4D44 (AirPeace tagline)
- [ ] AC-14.3.4: Info alerts: Blue bg #E7F2FF, blue text #3B7DD8, blue border #9AC6F4
- [ ] AC-14.3.5: Warning box: Yellow bg #FEF9C3, yellow-brown text #7C6A2A, yellow border #E6D78D
- [ ] AC-14.3.6: Error states: Red border #EF4444, red bg #FEF2F2, red text #DC2626
- [ ] AC-14.3.7: Success states: Green border, green bg #F0FDF4, green text
- [ ] AC-14.3.8: Font: Inter (sans-serif), with consistent size scale (10px–32px)
- [ ] AC-14.3.9: AirPeace logo renders as styled text: "AIR PEACE" (bold, italic, blue) + "...your peace, our goal" (italic, red)
- [ ] AC-14.3.10: All disabled buttons use muted/light orange #EFB8A8 with cursor-not-allowed

---

### US-14.4: Accessibility requirements
**As a** customer with accessibility needs,
**I want to** navigate the payment flow using assistive technologies,
**So that** I can complete my payment independently.

**Acceptance Criteria:**
- [ ] AC-14.4.1: All form inputs have associated `<label>` elements
- [ ] AC-14.4.2: Focus states are visible (box-shadow outline)
- [ ] AC-14.4.3: Color is not the sole indicator of state (errors also use text + border, not just red)
- [ ] AC-14.4.4: Toast notifications are announced to screen readers (aria-live region)
- [ ] AC-14.4.5: Interactive elements have appropriate ARIA roles
- [ ] AC-14.4.6: The verification overlay traps focus

---

<a id="epic-15"></a>
## Epic 15 — Security, Privacy & Compliance

### US-15.1: Prevent cross-contamination of payer data
**As a** compliance officer,
**I want to** ensure that passenger data NEVER persists in Third Party mode,
**So that** the payer's legal identity is correctly captured for bank verification.

**Acceptance Criteria:**
- [ ] AC-15.1.1: Toggling from Self to Third Party performs a **hard reset** of ALL form fields (compliance-critical)
- [ ] AC-15.1.2: No passenger data (name, email, phone) remains visible or in state after switching to Third Party
- [ ] AC-15.1.3: Company fields are also cleared on mode/type switch
- [ ] AC-15.1.4: This behavior is tested with automated tests covering all toggle combinations

---

### US-15.2: Enforce attempt limits for anti-fraud
**As a** compliance officer,
**I want to** limit KYC verification attempts to 3 per session,
**So that** brute-force identity guessing is prevented.

**Acceptance Criteria:**
- [ ] AC-15.2.1: The MAX_KYC_ATTEMPTS constant is set to 3
- [ ] AC-15.2.2: Each failed verification decrements the remaining attempts counter
- [ ] AC-15.2.3: At 0 remaining attempts, the submit action is permanently disabled for the session
- [ ] AC-15.2.4: The attempt count cannot be reset by navigating back or refreshing (session-scoped)
- [ ] AC-15.2.5: Failed attempt events are logged for audit purposes

---

### US-15.3: Secure data transmission
**As a** customer,
**I want to** know my personal data is transmitted securely,
**So that** my identity is protected.

**Acceptance Criteria:**
- [ ] AC-15.3.1: All API calls use HTTPS
- [ ] AC-15.3.2: No PII is stored in URL parameters
- [ ] AC-15.3.3: Sensitive fields are not logged to the browser console in production
- [ ] AC-15.3.4: Bank account details are only shown as masked hints (e.g., "****1234")
- [ ] AC-15.3.5: The Plaid integration uses Plaid Link's native security (no raw credentials are handled by MITO)

---

### US-15.4: Legal consent before payment initiation
**As a** compliance officer,
**I want to** ensure the user consents to Mito.Money's terms before any payment is initiated,
**So that** regulatory requirements are met.

**Acceptance Criteria:**
- [ ] AC-15.4.1: The Transaction Summary screen displays full consent text before the "Continue to Payment" button
- [ ] AC-15.4.2: Terms of Service and Privacy Policy links are provided and functional
- [ ] AC-15.4.3: Clicking "Continue to Payment" constitutes implicit consent (click-through agreement)
- [ ] AC-15.4.4: The consent event (timestamp, user action) is logged for audit

---

<a id="epic-16"></a>
## Epic 16 — API Integration & Data Contracts

### US-16.1: Receive booking data from OnePipe API
**As a** system,
**I want to** receive passenger and transaction data from the OnePipe V2 API,
**So that** I can pre-fill the form and display the correct transaction details.

**Acceptance Criteria:**
- [ ] AC-16.1.1: The incoming payload includes: passengerName, passengerEmail, passengerPhone, ticketRef, amount, currency
- [ ] AC-16.1.2: Missing optional fields (name, email, phone) are handled gracefully (empty string defaults)
- [ ] AC-16.1.3: The ticketRef is displayed as the payment reference
- [ ] AC-16.1.4: The amount is displayed with the correct currency symbol (e.g., £ for GBP)

---

### US-16.2: Call ID3 Global Mini-KYC API
**As a** system,
**I want to** verify payer details against ID3 Global,
**So that** name/address matches are confirmed before payment.

**Acceptance Criteria:**
- [ ] AC-16.2.1: The API request includes: first name, last name, email, phone, DOB, address, city, postcode, country
- [ ] AC-16.2.2: For Company accounts, the request also includes: company registration number, director name
- [ ] AC-16.2.3: The API response includes: status (PASS/FAIL), errorType, message, affectedField
- [ ] AC-16.2.4: Error types include: NAME_MISMATCH, ADDRESS_MISMATCH, MISSING_FIELDS, IDENTITY_CHECK_FAILED, UNKNOWN
- [ ] AC-16.2.5: The API call has appropriate timeout handling (network errors show user-friendly message)

---

### US-16.3: Call Company Registry API
**As a** system,
**I want to** look up company details by registration number,
**So that** company name, address, and directors can be auto-populated.

**Acceptance Criteria:**
- [ ] AC-16.3.1: The API accepts a company registration number (minimum 4 characters)
- [ ] AC-16.3.2: The API returns: company name, company address, country, list of director names
- [ ] AC-16.3.3: Invalid or not-found registrations return an appropriate error
- [ ] AC-16.3.4: The lookup is debounced (triggered after user stops typing for ~1 second)

---

### US-16.4: Integrate with Plaid Link
**As a** system,
**I want to** initialize Plaid Link with payment details,
**So that** the user can authenticate with their bank and authorize the payment.

**Acceptance Criteria:**
- [ ] AC-16.4.1: A Plaid Link token is created server-side with the payment amount, currency, and recipient
- [ ] AC-16.4.2: The Plaid Link widget is launched on the client
- [ ] AC-16.4.3: On successful authorization, a public token is received and exchanged server-side
- [ ] AC-16.4.4: On Plaid error or user cancellation, the user is returned to the payment flow with appropriate messaging
- [ ] AC-16.4.5: The Plaid session respects the 10-minute payment timeout

---

<a id="epic-17"></a>
## Epic 17 — Analytics, Observability & Monitoring

### US-17.1: Track funnel conversion events
**As a** product manager,
**I want to** track user progression through each step of the payment flow,
**So that** I can measure drop-off rates and optimize conversion.

**Acceptance Criteria:**
- [ ] AC-17.1.1: Events are fired for each stage transition: method_selected, summary_viewed, kyc_form_opened, recognition_shown, review_opened, verification_started, verification_passed, verification_failed, plaid_redirected, payment_success
- [ ] AC-17.1.2: Events include metadata: user type (new/registered), payer mode (self/third_party), account type (personal/company), attempt number
- [ ] AC-17.1.3: Events include timing data (time spent on each screen)

---

### US-17.2: Log verification failures for compliance audit
**As a** compliance officer,
**I want to** have a full audit trail of all KYC verification attempts,
**So that** I can review failed transactions and detect fraud patterns.

**Acceptance Criteria:**
- [ ] AC-17.2.1: Each verification attempt (pass or fail) is logged with: timestamp, user email, attempt number, result, error type, error message, affected field
- [ ] AC-17.2.2: Blocked transactions (max attempts exceeded) are flagged for review
- [ ] AC-17.2.3: Logs are retained per regulatory requirements

---

### US-17.3: Monitor session timeouts
**As a** operations team,
**I want to** track how many sessions expire before payment,
**So that** I can assess whether the 10-minute window is adequate.

**Acceptance Criteria:**
- [ ] AC-17.3.1: A timeout event is fired when the session timer reaches 00:00
- [ ] AC-17.3.2: The event includes: stage at timeout, time elapsed, user type, how far the user progressed

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Epics | 17 |
| User Stories | 41 |
| Acceptance Criteria | 155+ |
| Flow Combinations | 8 |
| Screens | 7 (Method, Summary, Recognition, KYC Form, Review, Processing, Success) |

---

*Document generated from prototype analysis. All stories derive from implemented behavior in the working prototype and supporting type definitions.*
