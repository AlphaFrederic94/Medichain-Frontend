export interface Patient {
  id: string;
  did: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  phone: string;
  email: string;
  avatar: string;
  lastVisit: string;
  totalVisits: number;
  activePrescriptions: number;
  pendingLabs: number;
  activeConsents: number;
}

export interface Doctor {
  id: string;
  did: string;
  name: string;
  specialty: string;
  facility: string;
  facilityId: string;
  avatar: string;
  patientsToday: number;
  activePrescriptions: number;
  pendingLabs: number;
  consentsGranted: number;
}

export interface Encounter {
  id: string;
  patientId: string;
  patientName: string;
  patientDid: string;
  doctorId: string;
  doctorName: string;
  facility: string;
  city: string;
  date: string;
  type: 'outpatient' | 'inpatient' | 'emergency' | 'telehealth';
  chiefComplaint: string;
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  vitals: Vitals;
  notes: string;
  txHash: string;
  verified: boolean;
}

export interface Diagnosis {
  code: string;
  description: string;
  status: 'active' | 'chronic' | 'resolved';
}

export interface Prescription {
  id: string;
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  active: boolean;
}

export interface Vitals {
  bpSystolic: number;
  bpDiastolic: number;
  temperature: number;
  pulse: number;
  weight: number;
  height: number;
  o2Sat: number;
  bloodGlucose?: number;
}

export interface Consent {
  id: string;
  patientId: string;
  providerName: string;
  providerSpecialty: string;
  facility: string;
  accessTypes: string[];
  grantedDate: string;
  expiresDate: string;
  status: 'active' | 'expired' | 'revoked';
  purpose: string;
}

export interface QueueEntry {
  id: string;
  patientName: string;
  patientDid: string;
  time: string;
  visitType: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
}

export interface Facility {
  id: string;
  name: string;
  city: string;
  country: string;
  type: string;
  patientsRegistered: number;
}

