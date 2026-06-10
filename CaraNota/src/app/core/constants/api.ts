// core/constants/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for ALL backend endpoints.
// Source of truth: swagger_new.json
//
// ⚠️  URL CASING RULES — .NET routing is case-sensitive on Linux servers:
//   /Api/…  (capital A) → Auth, Visit, Diagnosis, Medication, Prescription, LabTest
//   /api/…  (lowercase) → Admin, Appointment, Doctor, Patient, audio, visits/summary
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
    PROFILE:             `${BASE}/api/admin/profile`,             // GET + PUT
    CHANGE_PASSWORD:     `${BASE}/api/admin/change-password`,     // PUT
    CREATE_DOCTOR:       `${BASE}/api/admin/create-doctor`,       // POST
    CREATE_RECEPTIONIST: `${BASE}/api/admin/create-receptionist`, // POST
    RECEPTIONISTS:       `${BASE}/api/admin/receptionists`,       // GET
    DELETE_RECEPTIONIST: (id: number) => `${BASE}/api/admin/receptionists/${id}`, // DELETE only — no GET by id
  },

  // ── §3  PATIENT  /api/Patient ──────────────────────────────────────────────
  // ⚠️  No /details sub-endpoint — removed from Swagger
  PATIENT: {
    LIST:   `${BASE}/api/Patient`,                          // GET
    BY_ID:  (id: number) => `${BASE}/api/Patient/${id}`,   // GET, PUT, DELETE
    SEARCH: `${BASE}/api/Patient/search`,                   // GET ?name=
  },

  // ── §4  DOCTOR  /api/Doctor ────────────────────────────────────────────────
  // ⚠️  PUT body only accepts { specialty } — see UpdateDoctorDto
  DOCTOR: {
    LIST:         `${BASE}/api/Doctor`,                                       // GET
    BY_ID:        (id: number)        => `${BASE}/api/Doctor/${id}`,          // GET, PUT, DELETE
    BY_SPECIALTY: (specialty: string) => `${BASE}/api/Doctor/specialty/${specialty}`, // GET
  },

  // ── §5  APPOINTMENT  /api/Appointment ─────────────────────────────────────
  APPOINTMENT: {
    LIST:            `${BASE}/api/Appointment`,                                              // GET, POST
    BY_ID:           (id: number)        => `${BASE}/api/Appointment/${id}`,                 // GET, PUT, DELETE
    DETAILS:         (id: number)        => `${BASE}/api/Appointment/${id}/details`,         // GET
    BY_PATIENT:      (patientId: number) => `${BASE}/api/Appointment/patient/${patientId}`,  // GET
    BY_DOCTOR:       (doctorId: number)  => `${BASE}/api/Appointment/doctor/${doctorId}`,    // GET
    BY_STATUS:       (status: string)    => `${BASE}/api/Appointment/status/${status}`,      // GET
    DATE_RANGE:      `${BASE}/api/Appointment/date-range`,                                   // GET ?from=&to=
    CANCEL:          (id: number)        => `${BASE}/api/Appointment/${id}/cancel`,          // PUT
    DOCTOR_WEEKLY:   (doctorId: number)  => `${BASE}/api/Appointment/doctor/${doctorId}/weekly`,           // GET ?startOfWeek=
    AVAILABLE_SLOTS: (doctorId: number)  => `${BASE}/api/Appointment/doctor/${doctorId}/available-slots`,  // GET ?date=
  },

  // ── §6  VISIT  /Api/Visit  (capital A) ────────────────────────────────────
  VISIT: {
    LIST:           `${BASE}/Api/Visit`,                                             // GET, POST
    BY_ID:          (id: number)            => `${BASE}/Api/Visit/${id}`,            // GET, PUT, DELETE
    DETAILS:        (id: number)            => `${BASE}/Api/Visit/${id}/Details`,    // GET
    BY_PATIENT:     (patientId: number)     => `${BASE}/Api/Visit/Patient/${patientId}`,           // GET
    BY_APPOINTMENT: (appointmentId: number) => `${BASE}/Api/Visit/Appointment/${appointmentId}`,   // GET
  },

  // ── §7  SUMMARY  /api/visits (lowercase) ──────────────────────────────────
  // ⚠️  PUT body: EditSummaryDto — includes whenToSeekHelp, followUp, diagnosis, etc.
  // ⚠️  POST /approve has NO request body — send empty post: http.post(url, null)
  // ⚠️  POST /rating: RateSummaryDto { rating, feedback } — still present in Swagger
  SUMMARY: {
    BASE:         (visitId: number) => `${BASE}/api/visits/${visitId}/summary`,          // GET, PUT
    APPROVE:      (visitId: number) => `${BASE}/api/visits/${visitId}/summary/approve`,  // POST (no body)
    RATING:       (visitId: number) => `${BASE}/api/visits/${visitId}/summary/rating`,   // POST { rating, feedback }
    PATIENT_VIEW: (visitId: number) => `${BASE}/api/visits/${visitId}/patient-summary`,  // GET
  },

  // ── §8  AUDIO  /api/audio (lowercase) ─────────────────────────────────────
  AUDIO: {
    UPLOAD: `${BASE}/api/audio/upload`,                                // POST multipart { AudioFile, VisitId }
    STATUS: (visitId: number) => `${BASE}/api/audio/${visitId}/status`, // GET
  },

  // ── §9  DIAGNOSIS  /Api/Diagnosis  (capital A) ────────────────────────────
  // ⚠️  BREAKING CHANGE: no ICD lookup, no search, no assign endpoint.
  //    DELETE takes integer {Id}, NOT an ICD string.
  //    CREATE body: { diagnosisName, visitID } — visitID is capital ID.
  DIAGNOSIS: {
    BY_VISIT: (visitId: number) => `${BASE}/Api/Diagnosis/Visit/${visitId}`, // GET
    CREATE:   `${BASE}/Api/Diagnosis`,                                         // POST { diagnosisName, visitID }
    DELETE:   (id: number)      => `${BASE}/Api/Diagnosis/${id}`,              // DELETE — integer Id only
  },

  // ── §10  MEDICATION  /Api/Medication  (capital A) ─────────────────────────
  MEDICATION: {
    LIST:    `${BASE}/Api/Medication`,                               // GET, POST
    BY_ID:   (id: number)   => `${BASE}/Api/Medication/${id}`,      // GET, PUT, DELETE
    SEARCH:  `${BASE}/Api/Medication/Search`,                        // GET ?Name=
    BY_TYPE: (type: string) => `${BASE}/Api/Medication/Type/${type}`, // GET
  },

  // ── §11  PRESCRIPTION  /Api/Prescription  (capital A) ────────────────────
  // ⚠️  No LIST-all endpoint — use BY_VISIT to fetch per visit
  PRESCRIPTION: {
    BY_ID:             (id: number)      => `${BASE}/Api/Prescription/${id}`,                      // GET, PUT, DELETE
    BY_VISIT:          (visitId: number) => `${BASE}/Api/Prescription/Visit/${visitId}`,           // GET
    CREATE:            `${BASE}/Api/Prescription`,                                                   // POST
    ADD_MEDICATION:    (id: number)      => `${BASE}/Api/Prescription/${id}/Medications`,           // POST
    REMOVE_MEDICATION: (id: number, medicationId: number) =>
                         `${BASE}/Api/Prescription/${id}/Medications/${medicationId}`,              // DELETE
  },

  // ── §12  LAB TEST  /Api/LabTest  (capital A) ──────────────────────────────
  LAB_TEST: {
    BY_ID:         (id: number)      => `${BASE}/Api/LabTest/${id}`,              // GET, DELETE
    BY_VISIT:      (visitId: number) => `${BASE}/Api/LabTest/Visit/${visitId}`,   // GET
    CREATE:        `${BASE}/Api/LabTest`,                                           // POST { labTestName, visitID }
    UPLOAD_RESULT: (id: number)      => `${BASE}/Api/LabTest/${id}/UploadResult`, // POST multipart { ResultFile }
    DOWNLOAD:      (id: number)      => `${BASE}/Api/LabTest/${id}/Download`,     // GET → Blob
  },

} as const;
