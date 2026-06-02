// core/services/doctor.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Doctor } from '../models/appointment.model';
import { AuthService } from './auth.service';
import { API } from '../constants/api';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private normalize(raw: any): Doctor {
    return {
      id:          raw.id ?? raw.doctorID ?? raw.doctorId ?? 0,
      fullName:    raw.fullName ?? raw.name ?? raw.FullName ?? '',
      email:       raw.email ?? raw.Email ?? '',
      specialty:   raw.specialty ?? raw.Specialty ?? raw.specialization ?? '',
      phoneNumber: raw.phoneNumber ?? raw.PhoneNumber,
    };
  }

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<any[]>(API.DOCTOR.LIST).pipe(
      map(list => list.map(d => this.normalize(d)))
    );
  }

  getDoctorById(id: number): Observable<Doctor> {
    return this.http.get<any>(API.DOCTOR.BY_ID(id)).pipe(
      map(d => this.normalize(d))
    );
  }

  getDoctorsBySpecialty(specialty: string): Observable<Doctor[]> {
    return this.http.get<any[]>(API.DOCTOR.BY_SPECIALTY(specialty)).pipe(
      map(list => list.map(d => this.normalize(d)))
    );
  }

  // PUT /api/Doctor/{id}  — only specialty can be updated
  updateSpecialty(id: number, specialty: string): Observable<void> {
    return this.http.put<void>(API.DOCTOR.BY_ID(id), { specialty });
  }

  deleteDoctor(id: number): Observable<void> {
    return this.http.delete<void>(API.DOCTOR.BY_ID(id));
  }

  // Resolves the current logged-in doctor's profile using their integer doctorId.
  // ✅ Uses getDoctorId() (integer) not getUserId() (UUID) — avoids 400 errors.
  resolveDoctorProfile(): Observable<Doctor> {
    const doctorId = this.auth.getDoctorId();
    if (!doctorId) {
      throw new Error(
        'doctorId not found in localStorage. ' +
        'Ensure /Api/Auth/Login response includes a doctorId field.'
      );
    }
    return this.getDoctorById(doctorId);
  }
}
