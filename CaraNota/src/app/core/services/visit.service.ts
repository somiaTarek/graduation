// src/app/core/services/visit.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, switchMap, of } from 'rxjs';
import { Visit, CreateVisitDto } from '../models/appointment.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VisitService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Api/Visit`;  // capital V

  // ── The key method — called when doctor clicks "Start Visit" ──────────
  //
  // Logic:
  //   1. Try to fetch existing visit for this appointment
  //   2. If visit EXISTS  → return it (doctor may be resuming)
  //   3. If visit MISSING → create new visit → return it
  //
  // The component receives a Visit and navigates using visit.visitId
  // No need for the component to know about this check — it's hidden here

  getOrCreateVisit(appointmentId: number): Observable<Visit> {
    return this.getVisitByAppointment(appointmentId).pipe(
      catchError(() => {
        // 404 means no visit yet — create one now
        const dto: CreateVisitDto = {
          visitDate: new Date().toISOString(),
          appointmentID: appointmentId,
        };
        return this.createVisit(dto);
      })
    );
  }

  // ── CRUD ──────────────────────────────────────────────────────────────

  createVisit(dto: CreateVisitDto): Observable<Visit> {
    return this.http.post<Visit>(this.baseUrl, dto);
  }

  getVisitById(id: number): Observable<Visit> {
    return this.http.get<Visit>(`${this.baseUrl}/${id}`);
  }

  getVisitDetails(id: number): Observable<Visit> {
    return this.http.get<Visit>(`${this.baseUrl}/${id}/Details`);
  }

  getVisitByAppointment(appointmentId: number): Observable<Visit> {
    return this.http.get<Visit>(`${this.baseUrl}/Appointment/${appointmentId}`);
  }

  getVisitsByPatient(patientId: number): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.baseUrl}/Patient/${patientId}`);
  }

  updateVisit(id: number, dto: Partial<CreateVisitDto>): Observable<Visit> {
    return this.http.put<Visit>(`${this.baseUrl}/${id}`, dto);
  }

  deleteVisit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
