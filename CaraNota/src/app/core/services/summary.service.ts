// core/services/summary.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// Covers /api/visits/{visitId}/summary endpoints.
//
// BREAKING CHANGES vs previous version (confirmed in final swagger):
//   ✅ approveSummary() body changed: was { rating: number } → { followUpDate?: string }
//   ✅ submitRating() REMOVED — /summary/rating endpoint no longer exists
//   ✅ editSummary() body now includes new `whenToSeekHelp` field
//   ✅ getPatientSummary() ADDED — new GET /api/visits/{id}/patient-summary endpoint
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  VisitSummaryResponseDto,
  UpdateSummaryDto,
  ApproveSummaryDto,
  PatientSummaryViewDto,
} from '../models/appointment.model';
import { API } from '../constants/api';

@Injectable({ providedIn: 'root' })
export class SummaryService {
  private http = inject(HttpClient);

  // GET /api/visits/{visitId}/summary
  // Returns the full doctor + patient summary (used on doctor summary review page)
  getSummary(visitId: number): Observable<VisitSummaryResponseDto> {
    return this.http.get<VisitSummaryResponseDto>(API.SUMMARY.BASE(visitId));
  }

  // PUT /api/visits/{visitId}/summary
  // Doctor edits AI-generated SOAP fields before approving.
  // Body now also accepts `whenToSeekHelp` (new field in final swagger).
  // Returns 204 No Content.
  editSummary(visitId: number, dto: UpdateSummaryDto): Observable<void> {
    return this.http.put<void>(API.SUMMARY.BASE(visitId), dto);
  }

  // POST /api/visits/{visitId}/summary/approve
  // Marks summary as approved.
  // ⚠️ Body changed: was { rating: number 0–5 } → now { followUpDate?: string (ISO datetime) }
  // followUpDate is optional — pass null or omit entirely if no follow-up is needed.
  approveSummary(visitId: number, dto: ApproveSummaryDto): Observable<void> {
    return this.http.post<void>(API.SUMMARY.APPROVE(visitId), dto);
  }

  // GET /api/visits/{visitId}/patient-summary
  // ← NEW in final swagger — patient-facing read-only view of their visit summary.
  // Use this on the patient dashboard / visit detail page.
  getPatientSummary(visitId: number): Observable<PatientSummaryViewDto> {
    return this.http.get<PatientSummaryViewDto>(API.SUMMARY.PATIENT_VIEW(visitId));
  }
}
