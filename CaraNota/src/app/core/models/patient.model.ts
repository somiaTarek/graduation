// patient.model.ts
// ─────────────────────────────────────────────────────────────────────────────
// CHANGES vs your original:
//   - id: string → number  (API returns numeric IDs)
//   - name → fullName      (API field is "fullName")
//   - allergies: string[] → string  (API stores as a single string, e.g. "Penicillin, Dust")
//   - Removed: initials (derived on frontend — compute from fullName)
//   - Removed: vitals[], medications[], appointments[] from Patient model
//     WHY: the API delivers these through SEPARATE endpoints:
//       medications  → GET /Api/Prescription/Visit/{visitId} + /Api/Prescription/{id}/Medications
//       appointments → GET /api/Appointment/patient/{patientId}
//   - Added nested models: PatientVisit, PatientAppointment, Medication
// ─────────────────────────────────────────────────────────────────────────────

// ─── Core patient (from GET /api/Patient or GET /api/Patient/{id}) ───────────
export interface Patient {
  id: number;             // ✅ number (was string)
  fullName: string;       // ✅ "fullName" (was "name")
  email: string;
  phoneNumber: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;     // ✅ plain string (was string[])
                          //    e.g. "Penicillin, Pollen" — split on ', ' if needed
  insuranceInfo?: string;

  // ─── Derived on frontend (not from API) ───────────────────────────────
  get initials(): string; // compute as fullName.split(' ').map(w=>w[0]).join('')
  get age(): number;      // not in API — remove from template or ask backend to add
}


export interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentType: string;
  status: string;
  patientID: number;
  receptionistID?: number;
}




export interface Medication {
  id: number;
  medicationName: string;
  medicationType: string;
  description?: string;
  strength?: string;
}

// ─── Use this class instead of interface to support getters ──────────────────
export class PatientViewModel {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  insuranceInfo?: string;

  constructor(data: Partial<PatientViewModel>) {
    this.id          = data.id ?? 0;
    this.fullName    = data.fullName ?? '';
    this.email       = data.email ?? '';
    this.phoneNumber = data.phoneNumber ?? '';
    this.gender      = data.gender;
    this.bloodType   = data.bloodType;
    this.allergies   = data.allergies;
    this.insuranceInfo = data.insuranceInfo;
  }

  get initials(): string {
    return this.fullName
      .split(' ')
      .map(w => w[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }


  get age(): number { return 0; }

  get allergyList(): string[] {
    // ✅ Safely split the API's plain string into an array for display
    return this.allergies
      ? this.allergies.split(',').map(a => a.trim()).filter(Boolean)
      : [];
  }
}

// ─── Visit / SOAP note (from GET /Api/Visit/Patient/{patientId}) ─────────────
export interface PatientVisit {
  id: number;
  visitDate: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  appointmentID?: number;
}

// ─── Appointment (from GET /api/Appointment/patient/{patientId}) ─────────────
export interface PatientAppointment {
  id: number;
  appointmentDate: string;
  appointmentType: string;
  status: string;          // "Scheduled" | "Completed" | "Cancelled"
}

// ─── Medication (from GET /Api/Prescription/{id} + Medications) ──────────────
export interface PrescriptionMedication {
  medicationID: number;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  notes?: string;
}

// ─── FAKE DATA for development (updated to match new model) ──────────────────
export const FAKE_PATIENTS: PatientViewModel[] = [
  new PatientViewModel({
    id: 101,
    fullName: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    phoneNumber: '+20-100-000-0001',
    gender: 'Male',
    bloodType: 'A+',
    allergies: 'Penicillin, Dust',
    insuranceInfo: 'AllianzCare - Policy #12345',
  }),
  new PatientViewModel({
    id: 102,
    fullName: 'Mariam Youssef',
    email: 'mariam@example.com',
    phoneNumber: '+20-100-000-0002',
    gender: 'Female',
    bloodType: 'O-',
    allergies: '',
    insuranceInfo: 'MetLife - Policy #67890',
  }),
  new PatientViewModel({
    id: 103,
    fullName: 'Tarek Mostafa',
    email: 'tarek@example.com',
    phoneNumber: '+20-100-000-0003',
    gender: 'Male',
    bloodType: 'B+',
    allergies: 'Aspirin',
  }),
];
