// src/app/core/services/doctor.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Doctor } from '../models/appointment.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = `${environment.apiUrl}/api/Doctor`;

  // Call this once after login — saves doctorID to localStorage via AuthService
  resolveDoctorId(): Observable<Doctor> {
    const userId = this.auth.getUserId();

    if (!userId) throw new Error('No userID found — user must be logged in');

    // Backend note: GET /api/Doctor/{id} — the id here is the userID
    // The backend resolves the doctor profile linked to that user
    return this.http.get<Doctor>(`${this.baseUrl}/${userId}`).pipe(
      tap(doctor => this.auth.saveDoctorId(doctor.id))
    );
  }

  getDoctorById(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.baseUrl}/${id}`);
  }

  getDoctorsBySpecialty(specialty: string): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/specialty/${specialty}`);
  }

  // Add to doctor.service.ts
getAllDoctors(): Observable<Doctor[]> {
  return this.http.get<Doctor[]>(this.baseUrl);
}
}
