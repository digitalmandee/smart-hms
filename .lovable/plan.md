
# Automated E2E Testing Implementation Plan

I will write comprehensive automated Playwright End-to-End (E2E) tests to verify the core module workflows we just documented. This will ensure that all essential patient journeys and operational flows work as expected in real-time whenever you run the test suite.

Since Playwright is already installed and initialized in your project, I'll build out the test files to follow the clinical and operational processes.

## 1. Test Suite Structure
I will create a structured `tests/e2e/` directory containing test specifications for the primary hospital modules:

### Clinical & Diagnostic Flows
*   **`opd-flow.spec.ts`**: Tests the Outpatient journey (Patient Search/Registration → Reception Check-in → Vitals Recording → Doctor Consultation).
*   **`ipd-flow.spec.ts`**: Tests Inpatient management (Admission → Bed Allocation → Nursing Rounds → Discharge).
*   **`lab-flow.spec.ts`**: Tests the Laboratory process (Sample Collection → Results Entry → Pathologist Validation).
*   **`radiology-flow.spec.ts`**: Tests imaging workflows (Order Reception → Scan Execution Logging → Report Generation).

### Operational & Support Flows
*   **`pharmacy-flow.spec.ts`**: Tests the Pharmacy process (Prescription Verification → Stock Check → Dispensing → POS Billing).
*   **`warehouse-flow.spec.ts`**: Tests supply chain management (Purchase Orders → GRN Receiving → Put-away).
*   **`finance-flow.spec.ts`**: Tests revenue cycles (Consolidated Invoice Generation → Payment Collection).

## 2. Test Configuration
*   I will verify your `playwright.config.ts` to ensure it automatically starts your Vite dev server before running tests.
*   I will add a `test:e2e` script to your `package.json` so you can easily trigger real-time tests from the terminal.
*   The tests will utilize the existing `playwright-fixture.ts` if custom setups (like mocking auth or standard state) are needed to make tests run reliably without polluting a production database.

## 3. Implementation Process
Given the large number of modules (11 in total), I will implement these E2E tests in **batches**, starting with the highest-priority clinical flows (OPD, Pharmacy, and Lab). 
