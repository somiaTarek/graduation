// core/services/visit.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// Covers /Api/Visit endpoints (capital A — .NET routing).
//
// CHANGES vs previous version:
//   ✅ Uses API constants
//   ✅ updateSoapNotes() now accepts full UpdateVisitDto (includes whenToSeekHelp, followUpDate)
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Visit, CreateVisitDto, UpdateVisitDto } from '../models/appointment.model';
import { API } from '../constants/api';

@Injectable({ providedIn: 'root' })
export class VisitService {
  private http = inject(HttpClient);

  // POST /Api/Visit
  createVisit(dto: CreateVisitDto): Observable<Visit> {
    return this.http.post<Visit>(API.VISIT.LIST, dto);
  }

  // GET /Api/Visit
  getAllVisits(): Observable<Visit[]> {
    return this.http.get<Visit[]>(API.VISIT.LIST);
  }

  // GET /Api/Visit/{Id}
  getVisitById(id: number): Observable<Visit> {
    return this.http.get<Visit>(API.VISIT.BY_ID(id));
  }

  // GET /Api/Visit/{Id}/Details
  getVisitDetails(id: number): Observable<Visit> {
    return this.http.get<Visit>(API.VISIT.DETAILS(id));
  }

  // GET /Api/Visit/Patient/{PatientId}
  getVisitsByPatient(patientId: number): Observable<Visit[]> {
    return this.http.get<Visit[]>(API.VISIT.BY_PATIENT(patientId));
  }

  // GET /Api/Visit/Appointment/{AppointmentId}
  getVisitByAppointment(appointmentId: number): Observable<Visit> {
    return this.http.get<Visit>(API.VISIT.BY_APPOINTMENT(appointmentId));
  }

  // PUT /Api/Visit/{Id}
  // ⚠️ Final swagger adds `whenToSeekHelp` and `followUpDate` to the body.
  updateSoapNotes(id: number, dto: UpdateVisitDto): Observable<void> {
    return this.http.put<void>(API.VISIT.BY_ID(id), dto);
  }

  // DELETE /Api/Visit/{Id}
  deleteVisit(id: number): Observable<void> {
    return this.http.delete<void>(API.VISIT.BY_ID(id));
  }
}
