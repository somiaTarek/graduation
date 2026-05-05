import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { VisitService } from '../../../../core/services/visit.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Appointment } from '../../../../core/models/appointment.model';
import { DoctorNavbar } from "../../../../layout/doctor-layout/doctor-navbar/doctor-navbar";


@Component({
  selector: 'app-today-visit',
  imports: [DoctorNavbar],
  templateUrl: './today-visit.html',
  styleUrl: './today-visit.css',
})
export class TodayVisit  implements OnInit {
  private appointmentService = inject(AppointmentService);
  private visitService = inject(VisitService);
  private authService = inject(AuthService);
  private router = inject(Router);

  appointments = signal<Appointment[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Track which appointment card is currently loading (to show spinner per card)
  loadingAppointmentId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadTodayAppointments();
  }

  private loadTodayAppointments(): void {
    const doctorId = this.authService.getDoctorId();
    if (!doctorId) {
      this.error.set('Doctor profile not found. Please log out and log in again.');
      this.isLoading.set(false);
      return;
    }

    // Strategy: fetch all doctor appointments, filter by today + Scheduled status
    // This avoids needing date-range and ensures we only show THIS doctor's list
    this.appointmentService.getByDoctor(doctorId).subscribe({
      next: (all) => {
        const todayScheduled = all.filter(a => {
          const isToday = this.isToday(a.startTime);
          const isScheduled = a.status === 'Scheduled';
          return isToday && isScheduled;
        });

        // Sort by start time ascending
        todayScheduled.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        this.appointments.set(todayScheduled);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load appointments. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  // Called when doctor clicks an appointment card
startVisit(appointment: Appointment): void {
  this.loadingAppointmentId.set(appointment.appointmentID);

  this.visitService.getOrCreateVisit(appointment.appointmentID).subscribe({
    next: (visit) => {
      console.log('Visit response:', visit); // ← ADD THIS
      this.loadingAppointmentId.set(null);
      this.router.navigate(['/doctor/visit-session', visit.visitId], {
        state: { appointment },
      });
    },
    error: (err) => {
      console.log('Visit error:', err); // ← ADD THIS TOO
      this.loadingAppointmentId.set(null);
      this.error.set('Could not start visit. Please try again.');
    },
  });
}

  // ── Helpers ────────────────────────────────────────────────────────────

  private isToday(utcString: string): boolean {
    const date = new Date(utcString);
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  formatTime(utcString: string): string {
    return this.appointmentService.toLocalTime(utcString);
  }

  formatDate(utcString: string): string {
    return this.appointmentService.toLocalDate(utcString);
  }

  get todayLabel(): string {
    return new Date().toLocaleDateString([], {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}
