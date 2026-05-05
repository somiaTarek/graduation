// src/app/features/receptionist/pages/new-appointment/new-appointment.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { CreateAppointmentModal } from '../../../../shared/components/create-appointment-modal/create-appointment-modal';
import {ReceptionistNavbar } from "../../receptionist-layout/receptionist-navbar/receptionist-navbar";

@Component({
  selector: 'app-new-appointment',
  standalone: true,
  imports: [CommonModule, ReceptionistNavbar, CreateAppointmentModal],
  templateUrl: './new-appointment.html',
})
export class NewAppointment {
  private router = inject(Router);

  onCreated(): void {
    this.router.navigate(['/receptionist/dashboard']);
  }

  goBack(): void {
    this.router.navigate(['/receptionist/dashboard']);
  }
}
