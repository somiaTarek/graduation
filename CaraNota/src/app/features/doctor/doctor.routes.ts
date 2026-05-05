import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const DOCTOR_ROUTES: Routes = [
  {
    path: '', // This matches the base '/doctor' path
    loadComponent: () =>
      import('./pages/doctor-dashboard/doctor-dashboard').then(m => m.DoctorDashboard),
  },
  {
    path: 'today-visits',
    loadComponent: () =>
      import('./pages/today-visit/today-visit').then(m => m.TodayVisit),
  },
  {
    path: 'visit-session/:visitId',
    loadComponent: () =>
      import('./pages/today-visit/visit-session/visit-session').then(m => m.VisitSession),
  },
  {
    path: 'recording/:visitId',
    loadComponent: () =>
      import('./pages/recording/recording').then(m => m.Recording),
  },
  // {
  //   path: 'visit-note/:visitId',
  //   loadComponent: () =>
  //     import('./visit-note/visit-note.component').then(m => m.VisitNoteComponent),
  // },
  {
    path: 'scheduling',
    loadComponent: () =>
      import('./pages/scheduling/scheduling').then(m => m.Scheduling),
  },
  {
    path: 'patients',
    loadComponent: () =>
      import('./pages/patients/patients').then(m => m.Patients),
  },
];