export const patients: Patient[] = [
  {
    id: 'P001',
    did: 'did:afrihealth:CMR-7A3F2B',
    name: 'Amara Diallo',
    age: 34,
    gender: 'Female',
    bloodGroup: 'O+',
    allergies: ['Sulfa drugs', 'Penicillin'],
    chronicConditions: ['Hypertension'],
    phone: '+237 6XX XXX XXX',
    email: 'amara.diallo@mail.cm',
    avatar: 'AD',
    lastVisit: '2025-03-10',
    totalVisits: 12,
    activePrescriptions: 3,
    pendingLabs: 1,
    activeConsents: 2,
  },
  {
    id: 'P002',
    did: 'did:afrihealth:GHA-9C1E4D',
    name: 'Kofi Mensah',
    age: 45,
    gender: 'Male',
    bloodGroup: 'A-',
    allergies: ['Aspirin'],
    chronicConditions: ['Diabetes Type 2', 'Hyperlipidemia'],
    phone: '+233 2XX XXX XXX',
    email: 'kofi.mensah@mail.gh',
    avatar: 'KM',
    lastVisit: '2025-03-08',
    totalVisits: 24,
    activePrescriptions: 5,
    pendingLabs: 2,
    activeConsents: 3,
  },
  {
    id: 'P003',
    did: 'did:afrihealth:NGA-5B8K2M',
    name: 'Fatima Al-Hassan',
    age: 28,
    gender: 'Female',
    bloodGroup: 'B+',
    allergies: [],
    chronicConditions: ['Asthma'],
    phone: '+234 8XX XXX XXX',
    email: 'fatima.alhassan@mail.ng',
    avatar: 'FA',
    lastVisit: '2025-02-28',
    totalVisits: 8,
    activePrescriptions: 2,
    pendingLabs: 0,
    activeConsents: 1,
  },
  {
    id: 'P004',
    did: 'did:afrihealth:SEN-3D6P9R',
    name: 'Mamadou Ndiaye',
    age: 62,
    gender: 'Male',
    bloodGroup: 'AB+',
    allergies: ['Ibuprofen', 'Codeine'],
    chronicConditions: ['Hypertension', 'Chronic Kidney Disease'],
    phone: '+221 7XX XXX XXX',
    email: 'mamadou.ndiaye@mail.sn',
    avatar: 'MN',
    lastVisit: '2025-03-12',
    totalVisits: 31,
    activePrescriptions: 7,
    pendingLabs: 3,
    activeConsents: 4,
  },
  {
    id: 'P005',
    did: 'did:afrihealth:CMR-2E7Q1S',
    name: 'Jean-Pierre Mvondo',
    age: 19,
    gender: 'Male',
    bloodGroup: 'O-',
    allergies: [],
    chronicConditions: [],
    phone: '+237 6XX XXX XXX',
    email: 'jp.mvondo@mail.cm',
    avatar: 'JM',
    lastVisit: '2025-03-01',
    totalVisits: 3,
    activePrescriptions: 1,
    pendingLabs: 1,
    activeConsents: 1,
  },
  {
    id: 'P006',
    did: 'did:afrihealth:KEN-4F9T8U',
    name: 'Ngozi Okafor',
    age: 37,
    gender: 'Female',
    bloodGroup: 'A+',
    allergies: ['Latex'],
    chronicConditions: ['Sickle Cell Trait'],
    phone: '+254 7XX XXX XXX',
    email: 'ngozi.okafor@mail.ke',
    avatar: 'NO',
    lastVisit: '2025-03-05',
    totalVisits: 15,
    activePrescriptions: 2,
    pendingLabs: 1,
    activeConsents: 2,
  },
  {
    id: 'P007',
    did: 'did:afrihealth:CIV-6G2V5W',
    name: 'Aïssata Koné',
    age: 52,
    gender: 'Female',
    bloodGroup: 'B-',
    allergies: ['Contrast dye'],
    chronicConditions: ['Diabetes Type 2', 'Hypertension'],
    phone: '+225 0XX XXX XXX',
    email: 'aissata.kone@mail.ci',
    avatar: 'AK',
    lastVisit: '2025-03-11',
    totalVisits: 19,
    activePrescriptions: 4,
    pendingLabs: 2,
    activeConsents: 3,
  },
  {
    id: 'P008',
    did: 'did:afrihealth:ETH-8H1X3Y',
    name: 'Tigist Bekele',
    age: 25,
    gender: 'Female',
    bloodGroup: 'O+',
    allergies: [],
    chronicConditions: [],
    phone: '+251 9XX XXX XXX',
    email: 'tigist.bekele@mail.et',
    avatar: 'TB',
    lastVisit: '2025-02-20',
    totalVisits: 2,
    activePrescriptions: 0,
    pendingLabs: 0,
    activeConsents: 0,
  },
];

export const doctors: Doctor[] = [
  {
    id: 'D001',
    did: 'did:afrihealth:DR-CMR-4E7R',
    name: 'Dr. Esi Boateng',
    specialty: 'Cardiology',
    facility: 'Yaoundé Central Hospital',
    facilityId: 'F001',
    avatar: 'EB',
    patientsToday: 8,
    activePrescriptions: 23,
    pendingLabs: 5,
    consentsGranted: 45,
  },
  {
    id: 'D002',
    did: 'did:afrihealth:DR-SEN-2K9M',
    name: 'Dr. Mamadou Bah',
    specialty: 'General Practice',
    facility: 'Hôpital Principal Dakar',
    facilityId: 'F002',
    avatar: 'MB',
    patientsToday: 12,
    activePrescriptions: 34,
    pendingLabs: 8,
    consentsGranted: 62,
  },
  {
    id: 'D003',
    did: 'did:afrihealth:DR-NGA-7P3N',
    name: 'Dr. Aisha Kamara',
    specialty: 'Pediatrics',
    facility: 'Lagos University Teaching Hospital',
    facilityId: 'F003',
    avatar: 'AK',
    patientsToday: 6,
    activePrescriptions: 18,
    pendingLabs: 3,
    consentsGranted: 38,
  },
  {
    id: 'D004',
    did: 'did:afrihealth:DR-GHA-1Q5L',
    name: 'Dr. Kwame Asante',
    specialty: 'Internal Medicine',
    facility: 'Korle Bu Teaching Hospital',
    facilityId: 'F004',
    avatar: 'KA',
    patientsToday: 9,
    activePrescriptions: 29,
    pendingLabs: 6,
    consentsGranted: 51,
  },
];

