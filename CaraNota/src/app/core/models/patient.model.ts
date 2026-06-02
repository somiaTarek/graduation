// core/models/patient.model.ts
// ─────────────────────────────────────────────────────────────────────────────
// CHANGES vs previous version:
//
//   🗑️  DELETED: `Appointment` interface
//       — was a duplicate of `PatientAppointment` with different field names
//         (appointmentDate vs startTime/endTime). Nothing imports `Appointment`
//         from this file — only `PatientAppointment` is used externally.
//
//   🗑️  DELETED: `FAKE_PATIENTS` constant + related `of`/`delay` imports
//       — only used by the old patient.service.ts which had a USE_FAKE_DATA
//         flag. The updated patient.service.ts is fully connected to the backend.
//         Remove these when you replace patient.service.ts.
//
//   🗑️  DELETED: `PrescriptionMedication` interface
//       — never imported anywhere outside this file.
//         MedicationLine in visitsummary.service.ts is the correct equivalent.
//
//   ✅  KEPT: `Patient`, `UpdatePatientDto`, `Medication`, `PatientViewModel`,
//             `PatientVisit`, `PatientAppointment`
//       — all actively imported in components and services.
// ─────────────────────────────────────────────────────────────────────────────

// Raw patient shape returned by GET /api/Patient and GET /api/Patient/{id}
export interface Patient {
  id:            number;
  fullName:      string;
  email:         string;
  phoneNumber:   string;
  gender?:       string;
  bloodType?:    string;
  allergies?:    string;
  insuranceInfo?: string;
}

// PUT /api/Patient/{id} body
export interface UpdatePatientDto {
  gender?:        string;
  bloodType?:     string;
  allergies?:     string;
  insuranceInfo?: string;
}

// Medication catalog item — GET /Api/Medication and /Api/Medication/{Id}
export interface Medication {
  id:              number;
  medicationName:  string;
  medicationType:  string;
  description?:    string;
  strength?:       string;
}

// Rich view model used by doctor patient pages and patient profile
export class PatientViewModel {
  id:            number;
  fullName:      string;
  email:         string;
  phoneNumber:   string;
  gender?:       string;
  bloodType?:    string;
  allergies?:    string;
  insuranceInfo?: string;

  constructor(data: any) {
    // .NET may return id under several different casing variants
    this.id =
      data.id          ??
      data.patientId   ??
      data.patientID   ??
      data.userId      ??
      0;

    this.fullName      = data.fullName ?? data.name ?? '';
    this.email         = data.email    ?? '';
    this.phoneNumber   = data.phoneNumber ?? '';
    this.gender        = data.gender;
    this.bloodType     = data.bloodType;
    this.allergies     = data.allergies;
    this.insuranceInfo = data.insuranceInfo;
  }

  get initials(): string {
    return this.fullName
      .split(' ')
      .map((w: string) => w[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Placeholder — backend does not expose dateOfBirth yet
  get age(): number { return 0; }

  get allergyList(): string[] {
    return this.allergies
      ? this.allergies.split(',').map((a: string) => a.trim()).filter(Boolean)
      : [];
  }
}

// Used by GET /Api/Visit/Patient/{patientId}
export interface PatientVisit {
  id:            number;
  visitDate:     string;
  subjective?:   string;
  objective?:    string;
  assessment?:   string;
  plan?:         string;
  appointmentID?: number;
}

// Used by GET /api/Appointment/patient/{patientId}
export interface PatientAppointment {
  id:              number;
  appointmentDate: string;
  appointmentType: string;
  status:          string;
}
