// src/app/features/doctor/pages/doctor-dashboard/doctor-dashboard.ts

import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DoctorNavbar } from '../../../../layout/doctor-layout/doctor-navbar/doctor-navbar';
import { DoctorService, Doctor } from '../../../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [RouterModule, DoctorNavbar],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.css',
})
export class DoctorDashboard implements OnInit {
  private doctorService = inject(DoctorService);

  doctor: Doctor | null = null;
  error: string | null  = null;

  ngOnInit(): void {
    // ✅ resolveDoctorProfile() uses getDoctorId() (integer) → /api/Doctor/3
    this.doctorService.resolveDoctorProfile().subscribe({
      next: (doctor: Doctor) => {
        this.doctor = doctor;
        console.log('Doctor profile loaded:', doctor);
      },
      error: (err) => {
        this.error = 'Failed to load doctor profile.';
        console.error(err);
      },
    });
  }
}
