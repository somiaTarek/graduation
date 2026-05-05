// src/app/features/patient/pages/reminders/reminders.component.ts
//
// Uses ReminderService (from this feature folder) to build reminders.
// Reminders are NOT a real API endpoint — they are derived from:
//   - GET /Api/Prescription/Visit/{visitId} + /Medications  → medication reminders
//   - GET /api/Appointment/patient/{patientId}              → appointment reminders
//   - localStorage                                          → health reminders

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService }     from '../../../../core/services/auth.service';
import { ReminderService } from '../../services/reminder.service';
import { Reminder, ReminderFilter } from '../../models/reminder.model';
import { NavbarComponent }          from '../../components/navbar/navbar.component';
import { FooterComponent }          from '../../components/footer/footer.component';
import { ReminderCardComponent }    from '../../components/reminder-card/reminder-card.component';

@Component({
  selector: 'app-patient-reminders',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, ReminderCardComponent],
  templateUrl: './reminders.component.html',
})
export class RemindersComponent implements OnInit {
  private authService    = inject(AuthService);
  private reminderService = inject(ReminderService);

  allReminders = signal<Reminder[]>([]);
  activeFilter = signal<ReminderFilter>('all');
  isLoading    = signal(true);
  error        = signal<string | null>(null);

  // ── Counts for tab badges ─────────────────────────────────────────────────
  medicationCount  = computed(() => this.allReminders().filter(r => r.type === 'medication').length);
  appointmentCount = computed(() => this.allReminders().filter(r => r.type === 'appointment').length);
  healthCount      = computed(() => this.allReminders().filter(r => r.type === 'health').length);
  totalCount       = computed(() => this.allReminders().length);

  // ── Filtered list for display ─────────────────────────────────────────────
  filtered = computed(() => {
    const f = this.activeFilter();
    if (f === 'all') return this.allReminders();
    return this.allReminders().filter(r => r.type === f);
  });

  readonly filters: { key: ReminderFilter; labelFn: () => string }[] = [
    { key: 'all',         labelFn: () => `All (${this.totalCount()})` },
    { key: 'medication',  labelFn: () => `Medication (${this.medicationCount()})` },
    { key: 'appointment', labelFn: () => `Appointments (${this.appointmentCount()})` },
    { key: 'health',      labelFn: () => `Health (${this.healthCount()})` },
  ];

  ngOnInit(): void {
    const patientId = this.authService.getPatientId();
    if (!patientId) {
      this.error.set('Could not identify patient.');
      this.isLoading.set(false);
      return;
    }

    this.reminderService.buildReminders(patientId).subscribe({
      next: reminders => {
        this.allReminders.set(reminders);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load reminders.');
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: ReminderFilter): void {
    this.activeFilter.set(filter);
  }

  onToggle(reminder: Reminder): void {
    this.reminderService.toggle(reminder);
    // Trigger signal update by replacing the array reference
    this.allReminders.update(list => [...list]);
  }

  onEdit(reminder: Reminder): void {
    // TODO: open edit modal — for now just log
    console.log('Edit reminder:', reminder);
  }
}
