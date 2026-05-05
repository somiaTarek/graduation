// // src/app/features/receptionist/receptionist.routes.ts
import { Routes } from '@angular/router';

export const RECEPTIONIST_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashbored/receptionist-dashboard/receptionist-dashboard')
        .then(m => m.ReceptionistDashboard),
  },
  {
    // "New appointment" button navigates here
    path: 'new-appointment',
    loadComponent: () =>
      import('./pages/new-appointement/new-appointment')
        .then(m => m.NewAppointment),
  },
  {
    // "Create a patient account" button navigates here
    path: 'create-account',
    loadComponent: () =>
      import('./pages/create-account/create-account')
        .then(m => m.CreateAccount),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
