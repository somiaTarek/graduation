import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctor-navbar',
  imports:
  [RouterModule],
  templateUrl: './doctor-navbar.html',
  styleUrl: './doctor-navbar.css',
})
export class DoctorNavbar {

   servicesOpen = false;

  services = [
    { label: 'Appointments', route: '/appointments' },
    { label: 'Patients', route: '/patients' },
    { label: 'Reports', route: '/reports' }
  ];

  toggleServices() {
    this.servicesOpen = !this.servicesOpen;
  }

}
