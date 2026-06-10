// core/services/summary.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// Covers:
//   § Audio polling  — GET /api/audio/{visitId}/status
//   § Summary CRUD   — GET / PUT /api/visits/{visitId}/summary
//   § Approval       — POST /api/visits/{visitId}/summary/approve  (NO body)
//   § Rating         — POST /api/visits/{visitId}/summary/rating   { rating, feedback }
//   § Patient view   — GET /api/visits/{visitId}/patient-summary
//
// CHANGES vs previous version:
//   ✅ approveSummary() — body REMOVED. Swagger has no requestBody on /approve.
//      Now sends: http.post(url, null)
//   ✅ rateSummary() — ADDED BACK. /rating endpoint is still in Swagger.
//   ✅ UpdateSummaryDto / EditSummaryDto — now imported from visit.model.ts
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile, tap, catchError, of } from 'rxjs';
import {
  VisitSummaryResponseDto,
  EditSummaryDto,
  PatientSummaryViewDto,
  AudioProcessingStatus,
  AudioStatusDto,
  RateSummaryDto,
  RateSummaryResponseDto,
} from '../models/visit.model';
import { API } from '../constants/api';

export type PollTickCallback = (status: AudioProcessingStatus, pollCount: number) => void;

@Injectable({ providedIn: 'root' })
export class SummaryService {
  private http = inject(HttpClient);

  // ── § Audio polling ────────────────────────────────────────────────────────
  //
  // Polls GET /api/audio/{visitId}/status every `intervalMs` (default 6 s).
  // Emits each AudioStatusDto until status === 'Completed' | 'Failed',
  // or until maxPolls attempts (default 30 → ~3 min).
  //
  // Usage in component:
  //   this.summaryService.pollUntilReady(visitId, (status, n) => {
  //     this.audioStatus.set(status);
  //   }).subscribe({
  //     next: dto => { if (dto.status === 'Completed') this.loadSummary(); },
  //     error: () => { /* handle connection drop */ }
  //   });
  pollUntilReady(
    visitId:    number,
    onTick?:    PollTickCallback,
    intervalMs = 6_000,
    maxPolls   = 30,
  ): Observable<AudioStatusDto> {
    let count = 0;

    return interval(intervalMs).pipe(
      tap(() => count++),
      switchMap(() =>
        this.http.get<AudioStatusDto>(API.AUDIO.STATUS(visitId)).pipe(
          catchError(() =>
            // Network hiccup — synthetic 'Processing' keeps polling alive
            of({ visitId, status: 'Processing' as AudioProcessingStatus })
          )
        )
      ),
      tap(dto => onTick?.(dto.status, count)),
      takeWhile(
        dto => dto.status !== 'Completed' && dto.status !== 'Failed' && count < maxPolls,
        true,  // emit the terminating value so component sees 'Completed'/'Failed'
      ),
    );
  }

  // ── § Summary CRUD ─────────────────────────────────────────────────────────

  // GET /api/visits/{visitId}/summary
  // Returns full doctor + patient AI summary for the doctor review page.
  getSummary(visitId: number): Observable<VisitSummaryResponseDto> {
    return this.http.get<VisitSummaryResponseDto>(API.SUMMARY.BASE(visitId));
  }

  // PUT /api/visits/{visitId}/summary → 204 No Content
  // EditSummaryDto fields: subjective, objective, assessment, plan,
  //   comparisonWithPreviousVisit, diagnosis, symptoms, treatmentPlan,
  //   whenToSeekHelp (NEW), followUp
  editSummary(visitId: number, dto: EditSummaryDto): Observable<void> {
    return this.http.put<void>(API.SUMMARY.BASE(visitId), dto);
  }

  // ── § Approval ─────────────────────────────────────────────────────────────

  // POST /api/visits/{visitId}/summary/approve → 200
  // ⚠️ NO request body — Swagger confirms no requestBody on this endpoint.
  //    Passing null is required; passing {} causes .NET model binding issues.
  approveSummary(visitId: number): Observable<void> {
    return this.http.post<void>(API.SUMMARY.APPROVE(visitId), null);
  }

  // ── § Rating ───────────────────────────────────────────────────────────────

  // POST /api/visits/{visitId}/summary/rating → 200
  // ⚠️ This endpoint IS in the new Swagger — was incorrectly removed before.
  // Body: { rating: number, feedback?: string }
  rateSummary(visitId: number, dto: RateSummaryDto): Observable<RateSummaryResponseDto> {
    return this.http.post<RateSummaryResponseDto>(API.SUMMARY.RATING(visitId), dto);
  }

  // ── § Patient-facing view ──────────────────────────────────────────────────

  // GET /api/visits/{visitId}/patient-summary
  // Standalone read-only view for patient portal.
  // Returns PatientSummaryViewDto — different from the patientSummary
  // nested inside VisitSummaryResponseDto.
  getPatientSummary(visitId: number): Observable<PatientSummaryViewDto> {
    return this.http.get<PatientSummaryViewDto>(API.SUMMARY.PATIENT_VIEW(visitId));
  }
}
