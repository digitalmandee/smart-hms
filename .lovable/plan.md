

# Insurance & KSA Compliance Audit — Findings & Gaps

## Current Integration Status

### ✅ FULLY IMPLEMENTED — NPHIES Integration (KSA)

| Feature | Status | Implementation |
|---------|--------|----------------|
| **Real-Time Eligibility Verification** | ✅ Complete | `EligibilityCheckButton` → `nphies-gateway` edge function → FHIR CoverageEligibilityRequest |
| **Pre-Authorization** | ✅ Complete | `submit_preauth` action with FHIR ClaimRequest (use: preauthorization) |
| **Claim Submission** | ✅ Complete | Full FHIR Claim bundle with ICD-10 diagnosis codes, service items, patient/provider info |
| **Batch Claim Submission** | ✅ Complete | `BatchSubmitDialog` for multi-select NPHIES submission |
| **Claim Status Polling** | ✅ Complete | `check_claim_status` action with FHIR poll-request |
| **Denial Management** | ✅ Complete | `DenialManagementPanel` parses FHIR ClaimResponse errors with AI-suggested corrections |
| **ICD-10/CPT Medical Coding** | ✅ Complete | `MedicalCodeSearch` with searchable `medical_codes` database table |
| **Claim Scrubbing Engine** | ✅ Complete | `src/lib/claimScrubber.ts` validates ICD-10 format, duplicates, missing fields, totals |
| **NPHIES Transaction Logs** | ✅ Complete | Full audit trail in `nphies_transaction_logs` table |
| **NPHIES Configuration** | ✅ Complete | `NphiesConfigPanel` with environment (sandbox/prod), facility ID, CCHI license, OAuth credentials |
| **Payment Reconciliation (ERA)** | ✅ Complete | `PaymentReconciliationPage` matches remittance to claims and posts to GL |
| **Saudi ID Validation** | ✅ Complete | `src/lib/validations/saudiId.ts` validates 10-digit National ID (starts with 1) and Iqama (starts with 2) |
| **Saudi Payers Seeding** | ✅ Complete | `PopulateSaudiPayersButton` seeds 10 major CCHI payers (Bupa, Tawuniya, etc.) |
| **Claim Attachments** | ✅ Complete | `ClaimAttachments` component for CommunicationRequest document uploads |
| **NPHIES Analytics Dashboard** | ✅ Complete | `NphiesAnalyticsPage` with submission trends, payer breakdown, approval rates |

### ✅ FULLY IMPLEMENTED — ZATCA E-Invoicing (KSA)

| Feature | Status | Implementation |
|---------|--------|----------------|
| **Phase 1 QR Code Generation** | ✅ Complete | `zatca-einvoice` edge function generates TLV-encoded QR with seller, VAT number, timestamp, total, VAT amount |
| **ZATCA UUID & ICV** | ✅ Complete | Unique invoice UUID and Invoice Counter Value stored on invoice |
| **VAT Registration Support** | ✅ Complete | Organization `tax_registration_number` field used for ZATCA compliance |
| **E-Invoicing Enable Flag** | ✅ Complete | `e_invoicing_enabled` and `country_code` fields on organization |

### ✅ FULLY IMPLEMENTED — Manual Insurance (Pakistan)

| Feature | Status |
|---------|--------|
| Insurance Company Management | ✅ Complete |
| Insurance Plan Management | ✅ Complete |
| Patient Insurance Linking | ✅ Complete |
| Panel Pricing & Billing Split | ✅ Complete |
| Manual Claim Tracking | ✅ Complete |

---

## 🔍 GAPS & MISSING KSA REQUIREMENTS

### 1. ZATCA Phase 2 Integration (NOT YET IMPLEMENTED)
**Current Status**: Phase 1 QR code only  
**Missing**:
- XML UBL 2.1 invoice generation (ZATCA-mandated format)
- Cryptographic signing with X.509 certificate
- Real-time clearance submission to ZATCA portal
- Clearance/reporting API integration
- Cryptographic Stamp Identifier (CSID) handling
- Invoice hash chaining (previous invoice hash reference)

**Priority**: HIGH — Phase 2 is mandatory for KSA hospitals

### 2. Wasfaty Integration (E-Prescription) — NOT IMPLEMENTED
**What it is**: Saudi MOH's electronic prescription system  
**Current Status**: Not integrated  
**Missing**:
- Wasfaty API connection
- E-prescription submission to Wasfaty
- Prescription status tracking
- Medication dispensing verification

**Priority**: MEDIUM — Required for pharmacy operations in KSA

### 3. SFDA Drug Database Integration — NOT IMPLEMENTED
**What it is**: Saudi Food & Drug Authority approved medication database  
**Current Status**: Not integrated  
**Missing**:
- SFDA drug code lookup
- Drug registration verification
- Controlled substance tracking
- Drug interaction alerts using SFDA data

**Priority**: MEDIUM — Required for full KSA pharmacy compliance

### 4. Seha Platform Integration — NOT IMPLEMENTED
**What it is**: Saudi MOH's Health Electronic Surveillance Network  
**Current Status**: Not integrated  
**Missing**:
- Communicable disease reporting
- Public health surveillance submissions
- Birth/death certificate electronic filing

**Priority**: LOW — Required for government reporting

### 5. NPHIES Enhancements Needed

| Gap | Description |
|-----|-------------|
| **CommunicationRequest for Attachments** | Current implementation exists but needs verification of actual NPHIES submission format |
| **ERA Auto-Posting** | Reconciliation exists but auto-journal-entry posting could be enhanced |
| **Coverage Discovery** | Patient coverage discovery request (find all active coverages for a patient) |
| **Prescription Pre-Auth** | Pharmacy-specific pre-authorization flows |

### 6. Other KSA HMS Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Arabic RTL Support | ✅ Complete | Full trilingual (EN/AR/UR) |
| Hijri Calendar | ⚠️ Partial | Dates display Gregorian; Hijri conversion needed |
| Saudi National Address | ⚠️ Missing | No address format validation for Saudi addresses |
| CCHI Provider Licensing | ⚠️ Missing | No CCHI license verification workflow |

---

## Summary

### What's Working Well
The NPHIES integration is **production-ready** for:
- Eligibility verification
- Pre-authorization
- Claim submission/resubmission
- Denial management with AI corrections
- Payment reconciliation
- Full audit trail

The ZATCA Phase 1 e-invoicing is complete.

### Critical Gaps for Full KSA Compliance
1. **ZATCA Phase 2** — XML signing and clearance API (HIGH priority)
2. **Wasfaty e-Prescription** — MOH integration (MEDIUM priority)
3. **SFDA Drug Database** — Pharmacy compliance (MEDIUM priority)
4. **Hijri Calendar** — Date display/input (LOW priority)

Would you like me to implement any of these missing KSA compliance features?