export const encounters: Encounter[] = [
  {
    id: 'E001',
    patientId: 'P001',
    patientName: 'Amara Diallo',
    patientDid: 'did:afrihealth:CMR-7A3F2B',
    doctorId: 'D001',
    doctorName: 'Dr. Esi Boateng',
    facility: 'Yaoundé Central Hospital',
    city: 'Yaoundé',
    date: '2025-03-10T09:30:00',
    type: 'outpatient',
    chiefComplaint: 'Persistent headache and dizziness for 2 weeks',
    diagnoses: [
      { code: 'I10', description: 'Essential Hypertension', status: 'chronic' },
      { code: 'R51', description: 'Headache', status: 'active' },
    ],
    prescriptions: [
      { id: 'RX001', drug: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning with water', active: true },
      { id: 'RX002', drug: 'Paracetamol 500mg', dosage: '500mg', frequency: 'As needed', duration: '5 days', instructions: 'Take for headache, max 3x daily', active: true },
    ],
    vitals: { bpSystolic: 155, bpDiastolic: 98, temperature: 37.1, pulse: 82, weight: 68, height: 165, o2Sat: 98, bloodGlucose: 95 },
    notes: 'Patient reports persistent headaches worse in the morning. BP elevated at 155/98. Adjusted antihypertensive medication. Recommended lifestyle modifications including reduced salt intake.',
    txHash: '0x7a3f2b8c4d1e9f6a5b7c3d2e8f1a4b6c9d0e2f3a5b7c8d1e4f6a9b0c2d5e7f',
    verified: true,
  },
  {
    id: 'E002',
    patientId: 'P002',
    patientName: 'Kofi Mensah',
    patientDid: 'did:afrihealth:GHA-9C1E4D',
    doctorId: 'D004',
    doctorName: 'Dr. Kwame Asante',
    facility: 'Korle Bu Teaching Hospital',
    city: 'Accra',
    date: '2025-03-08T14:15:00',
    type: 'outpatient',
    chiefComplaint: 'Follow-up for diabetes management, fasting glucose elevated',
    diagnoses: [
      { code: 'E11', description: 'Type 2 Diabetes Mellitus', status: 'chronic' },
      { code: 'E78.5', description: 'Hyperlipidemia', status: 'chronic' },
    ],
    prescriptions: [
      { id: 'RX003', drug: 'Metformin 850mg', dosage: '850mg', frequency: 'Twice daily', duration: '90 days', instructions: 'Take with meals', active: true },
      { id: 'RX004', drug: 'Atorvastatin 20mg', dosage: '20mg', frequency: 'Once daily at bedtime', duration: '90 days', instructions: 'Take with water before sleep', active: true },
    ],
    vitals: { bpSystolic: 138, bpDiastolic: 85, temperature: 36.8, pulse: 76, weight: 82, height: 175, o2Sat: 97, bloodGlucose: 142 },
    notes: 'Fasting glucose trending down from 168 to 142. HbA1c at 7.2%. Continue current metformin dose. Lipid panel improved with atorvastatin. Reinforce dietary counseling.',
    txHash: '0x9c1e4d2f7a8b3c5d6e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    verified: true,
  },
  {
    id: 'E003',
    patientId: 'P003',
    patientName: 'Fatima Al-Hassan',
    patientDid: 'did:afrihealth:NGA-5B8K2M',
    doctorId: 'D003',
    doctorName: 'Dr. Aisha Kamara',
    facility: 'Lagos University Teaching Hospital',
    city: 'Lagos',
    date: '2025-02-28T11:00:00',
    type: 'outpatient',
    chiefComplaint: 'Recurrent wheezing and shortness of breath',
    diagnoses: [
      { code: 'J45', description: 'Asthma', status: 'chronic' },
    ],
    prescriptions: [
      { id: 'RX005', drug: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'As needed', duration: '90 days', instructions: '2 puffs when wheezy, max 4x daily', active: true },
      { id: 'RX006', drug: 'Budesonide Inhaler 200mcg', dosage: '200mcg', frequency: 'Twice daily', duration: '90 days', instructions: 'Use preventatively morning and evening', active: true },
    ],
    vitals: { bpSystolic: 118, bpDiastolic: 74, temperature: 36.9, pulse: 88, weight: 58, height: 162, o2Sat: 96, bloodGlucose: 88 },
    notes: 'Asthma well controlled on current regimen. No exacerbations in past 3 months. Continue budesonide preventer. Reviewed inhaler technique. PEF improved to 350 L/min.',
    txHash: '0x5b8k2m3n4p7q8r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    verified: true,
  },
  {
    id: 'E004',
    patientId: 'P004',
    patientName: 'Mamadou Ndiaye',
    patientDid: 'did:afrihealth:SEN-3D6P9R',
    doctorId: 'D002',
    doctorName: 'Dr. Mamadou Bah',
    facility: 'Hôpital Principal Dakar',
    city: 'Dakar',
    date: '2025-03-12T08:45:00',
    type: 'inpatient',
    chiefComplaint: 'Acute renal failure symptoms, decreased urine output',
    diagnoses: [
      { code: 'N18', description: 'Chronic Kidney Disease', status: 'chronic' },
      { code: 'I10', description: 'Essential Hypertension', status: 'chronic' },
      { code: 'N17', description: 'Acute Kidney Injury', status: 'active' },
    ],
    prescriptions: [
      { id: 'RX007', drug: 'Furosemide 40mg', dosage: '40mg', frequency: 'Once daily', duration: '7 days', instructions: 'Take in the morning, monitor urine output', active: true },
      { id: 'RX008', drug: 'Amlodipine 10mg', dosage: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning', active: true },
      { id: 'RX009', drug: 'ORS Sachets', dosage: '1 sachet', frequency: 'After each loose stool', duration: '5 days', instructions: 'Dissolve in 1L clean water', active: true },
    ],
    vitals: { bpSystolic: 168, bpDiastolic: 102, temperature: 37.4, pulse: 92, weight: 74, height: 170, o2Sat: 95, bloodGlucose: 110 },
    notes: 'Admitted for AKI on CKD background. Creatinine elevated at 4.2 mg/dL. IV fluids adjusted. Nephrology consult requested. BP difficult to control — increased amlodipine dose.',
    txHash: '0x3d6p9r2s5t8u1v4w7x0y3z6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b',
    verified: true,
  },
  {
    id: 'E005',
    patientId: 'P005',
    patientName: 'Jean-Pierre Mvondo',
    patientDid: 'did:afrihealth:CMR-2E7Q1S',
    doctorId: 'D001',
    doctorName: 'Dr. Esi Boateng',
    facility: 'Yaoundé Central Hospital',
    city: 'Yaoundé',
    date: '2025-03-01T16:20:00',
    type: 'outpatient',
    chiefComplaint: 'Fever, chills, and body aches for 3 days',
    diagnoses: [
      { code: 'B54', description: 'Unspecified Malaria', status: 'active' },
    ],
    prescriptions: [
      { id: 'RX010', drug: 'Artemether-Lumefantrine', dosage: '20/120mg', frequency: 'Twice daily for 3 days', duration: '3 days', instructions: 'Take with fatty meal for better absorption', active: false },
      { id: 'RX011', drug: 'Paracetamol 500mg', dosage: '500mg', frequency: 'Every 6 hours', duration: '3 days', instructions: 'For fever, take with water', active: false },
    ],
    vitals: { bpSystolic: 122, bpDiastolic: 78, temperature: 38.6, pulse: 96, weight: 71, height: 178, o2Sat: 99, bloodGlucose: 92 },
    notes: 'Positive rapid diagnostic test for malaria. Prescribed ACT (artemether-lumefantrine). Fever at 38.6°C. Follow-up in 3 days if symptoms persist.',
    txHash: '0x2e7q1s4t7u0v3w6x9y2z5a8b1c4d7e0f3a6b9c2d5e8f1a4b7c0d3e6f9a2b5c8d',
    verified: true,
  },
  {
    id: 'E006',
    patientId: 'P006',
    patientName: 'Ngozi Okafor',
    patientDid: 'did:afrihealth:KEN-4F9T8U',
    doctorId: 'D003',
    doctorName: 'Dr. Aisha Kamara',
    facility: 'Lagos University Teaching Hospital',
    city: 'Lagos',
    date: '2025-03-05T10:00:00',
    type: 'telehealth',
    chiefComplaint: 'Routine sickle cell follow-up, mild pain episode',
    diagnoses: [
      { code: 'D57.3', description: 'Sickle Cell Trait', status: 'chronic' },
      { code: 'G43', description: 'Migraine', status: 'active' },
    ],
    prescriptions: [
      { id: 'RX012', drug: 'Hydroxyurea 500mg', dosage: '500mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take with plenty of water', active: true },
    ],
    vitals: { bpSystolic: 120, bpDiastolic: 76, temperature: 36.7, pulse: 72, weight: 63, height: 168, o2Sat: 98, bloodGlucose: 85 },
    notes: 'Telehealth consultation. Mild vaso-occlusive crisis resolved with hydration. Continue hydroxyurea. Folate supplementation maintained. Discussed pain management plan.',
    txHash: '0x4f9t8u1v4w7x0y3z6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a',
    verified: true,
  },
  {
    id: 'E007',
    patientId: 'P007',
    patientName: 'Aïssata Koné',
    patientDid: 'did:afrihealth:CIV-6G2V5W',
    doctorId: 'D002',
    doctorName: 'Dr. Mamadou Bah',
    facility: 'Hôpital Principal Dakar',
    city: 'Dakar',
    date: '2025-03-11T13:30:00',
    type: 'outpatient',
    chiefComplaint: 'Uncontrolled blood sugar and frequent urination',
    diagnoses: [
      { code: 'E11', description: 'Type 2 Diabetes Mellitus', status: 'chronic' },
      { code: 'I10', description: 'Essential Hypertension', status: 'chronic' },
    ],
    prescriptions: [
      { id: 'RX013', drug: 'Metformin 1000mg', dosage: '1000mg', frequency: 'Twice daily', duration: '90 days', instructions: 'Take with morning and evening meals', active: true },
      { id: 'RX014', drug: 'Lisinopril 10mg', dosage: '10mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take in the morning', active: true },
      { id: 'RX015', drug: 'Glimepiride 2mg', dosage: '2mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take with breakfast', active: true },
    ],
    vitals: { bpSystolic: 148, bpDiastolic: 92, temperature: 36.9, pulse: 80, weight: 78, height: 160, o2Sat: 97, bloodGlucose: 198 },
    notes: 'Blood sugar elevated at 198 mg/dL fasting. Added glimepiride to metformin. BP still above target — continue lisinopril. Referred for diabetic retinopathy screening.',
    txHash: '0x6g2v5w8x1y4z7a0b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8f1a4b7c0d3e6f9a2b5c',
    verified: true,
  },
  {
    id: 'E008',
    patientId: 'P001',
    patientName: 'Amara Diallo',
    patientDid: 'did:afrihealth:CMR-7A3F2B',
    doctorId: 'D002',
    doctorName: 'Dr. Mamadou Bah',
    facility: 'Hôpital Principal Dakar',
    city: 'Dakar',
    date: '2025-01-22T09:00:00',
    type: 'outpatient',
    chiefComplaint: 'Annual checkup and hypertension review',
    diagnoses: [
      { code: 'I10', description: 'Essential Hypertension', status: 'chronic' },
    ],
    prescriptions: [
      { id: 'RX016', drug: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily', duration: '90 days', instructions: 'Continue current dose', active: true },
    ],
    vitals: { bpSystolic: 142, bpDiastolic: 90, temperature: 36.8, pulse: 78, weight: 67, height: 165, o2Sat: 99, bloodGlucose: 90 },
    notes: 'Annual review. BP better controlled on amlodipine 5mg. All lab results within normal limits except mild proteinuria — monitor at next visit.',
    txHash: '0x7a3f2b1c4d7e0f3a6b9c2d5e8f1a4b7c0d3e6f9a2b5c8d1e4f7a0b3c6d9e2f5a8b',
    verified: true,
  },
  {
    id: 'E009',
    patientId: 'P008',
    patientName: 'Tigist Bekele',
    patientDid: 'did:afrihealth:ETH-8H1X3Y',
    doctorId: 'D001',
    doctorName: 'Dr. Esi Boateng',
    facility: 'Yaoundé Central Hospital',
    city: 'Yaoundé',
    date: '2025-02-20T15:45:00',
    type: 'emergency',
    chiefComplaint: 'Acute abdominal pain and vomiting',
    diagnoses: [
      { code: 'K35', description: 'Acute Appendicitis', status: 'active' },
    ],
    prescriptions: [
      { id: 'RX017', drug: 'Amoxicillin 500mg', dosage: '500mg', frequency: 'Three times daily', duration: '7 days', instructions: 'Complete the full course', active: false },
      { id: 'RX018', drug: 'Metronidazole 400mg', dosage: '400mg', frequency: 'Three times daily', duration: '7 days', instructions: 'Take with food', active: false },
    ],
    vitals: { bpSystolic: 128, bpDiastolic: 82, temperature: 38.2, pulse: 104, weight: 55, height: 163, o2Sat: 97, bloodGlucose: 105 },
    notes: 'Presented with acute RIF pain, rebound tenderness. US confirmed appendicitis. Started IV antibiotics. Surgical consult — appendectomy scheduled for tomorrow AM.',
    txHash: '0x8h1x3y6z9a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8f1a4b7c0d',
    verified: true,
  },
  {
    id: 'E010',
    patientId: 'P002',
    patientName: 'Kofi Mensah',
    patientDid: 'did:afrihealth:GHA-9C1E4D',
    doctorId: 'D004',
    doctorName: 'Dr. Kwame Asante',
    facility: 'Korle Bu Teaching Hospital',
    city: 'Accra',
    date: '2025-02-15T10:30:00',
    type: 'outpatient',
    chiefComplaint: 'Chest pain on exertion, radiating to left arm',
    diagnoses: [
      { code: 'I20', description: 'Angina Pectoris', status: 'active' },
      { code: 'E11', description: 'Type 2 Diabetes Mellitus', status: 'chronic' },
    ],
    prescriptions: [
      { id: 'RX019', drug: 'Nitroglycerin 0.4mg SL', dosage: '0.4mg', frequency: 'As needed for chest pain', duration: '30 days', instructions: 'Place under tongue, sit down before taking', active: true },
      { id: 'RX020', drug: 'Aspirin 75mg', dosage: '75mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take with food', active: true },
    ],
    vitals: { bpSystolic: 152, bpDiastolic: 94, temperature: 37.0, pulse: 86, weight: 84, height: 175, o2Sat: 97, bloodGlucose: 155 },
    notes: 'Exertional chest pain consistent with stable angina. ECG showed ST depression in V4-V6. Started on nitroglycerin and low-dose aspirin. Referred for stress test and cardiology evaluation.',
    txHash: '0x9c1e4d5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e',
    verified: true,
  },
];

export const consents: Consent[] = [
  {
    id: 'C001',
    patientId: 'P001',
    providerName: 'Dr. Esi Boateng',
    providerSpecialty: 'Cardiology',
    facility: 'Yaoundé Central Hospital',
    accessTypes: ['Records', 'Prescriptions', 'Lab Results'],
    grantedDate: '2025-03-10T09:00:00',
    expiresDate: '2025-03-10T21:00:00',
    status: 'active',
    purpose: 'Ongoing hypertension management',
  },
  {
    id: 'C002',
    patientId: 'P001',
    providerName: 'Dr. Mamadou Bah',
    providerSpecialty: 'General Practice',
    facility: 'Hôpital Principal Dakar',
    accessTypes: ['Records', 'Prescriptions'],
    grantedDate: '2025-01-22T08:30:00',
    expiresDate: '2025-01-22T16:30:00',
    status: 'expired',
    purpose: 'Annual checkup',
  },
  {
    id: 'C003',
    patientId: 'P002',
    providerName: 'Dr. Kwame Asante',
    providerSpecialty: 'Internal Medicine',
    facility: 'Korle Bu Teaching Hospital',
    accessTypes: ['Records', 'Prescriptions', 'Lab Results'],
    grantedDate: '2025-03-08T13:45:00',
    expiresDate: '2025-03-08T21:45:00',
    status: 'expired',
    purpose: 'Diabetes follow-up',
  },
  {
    id: 'C004',
    patientId: 'P004',
    providerName: 'Dr. Mamadou Bah',
    providerSpecialty: 'General Practice',
    facility: 'Hôpital Principal Dakar',
    accessTypes: ['Records', 'Prescriptions', 'Lab Results'],
    grantedDate: '2025-03-12T08:00:00',
    expiresDate: '2025-03-13T08:00:00',
    status: 'active',
    purpose: 'Inpatient admission — AKI management',
  },
  {
    id: 'C005',
    patientId: 'P006',
    providerName: 'Dr. Aisha Kamara',
    providerSpecialty: 'Pediatrics',
    facility: 'Lagos University Teaching Hospital',
    accessTypes: ['Records', 'Prescriptions'],
    grantedDate: '2025-03-05T09:30:00',
    expiresDate: '2025-03-05T17:30:00',
    status: 'active',
    purpose: 'Telehealth sickle cell follow-up',
  },
];

export const todayQueue: QueueEntry[] = [
  { id: 'Q001', patientName: 'Amara D.', patientDid: 'did:afrihealth:CMR-7A3F2B', time: '09:00', visitType: 'Follow-up', status: 'completed' },
  { id: 'Q002', patientName: 'Ibrahim T.', patientDid: 'did:afrihealth:CMR-4K8M1N', time: '09:30', visitType: 'New Visit', status: 'completed' },
  { id: 'Q003', patientName: 'Chidinma O.', patientDid: 'did:afrihealth:NGA-7P2R5S', time: '10:00', visitType: 'Follow-up', status: 'in-progress' },
  { id: 'Q004', patientName: 'Youssef M.', patientDid: 'did:afrihealth:SEN-9T3V6W', time: '10:30', visitType: 'Urgent', status: 'waiting' },
  { id: 'Q005', patientName: 'Grace A.', patientDid: 'did:afrihealth:GHA-2X5Y8Z', time: '11:00', visitType: 'New Visit', status: 'waiting' },
  { id: 'Q006', patientName: 'Oumar S.', patientDid: 'did:afrihealth:SEN-1A4B7C', time: '11:30', visitType: 'Follow-up', status: 'waiting' },
  { id: 'Q007', patientName: 'Amina K.', patientDid: 'did:afrihealth:CIV-3D6E9F', time: '14:00', visitType: 'Telehealth', status: 'waiting' },
];

export const facilities: Facility[] = [
  { id: 'F001', name: 'Yaoundé Central Hospital', city: 'Yaoundé', country: 'Cameroon', type: 'Public Hospital', patientsRegistered: 12450 },
  { id: 'F002', name: 'Hôpital Principal Dakar', city: 'Dakar', country: 'Senegal', type: 'Public Hospital', patientsRegistered: 8920 },
  { id: 'F003', name: 'Lagos University Teaching Hospital', city: 'Lagos', country: 'Nigeria', type: 'Teaching Hospital', patientsRegistered: 24680 },
  { id: 'F004', name: 'Korle Bu Teaching Hospital', city: 'Accra', country: 'Ghana', type: 'Teaching Hospital', patientsRegistered: 18340 },
  { id: 'F005', name: 'Centre Hospitalier Universitaire', city: 'Abidjan', country: "Côte d'Ivoire", type: 'University Hospital', patientsRegistered: 9870 },
];

export const drugDatabase = [
  'Artemether-Lumefantrine', 'Amlodipine', 'Metformin', 'Amoxicillin',
  'ORS Sachets', 'Paracetamol', 'Furosemide', 'Lisinopril', 'Atorvastatin',
  'Salbutamol Inhaler', 'Budesonide Inhaler', 'Hydroxyurea', 'Glimepiride',
  'Nitroglycerin', 'Aspirin', 'Metronidazole', 'Ciprofloxacin',
  'Omeprazole', 'Diclofenac', 'Cotrimoxazole',
];

export const icd10Codes = [
  { code: 'I10', description: 'Essential (Primary) Hypertension' },
  { code: 'E11', description: 'Type 2 Diabetes Mellitus' },
  { code: 'J45', description: 'Asthma' },
  { code: 'B54', description: 'Unspecified Malaria' },
  { code: 'N18', description: 'Chronic Kidney Disease' },
  { code: 'E78.5', description: 'Hyperlipidemia, Unspecified' },
  { code: 'K35', description: 'Acute Appendicitis' },
  { code: 'I20', description: 'Angina Pectoris' },
  { code: 'J11', description: 'Influenza, Unspecified' },
  { code: 'A01', description: 'Typhoid Fever' },
  { code: 'D50', description: 'Iron Deficiency Anemia' },
  { code: 'D57', description: 'Sickle Cell Disorders' },
  { code: 'N17', description: 'Acute Kidney Injury' },
  { code: 'R51', description: 'Headache' },
  { code: 'G43', description: 'Migraine' },
  { code: 'K29', description: 'Gastritis' },
  { code: 'J18', description: 'Pneumonia, Unspecified' },
  { code: 'A00', description: 'Cholera' },
  { code: 'B50', description: 'Plasmodium Falciparum Malaria' },
  { code: 'L23', description: 'Allergic Contact Dermatitis' },
];

export const vitalsHistory = [
  { month: 'Oct 2024', bpSystolic: 148, bpDiastolic: 95, weight: 70, temperature: 36.8, pulse: 80 },
  { month: 'Nov 2024', bpSystolic: 145, bpDiastolic: 93, weight: 69, temperature: 36.9, pulse: 79 },
  { month: 'Dec 2024', bpSystolic: 142, bpDiastolic: 90, weight: 68, temperature: 37.0, pulse: 78 },
  { month: 'Jan 2025', bpSystolic: 150, bpDiastolic: 96, weight: 68, temperature: 36.8, pulse: 81 },
  { month: 'Feb 2025', bpSystolic: 148, bpDiastolic: 94, weight: 67, temperature: 36.9, pulse: 80 },
  { month: 'Mar 2025', bpSystolic: 155, bpDiastolic: 98, weight: 68, temperature: 37.1, pulse: 82 },
];

export const adminStats = {
  totalPatients: 74260,
  activeFacilities: 247,
  recordsAnchoredToday: 1342,
  insuranceClaimsThisMonth: 4521,
  registrationsOverTime: [
    { month: 'Sep 2024', count: 8200 },
    { month: 'Oct 2024', count: 9100 },
    { month: 'Nov 2024', count: 10500 },
    { month: 'Dec 2024', count: 12800 },
    { month: 'Jan 2025', count: 15600 },
    { month: 'Feb 2025', count: 18200 },
    { month: 'Mar 2025', count: 21400 },
  ],
  topDiagnoses: [
    { name: 'Malaria', count: 4820 },
    { name: 'Hypertension', count: 3650 },
    { name: 'Diabetes Type 2', count: 2940 },
    { name: 'Typhoid', count: 2100 },
    { name: 'Anemia', count: 1870 },
    { name: 'Asthma', count: 1540 },
    { name: 'Pneumonia', count: 1290 },
    { name: 'Gastritis', count: 980 },
    { name: 'Cholera', count: 720 },
    { name: 'Appendicitis', count: 540 },
  ],
  facilityTypes: [
    { name: 'Public Hospital', value: 45 },
    { name: 'Teaching Hospital', value: 20 },
    { name: 'Private Clinic', value: 18 },
    { name: 'University Hospital', value: 12 },
    { name: 'Health Center', value: 5 },
  ],
  recentActivity: [
    { id: '1', type: 'facility_registered', description: 'New facility registered: St. Mary\'s Clinic, Nairobi', time: '2 min ago' },
    { id: '2', type: 'record_anchored', description: '12 records anchored to AfriHealth Chain from Yaoundé CH', time: '5 min ago' },
    { id: '3', type: 'claim_verified', description: 'Insurance claim #INS-4521 verified via blockchain', time: '8 min ago' },
    { id: '4', type: 'consent_granted', description: 'Patient did:afrihealth:CMR-7A3F2B granted consent to Dr. Boateng', time: '12 min ago' },
    { id: '5', type: 'record_anchored', description: '8 records anchored from Lagos UTH', time: '15 min ago' },
    { id: '6', type: 'facility_registered', description: 'New facility registered: Centre de Santé Douala', time: '22 min ago' },
    { id: '7', type: 'claim_verified', description: 'Insurance claim #INS-4520 verified via blockchain', time: '28 min ago' },
    { id: '8', type: 'record_anchored', description: '5 records anchored from Korle Bu TH', time: '35 min ago' },
  ],
};
