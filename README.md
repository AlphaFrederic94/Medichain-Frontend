# AfriHealth Chain EHR Frontend

AfriHealth Chain EHR Frontend is a modern, responsive, and secure provider/patient portal built with Next.js, React Query, Zustand, Tailwind CSS, and shadcn/ui components. It integrates directly with the AfriHealth gateway to deliver a unified health experience.

---

## ✨ Features & Workflows Included

The frontend supports role-based dashboards with several key clinical and security workflows:

### 1. 🩺 Unified Doctor Clinical Flow & Patient Context
*   **Active Patient Context**: A global Zustand state (`activePatientDid`) bridges navigation across dashboards. Clinicians can click "Open" on any patient record in search or history tables to automatically set the active context and navigate to clinical entries.
*   **Inline Patient Onboarding**: If a patient is not registered in the system when starting a visit, the clinician can register the patient inline with detailed demographic data (demographics, DOB, gender, blood group, city). This creates an account on the `auth-service`, saves profile data on the `patient-service`, and proceeds with the clinical visit recording without leaving the screen.
*   **Comprehensive Encounters**: Doctors can record vital signs (weight, height, BMI auto-calculation, blood pressure, oxygen saturation), add ICD-10 diagnoses, issue prescriptions, and submit the entire encounter to the blockchain-secured ledger.

### 2. 🔒 On-Chain Consent Management (Patient Portal)
*   **Active Consent Policies**: Patients can view all authorized provider access rules currently registered on the blockchain.
*   **Grant Access Dialog**: Patients can issue time-locked, scope-specific blockchain consent tokens for providers by entering the doctor's DID, selecting resource permissions (`Records`, `Prescriptions`, `Documents`, `Vitals`), and inputting an expiration time.
*   **Instant Revocation**: Patients can instantly revoke any active consent token on-chain, immediately restricting a provider's access to their medical records.
*   **Access Audit Trail**: Patients can track who has accessed their clinical records, including the exact timestamps and access types.

### 3. 👥 Role-Based Portals
*   **Patient Dashboard**: Manage profiles, view timelines, check prescriptions, upload medical lab summaries/X-rays, and manage consents.
*   **Doctor Dashboard**: Search patients, manage assigned facility clinical history, create encounters/prescriptions, and view provider metrics.
*   **Admin Dashboard**: Monitor aggregate system metrics (encounters count, prescriptions, documents, top diagnoses, and visit type distribution).

---

## 🛠️ Local Development

### Prerequisites
*   Node.js (v20+)
*   Running backend microservices (refer to backend `README.md`)

### Setup and Running

1.  **Install dependencies**
    ```bash
    npm install
    ```

2.  **Environment Configuration**
    The frontend reads from `NEXT_PUBLIC_API_URL`. Create a `.env.local` or set it in the environment:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
    ```
    *(If not set, it defaults to the localhost gateway URL above).*

3.  **Launch the Development Server**
    ```bash
    npm run dev
    ```
    The application will be accessible at [http://localhost:3006](http://localhost:3006).

4.  **Static & Standalone Build**
    To package the production build:
    ```bash
    npm run build
    ```

---

## 📁 Key File Structures

*   `src/lib/store.ts`: Global Zustand state container managing session details, active routing, and the `activePatientDid` context.
*   `src/lib/hooks/`:
    *   `use-patient.ts`: Query hooks for patient search, registration, and provider-led profile modifications.
    *   `use-records.ts`: Query and mutation hooks for creating visits, vitals records, diagnoses, and blockchain consents.
*   `src/components/ehr/`:
    *   `doctor-dashboard.tsx`: Main dashboard and patient lookup interface.
    *   `new-visit-form.tsx`: Multi-step form containing patient verification, inline profile registration, clinical findings, and prescription submission.
    *   `consent-management.tsx`: Security settings allowing patients to grant, monitor, and revoke provider permissions on the blockchain.
