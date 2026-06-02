// core/constants/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for ALL backend endpoints.
// Generated from the FINAL Swagger (swagger__1___1_.json).
//
// ⚠️  URL CASING RULES — .NET routing is case-sensitive on Linux servers:
//   /Api/…  (capital A) → Auth, Visit, Diagnosis, Medication, Prescription, LabTest
//   /api/…  (lowercase) → Admin, Appointment, Doctor, Patient, audio, visits/summary
//
// Usage:
//   import { API } from 'src/app/core/constants/api';
//   this.http.get(API.VISIT.BY_ID(42))
//   this.http.get(API.APPOINTMENT.AVAILABLE_SLOTS(doctorId), { params: { date } })
// ─────────────────────────────────────────────────────────────────────────────

import { environment } from '../../../environments/environment';

const BASE = environment.apiUrl;

export const API = {

  // ── §1  AUTH  /Api/Auth ────────────────────────────────────────────────────
  AUTH: {
    LOGIN:    `${BASE}/Api/Auth/Login`,
    REGISTER: `${BASE}/Api/Auth/Register`,
    REFRESH:  `${BASE}/Api/Auth/Refresh`,
    REVOKE:   `${BASE}/Api/Auth/Revoke`,
  },

  // ── §2  ADMIN  /api/admin ──────────────────────────────────────────────────
  ADMIN: {
    PROFILE:             `${BASE}/api/admin/profile`,
    CHANGE_PASSWORD:     `${BASE}/api/admin/change-password`,
    CREATE_DOCTOR:       `${BASE}/api/admin/create-doctor`,
    CREATE_RECEPTIONIST: `${BASE}/api/admin/create-receptionist`,
    RECEPTIONISTS:       `${BASE}/api/admin/receptionists`,
    RECEPTIONIST_BY_ID:  (id: number) => `${BASE}/api/admin/receptionists/${id}`,
  },

  // ── §3  PATIENT  /api/Patient ──────────────────────────────────────────────
  PATIENT: {
    LIST:    `${BASE}/api/Patient`,
    BY_ID:   (id: number) => `${BASE}/api/Patient/${id}`,
    DETAILS: (id: number) => `${BASE}/api/Patient/${id}/details`,
    SEARCH:  `${BASE}/api/Patient/search`,   // ?name=
  },

  // ── §4  DOCTOR  /api/Doctor ────────────────────────────────────────────────
  DOCTOR: {
    LIST:         `${BASE}/api/Doctor`,
    BY_ID:        (id: number)        => `${BASE}/api/Doctor/${id}`,
    BY_SPECIALTY: (specialty: string) => `${BASE}/api/Doctor/specialty/${specialty}`,
  },

  // ── §5  APPOINTMENT  /api/Appointment ─────────────────────────────────────
  APPOINTMENT: {
    LIST:            `${BASE}/api/Appointment`,
    BY_ID:           (id: number)        => `${BASE}/api/Appointment/${id}`,
    DETAILS:         (id: number)        => `${BASE}/api/Appointment/${id}/details`,
    BY_PATIENT:      (patientId: number) => `${BASE}/api/Appointment/patient/${patientId}`,
    BY_DOCTOR:       (doctorId: number)  => `${BASE}/api/Appointment/doctor/${doctorId}`,
    BY_STATUS:       (status: string)    => `${BASE}/api/Appointment/status/${status}`,
    DATE_RANGE:      `${BASE}/api/Appointment/date-range`,  // ?from=&to=
    CANCEL:          (id: number)        => `${BASE}/api/Appointment/${id}/cancel`,
    DOCTOR_WEEKLY:   (doctorId: number)  => `${BASE}/api/Appointment/doctor/${doctorId}/weekly`,        // ?startOfWeek=
    AVAILABLE_SLOTS: (doctorId: number)  => `${BASE}/api/Appointment/doctor/${doctorId}/available-slots`, // ?date=
  },

  // ── §6  VISIT  /Api/Visit  (capital A) ────────────────────────────────────
  VISIT: {
    LIST:           `${BASE}/Api/Visit`,
    BY_ID:          (id: number)            => `${BASE}/Api/Visit/${id}`,
    DETAILS:        (id: number)            => `${BASE}/Api/Visit/${id}/Details`,
    BY_PATIENT:     (patientId: number)     => `${BASE}/Api/Visit/Patient/${patientId}`,
    BY_APPOINTMENT: (appointmentId: number) => `${BASE}/Api/Visit/Appointment/${appointmentId}`,
  },

  // ── §7  SUMMARY  /api/visits (lowercase) ──────────────────────────────────
  // ⚠️  PUT body now includes `whenToSeekHelp` field (new in final swagger).
  // ⚠️  POST /approve body changed: was { rating } → now { followUpDate? }
  // ⚠️  POST /rating endpoint REMOVED — use /approve instead.
  // ⚠️  New separate endpoint: /patient-summary (patient-facing read-only view).
  SUMMARY: {
    BASE:           (visitId: number) => `${BASE}/api/visits/${visitId}/summary`,
    APPROVE:        (visitId: number) => `${BASE}/api/visits/${visitId}/summary/approve`,
    PATIENT_VIEW:   (visitId: number) => `${BASE}/api/visits/${visitId}/patient-summary`,
  },

  // ── §8  AUDIO  /api/audio (lowercase) ─────────────────────────────────────
  AUDIO: {
    UPLOAD: `${BASE}/api/audio/upload`,
    STATUS: (visitId: number) => `${BASE}/api/audio/${visitId}/status`,
  },

  // ── §9  DIAGNOSIS  /Api/Diagnosis  (capital A) ────────────────────────────
  DIAGNOSIS: {
    LIST:              `${BASE}/Api/Diagnosis`,
    BY_ICD:            (icdCode: string) => `${BASE}/Api/Diagnosis/${icdCode}`,
    SEARCH:            `${BASE}/Api/Diagnosis/Search`,          // ?Query=
    BY_VISIT:          (visitId: number) => `${BASE}/Api/Diagnosis/Visit/${visitId}`,
    ASSIGN:            (visitId: number) => `${BASE}/Api/Diagnosis/Visit/${visitId}/Assign`,
    REMOVE_FROM_VISIT: (visitId: number, icdCode: string) =>
                         `${BASE}/Api/Diagnosis/Visit/${visitId}/${icdCode}`,
  },

  // ── §10  MEDICATION  /Api/Medication  (capital A) ─────────────────────────
  MEDICATION: {
    LIST:    `${BASE}/Api/Medication`,
    BY_ID:   (id: number)   => `${BASE}/Api/Medication/${id}`,
    SEARCH:  `${BASE}/Api/Medication/Search`,                   // ?Name=
    BY_TYPE: (type: string) => `${BASE}/Api/Medication/Type/${type}`,
  },

  // ── §11  PRESCRIPTION  /Api/Prescription  (capital A) ────────────────────
  PRESCRIPTION: {
    LIST:             `${BASE}/Api/Prescription`,  // ⚠️ not in swagger — confirm with backend
    BY_ID:            (id: number)      => `${BASE}/Api/Prescription/${id}`,
    BY_VISIT:         (visitId: number) => `${BASE}/Api/Prescription/Visit/${visitId}`,
    MEDICATIONS:      (id: number)      => `${BASE}/Api/Prescription/${id}/Medications`,
    MEDICATION_BY_ID: (id: number, medicationId: number) =>
                        `${BASE}/Api/Prescription/${id}/Medications/${medicationId}`,
  },

  // ── §12  LAB TEST  /Api/LabTest  (capital A) ──────────────────────────────
  LAB_TEST: {
    LIST:          `${BASE}/Api/LabTest`,
    BY_ID:         (id: number)      => `${BASE}/Api/LabTest/${id}`,
    BY_VISIT:      (visitId: number) => `${BASE}/Api/LabTest/Visit/${visitId}`,
    UPLOAD_RESULT: (id: number)      => `${BASE}/Api/LabTest/${id}/UploadResult`,
    DOWNLOAD:      (id: number)      => `${BASE}/Api/LabTest/${id}/Download`,
  },

} as const;
