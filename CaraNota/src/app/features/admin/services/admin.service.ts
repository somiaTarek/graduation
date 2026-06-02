// features/admin/services/admin.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// CHANGES vs previous version:
//   ✅ Uses API constants
//   ✅ updateAdminProfile typed properly with UpdateAdminProfileDto
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import {
  AdminProfile,
  ChangePasswordDto,
  DoctorProfile,
  ReceptionistProfile,
  CreateDoctorRequest,
  CreateReceptionistRequest,
  CreateStaffResponse,
  UpdateAdminProfileDto,
  AdminStats,
} from '../models/admin.model';
import { DoctorService } from '../../../core/services/doctor.service';
import { PatientService } from '../../../core/services/patient.service';
import { Doctor } from '../../../core/models/appointment.model';
import { API } from '../../../core/constants/api';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http           = inject(HttpClient);
  private doctorService  = inject(DoctorService);
  private patientService = inject(PatientService);

  // ── Unified create staff (called by CreateUserComponent) ─────────────────
  createStaff(payload: any): Observable<CreateStaffResponse> {
    if (payload.role === 'doctor') {
      return this.createDoctor({
        fullName:    payload.fullName,
        email:       payload.email,
        password:    payload.password,
        phoneNumber: payload.phoneNumber,
        specialty:   payload.specialty,
      });
    } else {
      return this.createReceptionist({
        fullName:    payload.fullName,
        email:       payload.email,
        password:    payload.password,
        phoneNumber: payload.phoneNumber,
      });
    }
  }

  // ── Doctors ───────────────────────────────────────────────────────────────

  getAllDoctors(): Observable<DoctorProfile[]> {
    return this.doctorService.getAllDoctors().pipe(
      map(doctors => doctors.map(d => ({
        id:          d.id,
        fullName:    d.fullName,
        email:       d.email,
        specialty:   d.specialty,
        phoneNumber: d.phoneNumber,
      })))
    );
  }

  getDoctorById(id: number): Observable<DoctorProfile> {
    return this.doctorService.getDoctorById(id).pipe(
      map((doctor: Doctor) => ({
        id:          doctor.id,
        fullName:    doctor.fullName,
        email:       doctor.email,
        specialty:   doctor.specialty,
        phoneNumber: doctor.phoneNumber,
      }))
    );
  }

  deleteDoctor(id: number): Observable<void> {
    return this.http.delete<void>(API.DOCTOR.BY_ID(id));
  }

  // ── Receptionists ─────────────────────────────────────────────────────────

  getAllReceptionists(): Observable<ReceptionistProfile[]> {
    return this.http.get<ReceptionistProfile[]>(API.ADMIN.RECEPTIONISTS);
  }

  deleteReceptionist(id: number): Observable<void> {
    return this.http.delete<void>(API.ADMIN.RECEPTIONIST_BY_ID(id));
  }

  // ── Create staff ──────────────────────────────────────────────────────────

  createDoctor(payload: CreateDoctorRequest): Observable<CreateStaffResponse> {
    return this.http.post<CreateStaffResponse>(API.ADMIN.CREATE_DOCTOR, {
      fullName:    payload.fullName,
      email:       payload.email,
      password:    payload.password,
      phoneNumber: payload.phoneNumber,
      specialty:   payload.specialty,
    });
  }

  createReceptionist(payload: CreateReceptionistRequest): Observable<CreateStaffResponse> {
    return this.http.post<CreateStaffResponse>(API.ADMIN.CREATE_RECEPTIONIST, {
      fullName:    payload.fullName,
      email:       payload.email,
      password:    payload.password,
      phoneNumber: payload.phoneNumber,
    });
  }

  // ── Patients ──────────────────────────────────────────────────────────────

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(API.PATIENT.BY_ID(id));
  }

  // ── Admin self-management ─────────────────────────────────────────────────

  getAdminProfile(): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(API.ADMIN.PROFILE);
  }

  updateAdminProfile(dto: UpdateAdminProfileDto): Observable<void> {
    return this.http.put<void>(API.ADMIN.PROFILE, dto);
  }

  changeAdminPassword(dto: ChangePasswordDto): Observable<void> {
    return this.http.put<void>(API.ADMIN.CHANGE_PASSWORD, dto);
  }

  // ── Dashboard stats ───────────────────────────────────────────────────────

  getStats(): Observable<AdminStats> {
    return forkJoin({
      doctors:       this.getAllDoctors(),
      patients:      this.patientService.getAll(),
      receptionists: this.getAllReceptionists(),
    }).pipe(
      map(({ doctors, patients, receptionists }) => ({
        totalDoctors:       doctors.length,
        totalReceptionists: receptionists.length,
        totalPatients:      patients.length,
      }))
    );
  }
}
