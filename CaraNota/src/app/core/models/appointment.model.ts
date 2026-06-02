// core/models/appointment.model.ts
// ─────────────────────────────────────────────────────────────────────────────
// All interfaces are aligned with the FINAL Swagger schemas.
//
// Key changes vs previous version:
//   • DoctorSummaryDto — `doctorRating` field REMOVED (not in final swagger)
//   • PatientSummaryDto — `followUp` field REMOVED; `whenToSeekHelp` stays
//   • ApproveSummaryDto — was { rating: number } → now { followUpDate?: string }
//   • UpdateSummaryDto  — new `whenToSeekHelp` field added (EditSummaryDto in swagger)
//   • UpdateVisitDto    — new `whenToSeekHelp` and `followUpDate` fields added
//   • PatientSummaryViewDto — brand new DTO for GET /api/visits/{id}/patient-summary
// ─────────────────────────────────────────────────────────────────────────────

// ── Appointment ───────────────────────────────────────────────────────────────
export interface Appointment {
  appointmentID: number;
  startTime:        string;
  endTime:          string;
  status:           AppointmentStatus;
  appointmentType:  string;
  createdAt:        string;
  patientID:        number;
  patientName:      string;
  doctorID:         number;
  doctorName:       string;
  receptionistID?:  number;
}

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface CreateAppointmentDto {
  startTime:       string;         // ISO 8601
  endTime:         string;
  appointmentType: string;
  patientID:       number;
  doctorID:        number;
  receptionistID:  number;         // required by swagger (no ?)
}

export interface UpdateAppointmentDto {
  startTime?:       string;
  endTime?:         string;
  status?:          AppointmentStatus;
  appointmentType?: string;
}

export interface TimeSlot {
  start: string;
  end:   string;
}

// ── Visit ─────────────────────────────────────────────────────────────────────
export interface Visit {
  visitId:       number;
  visitDate:     string;
  subjective?:   string;
  objective?:    string;
  assessment?:   string;
  plan?:         string;
  appointmentID: number;
}

export interface CreateVisitDto {
  appointmentID: number;
  visitDate:     string;           // ISO 8601
  subjective?:   string;
  objective?:    string;
  assessment?:   string;
  plan?:         string;
}

// ⚠️ New fields added in final swagger: whenToSeekHelp, followUpDate
export interface UpdateVisitDto {
  subjective?:      string;
  objective?:       string;
  assessment?:      string;
  plan?:            string;
  whenToSeekHelp?:  string;        // ← NEW
  followUpDate?:    string;        // ← NEW  ISO 8601 datetime
}

// ── Audio ─────────────────────────────────────────────────────────────────────
export interface AudioRecordResponseDto {
  audioId:      number;
  audioFileUrl: string;
  createdAt:    string;
  deletionAt:   string;
  visitId:      number;
  message:      string;
}

export type AudioProcessingStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

export interface AudioStatusDto {
  visitId:        number;
  status:         AudioProcessingStatus;
  transcription?: string;
}

// ── Summary ───────────────────────────────────────────────────────────────────

// Doctor-facing SOAP summary (GET /api/visits/{id}/summary → doctorSummary)
// ⚠️ `doctorRating` removed — it no longer exists in the final swagger schema
export interface DoctorSummaryDto {
  aiSummaryId: number;
  subjective:  string;
  objective:   string;
  assessment:  string;
  plan:        string;
}

// Embedded inside VisitSummaryResponseDto (doctor summary page)
// ⚠️ `followUp` removed — final swagger only has `whenToSeekHelp`
export interface PatientSummaryDto {
  aiSummaryId:    number;
  diagnosis:      string;
  symptoms:       string;
  treatmentPlan:  string;
  whenToSeekHelp: string;
}

export interface VisitSummaryResponseDto {
  visitId:        number;
  isApproved:     boolean;
  doctorSummary:  DoctorSummaryDto;
  patientSummary: PatientSummaryDto;
}

// PUT /api/visits/{id}/summary body (was UpdateSummaryDto, swagger calls it EditSummaryDto)
// ⚠️ New field `whenToSeekHelp` added in final swagger
export interface UpdateSummaryDto {
  subjective?:     string;
  objective?:      string;
  assessment?:     string;
  plan?:           string;
  whenToSeekHelp?: string;         // ← NEW
}

// POST /api/visits/{id}/summary/approve body
// ⚠️ BREAKING CHANGE: was { rating: number } → now { followUpDate?: string }
// The /rating endpoint no longer exists — only /approve remains.
export interface ApproveSummaryDto {
  followUpDate?: string;           // ← CHANGED — ISO 8601 datetime, optional
}

// GET /api/visits/{id}/patient-summary  ← NEW endpoint in final swagger
// Patient-facing read-only view of their visit summary
export interface PatientSummaryViewDto {
  visitId:        number;
  visitDate:      string;
  diagnosis?:     string;
  symptoms?:      string;
  treatmentPlan?: string;
  whenToSeekHelp?: string;
  followUpDate?:  string;          // ISO 8601 datetime
}

// ── Doctor ────────────────────────────────────────────────────────────────────
export interface Doctor {
  id:           number;
  fullName:     string;
  email:        string;
  specialty:    string;
  phoneNumber?: string;
}

// ── Prescription ──────────────────────────────────────────────────────────────
export interface Prescription {
  id:           number;
  instructions: string;
  visitID:      number;
}

export interface CreatePrescriptionDto {
  instructions: string;
  visitID:      number;
}

export interface UpdatePrescriptionDto {
  instructions: string;
}

export interface AddMedicationToPrescriptionDto {
  medicationID: number;
  dosage?:      string;
  frequency?:   string;
  route?:       string;
  duration?:    string;
  notes?:       string;
}

// ── Lab Test ──────────────────────────────────────────────────────────────────
export interface LabTest {
  id:          number;
  labTestName: string;
  visitID:     number;
}

export interface CreateLabTestDto {
  labTestName: string;
  visitID:     number;
}

// ── Diagnosis ─────────────────────────────────────────────────────────────────
// ⚠️ Field is `icD10Code` — odd casing from .NET; keep exactly as-is
export interface Diagnosis {
  icD10Code:     string;
  diagnosisName: string;
}

export interface AssignDiagnosisDto {
  icD10Code: string;
}
