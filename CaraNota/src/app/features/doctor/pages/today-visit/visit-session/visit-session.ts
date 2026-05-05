import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Appointment } from '../../../../../core/models/appointment.model';
import { AppointmentService } from '../../../../../core/services/appointment.service';

@Component({
  selector: 'app-visit-session',
  imports: [],
  templateUrl: './visit-session.html',
  styleUrl: './visit-session.css',
})
export class VisitSession implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private appointmentService = inject(AppointmentService);

  visitId = signal<number | null>(null);
  appointment = signal<Appointment | null>(null);

  ngOnInit(): void {
    // ── Fix: read visitId from route param ──────────────────────────────
    const idParam = this.route.snapshot.paramMap.get('visitId');
    this.visitId.set(idParam ? Number(idParam) : null);

    // ── Fix: Angular stores router state in window.history.state ────────
    // This works even after ngOnInit — getCurrentNavigation() would be null here
    const state = window.history.state as { appointment?: Appointment };
    if (state?.appointment) {
      this.appointment.set(state.appointment);
    }
  }

  goToRecording(): void {
    const id = this.visitId();
    if (!id) return;
    this.router.navigate(['/doctor/recording', id]);
  }

  goToManualNote(): void {
    const id = this.visitId();
    if (!id) return;
    this.router.navigate(['/doctor/visit-note', id]);
  }

  formatTime(utcString: string): string {
    return this.appointmentService.toLocalTime(utcString);
  }
}

