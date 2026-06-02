// core/services/visitsummary.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// Covers §9 Diagnosis, §10 Medication, §11 Prescription, §12 Lab Test
//
// FIXES vs previous version:
//   ✅ loadVisitClinicalData() — replaced nested subscribe anti-pattern with
//      proper switchMap + catchError chain (no more subscription leaks)
//   ✅ Uses API constants throughout
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, switchMap, catchError, map } from 'rxjs';
import { API } from '../constants/api';
import {
  Diagnosis,
  AssignDiagnosisDto,
  Prescription,
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  AddMedicationToPrescriptionDto,
  LabTest,
  CreateLabTestDto,
} from '../models/appointment.model';
import { Medication } from '../models/patient.model';

// ── Types local to this service ───────────────────────────────────────────────

export interface MedicationLine {
  medicationID:   number;
  medicationName?: string;
  dosage?:        string;
  frequency?:     string;
  route?:         string;
  duration?:      string;
  notes?:         string;
}

export interface CreateMedicationDto {
  medicationName:  string;
  medicationType:  string;
  description?:    string;
  strength?:       string;
}

export interface UpdateMedicationDto {
  medicationType?: string;
  description?:    string;
  strength?:       string;
}

export interface VisitClinicalData {
  diagnoses:       Diagnosis[];
  prescription:    Prescription | null;
  medicationLines: MedicationLine[];
  labTests:        LabTest[];
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class VisitSummaryService {
  private http = inject(HttpClient);

  // ── Convenience: load all clinical data for a visit in one stream ──────────
  // ✅ FIX: replaced nested subscribe with switchMap chain — no subscription leaks
  loadVisitClinicalData(visitId: number): Observable<VisitClinicalData> {
    return forkJoin({
      diagnoses: this.getDiagnosesByVisit(visitId),
      labTests:  this.getLabTestsByVisit(visitId),
    }).pipe(
      switchMap(({ diagnoses, labTests }) =>
        this.getPrescriptionByVisit(visitId).pipe(
          catchError(() => of(null)),   // no prescription yet → gracefully return null
          switchMap(prescription =>
            prescription
              ? this.getMedicationLines(prescription.id).pipe(
                  catchError(() => of([])),  // endpoint may not exist yet
                  map(medicationLines => ({ diagnoses, labTests, prescription, medicationLines }))
                )
              : of({ diagnoses, labTests, prescription: null, medicationLines: [] })
          )
        )
      )
    );
  }

  // ── §9 DIAGNOSIS ──────────────────────────────────────────────────────────

  getAllDiagnoses(): Observable<Diagnosis[]> {
    return this.http.get<Diagnosis[]>(API.DIAGNOSIS.LIST);
  }

  // GET /Api/Diagnosis/Search?Query=
  searchDiagnoses(query: string): Observable<Diagnosis[]> {
    return this.http.get<Diagnosis[]>(API.DIAGNOSIS.SEARCH, { params: { Query: query } });
  }

  getDiagnosisByCode(icdCode: string): Observable<Diagnosis> {
    return this.http.get<Diagnosis>(API.DIAGNOSIS.BY_ICD(icdCode));
  }

  createDiagnosis(dto: Diagnosis): Observable<Diagnosis> {
    return this.http.post<Diagnosis>(API.DIAGNOSIS.LIST, dto);
  }

  deleteDiagnosis(icdCode: string): Observable<void> {
    return this.http.delete<void>(API.DIAGNOSIS.BY_ICD(icdCode));
  }

  getDiagnosesByVisit(visitId: number): Observable<Diagnosis[]> {
    return this.http.get<Diagnosis[]>(API.DIAGNOSIS.BY_VISIT(visitId));
  }

  // POST /Api/Diagnosis/Visit/{VisitId}/Assign
  // ⚠️ Body must use `icD10Code` — exact casing required by backend
  assignDiagnosisToVisit(visitId: number, icdCode: string): Observable<void> {
    const dto: AssignDiagnosisDto = { icD10Code: icdCode };
    return this.http.post<void>(API.DIAGNOSIS.ASSIGN(visitId), dto);
  }

  removeDiagnosisFromVisit(visitId: number, icdCode: string): Observable<void> {
    return this.http.delete<void>(API.DIAGNOSIS.REMOVE_FROM_VISIT(visitId, icdCode));
  }

  // ── §10 MEDICATION ────────────────────────────────────────────────────────

  getAllMedications(): Observable<Medication[]> {
    return this.http.get<Medication[]>(API.MEDICATION.LIST);
  }

  // GET /Api/Medication/Search?Name=
  searchMedications(name: string): Observable<Medication[]> {
    return this.http.get<Medication[]>(API.MEDICATION.SEARCH, { params: { Name: name } });
  }

  getMedicationsByType(type: string): Observable<Medication[]> {
    return this.http.get<Medication[]>(API.MEDICATION.BY_TYPE(type));
  }

  getMedicationById(id: number): Observable<Medication> {
    return this.http.get<Medication>(API.MEDICATION.BY_ID(id));
  }

  createMedication(dto: CreateMedicationDto): Observable<Medication> {
    return this.http.post<Medication>(API.MEDICATION.LIST, dto);
  }

  updateMedication(id: number, dto: UpdateMedicationDto): Observable<Medication> {
    return this.http.put<Medication>(API.MEDICATION.BY_ID(id), dto);
  }

  deleteMedication(id: number): Observable<void> {
    return this.http.delete<void>(API.MEDICATION.BY_ID(id));
  }

  // ── §11 PRESCRIPTION ──────────────────────────────────────────────────────

  createPrescription(dto: CreatePrescriptionDto): Observable<Prescription> {
    return this.http.post<Prescription>(API.PRESCRIPTION.LIST, dto);
  }

  getPrescriptionById(id: number): Observable<Prescription> {
    return this.http.get<Prescription>(API.PRESCRIPTION.BY_ID(id));
  }

  getPrescriptionByVisit(visitId: number): Observable<Prescription> {
    return this.http.get<Prescription>(API.PRESCRIPTION.BY_VISIT(visitId));
  }

  updatePrescription(id: number, dto: UpdatePrescriptionDto): Observable<void> {
    return this.http.put<void>(API.PRESCRIPTION.BY_ID(id), dto);
  }

  deletePrescription(id: number): Observable<void> {
    return this.http.delete<void>(API.PRESCRIPTION.BY_ID(id));
  }

  addMedicationToPrescription(
    prescriptionId: number,
    dto: AddMedicationToPrescriptionDto
  ): Observable<void> {
    return this.http.post<void>(API.PRESCRIPTION.MEDICATIONS(prescriptionId), dto);
  }

  removeMedicationFromPrescription(
    prescriptionId: number,
    medicationId: number
  ): Observable<void> {
    return this.http.delete<void>(
      API.PRESCRIPTION.MEDICATION_BY_ID(prescriptionId, medicationId)
    );
  }

  // GET /Api/Prescription/{Id}/Medications
  // ⚠️ Not officially in swagger — backend confirmed it exists; handle 404 gracefully.
  getMedicationLines(prescriptionId: number): Observable<MedicationLine[]> {
    return this.http.get<MedicationLine[]>(API.PRESCRIPTION.MEDICATIONS(prescriptionId));
  }

  // ── §12 LAB TEST ──────────────────────────────────────────────────────────

  orderLabTest(dto: CreateLabTestDto): Observable<LabTest> {
    return this.http.post<LabTest>(API.LAB_TEST.LIST, dto);
  }

  getLabTestById(id: number): Observable<LabTest> {
    return this.http.get<LabTest>(API.LAB_TEST.BY_ID(id));
  }

  getLabTestsByVisit(visitId: number): Observable<LabTest[]> {
    return this.http.get<LabTest[]>(API.LAB_TEST.BY_VISIT(visitId));
  }

  deleteLabTest(id: number): Observable<void> {
    return this.http.delete<void>(API.LAB_TEST.BY_ID(id));
  }

  // POST /Api/LabTest/{Id}/UploadResult  — multipart/form-data
  uploadLabResult(labTestId: number, file: File): Observable<void> {
    const form = new FormData();
    form.append('ResultFile', file, file.name);
    return this.http.post<void>(API.LAB_TEST.UPLOAD_RESULT(labTestId), form);
  }

  // GET /Api/LabTest/{Id}/Download  → Blob
  downloadLabResult(labTestId: number): Observable<Blob> {
    return this.http.get(API.LAB_TEST.DOWNLOAD(labTestId), { responseType: 'blob' });
  }
}
