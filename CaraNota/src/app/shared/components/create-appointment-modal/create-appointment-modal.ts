// src/app/shared/components/create-appointment-modal/create-appointment-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateAppointmentDto, TimeSlot, Doctor } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-create-appointment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-appointment-modal.html',
})
export class CreateAppointmentModal implements OnInit {
  // Receptionist creates the appointment — their ID comes from auth
  // patientId may be preselected if opened from patient detail page
  @Input() preselectedPatientId?: number;

  @Output() created = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private appointmentService = inject(AppointmentService);
  private doctorService = inject(DoctorService);
  private authService = inject(AuthService);

  // Form fields
  selectedDate = signal('');
  selectedSlot = signal<TimeSlot | null>(null);
  appointmentType = signal('Consultation');
  patientIdInput = signal<number | null>(null);
  selectedDoctorId = signal<number | null>(null);  // doctor is selected IN the form

  // Data
  doctors = signal<Doctor[]>([]);
  availableSlots = signal<TimeSlot[]>([]);

  // UI state
  isLoadingDoctors = signal(false);
  isLoadingSlots = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  readonly appointmentTypes = [
    'Consultation', 'Follow-up', 'Check-up', 'Emergency', 'Procedure',
  ];

  get todayIso(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    if (this.preselectedPatientId) {
      this.patientIdInput.set(this.preselectedPatientId);
    }
    this.selectedDate.set(this.todayIso);
    this.loadDoctors();
  }

  private loadDoctors(): void {
    this.isLoadingDoctors.set(true);
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
        this.isLoadingDoctors.set(false);
      },
      error: () => {
        this.error.set('Could not load doctors list.');
        this.isLoadingDoctors.set(false);
      },
    });
  }

  onDateOrDoctorChange(): void {
    const date = this.selectedDate();
    const doctorId = this.selectedDoctorId();

    // Reset slot selection whenever date or doctor changes
    this.selectedSlot.set(null);
    this.availableSlots.set([]);

    if (!date || !doctorId) return;

    this.isLoadingSlots.set(true);
    this.appointmentService.getAvailableSlots(doctorId, new Date(date)).subscribe({
      next: (slots) => {
        this.availableSlots.set(slots);
        this.isLoadingSlots.set(false);
      },
      error: () => {
        this.error.set('Could not load available slots.');
        this.isLoadingSlots.set(false);
      },
    });
  }

  selectSlot(slot: TimeSlot): void {
    this.selectedSlot.set(slot);
  }

  submit(): void {
    const slot = this.selectedSlot();
    const doctorId = this.selectedDoctorId();
    const patientId = this.preselectedPatientId ?? this.patientIdInput();
    const receptionistId = this.authService.getReceptionistId(); // from JWT

    if (!slot || !doctorId || !patientId) {
      this.error.set('Please fill in all required fields and select a time slot.');
      return;
    }

    const dto: CreateAppointmentDto = {
      startTime: new Date(slot.start).toISOString(),
      endTime: new Date(slot.end).toISOString(),
      appointmentType: this.appointmentType(),
      patientID: patientId,
      doctorID: doctorId,
      receptionistID: receptionistId ?? undefined,
    };

    this.isSubmitting.set(true);
    this.error.set(null);

    this.appointmentService.createAppointment(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.created.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(
          err?.error?.message ?? 'Failed to create appointment. Please try again.'
        );
      },
    });
  }

  formatSlotTime(utcString: string): string {
    return this.appointmentService.toLocalTime(utcString);
  }

  close(): void {
    this.closed.emit();
  }
}
