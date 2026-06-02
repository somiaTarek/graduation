// src/app/features/doctor/doctor.routes.ts
import { Routes } from '@angular/router';

export const DOCTOR_ROUTES: Routes = [
  // Redirect /doctor → /doctor/dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/doctor-dashboard/doctor-dashboard').then(m => m.DoctorDashboard),
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/doctor-profile/doctor-profile').then(m => m.DoctorProfile),
  },

  // ── Today's Visits ────────────────────────────────────────────────────────
  {
    path: 'today-visits',
    loadComponent: () =>
      import('./pages/today-visit/today-visit').then(m => m.TodayVisit),
  },

  // ── Recording ─────────────────────────────────────────────────────────────
  {
    path: 'recording/:visitId',
    loadComponent: () =>
      import('./pages/recording/recording').then(m => m.Recording),
  },

  // ── Scheduling ────────────────────────────────────────────────────────────
  {
    path: 'scheduling',
    loadComponent: () =>
      import('./pages/scheduling/scheduling').then(m => m.Scheduling),
  },

  // ── Patients ──────────────────────────────────────────────────────────────
  {
    path: 'patients',
    loadComponent: () =>
      import('./pages/patients/patients').then(m => m.Patients),
  },
];
