// src/app/features/patient/services/reminder.service.ts
//
// Reminders are DERIVED from real API data — CareNota has no /reminders endpoint.
//
// Sources:
//   GET /Api/Prescription/Visit/{visitId}        → prescription header
//   GET /Api/Prescription/{id}/Medications        → medication lines → "medication" reminders
//   GET /api/Appointment/patient/{patientId}      → upcoming scheduled appts → "appointment" reminders
//
// User-created "health" reminders (e.g. Blood Pressure Check) are stored
// only in localStorage — they are never sent to the backend.
//
// Active/inactive toggle state for ALL reminders is persisted in localStorage.

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, of, catchError, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService }     from '../../../core/services/patient.service';
import {
  Reminder,
  ReminderType,
  loadReminderStates,
  saveReminderState,
} from '../models/reminder.model';

// ── Shapes matching CareNota API responses ────────────────────────────────────

interface PrescriptionDto {
  id: number;
  instructions?: string;
  visitID: number;
}

interface MedicationLineDto {
  medicationID: number;
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  notes?: string;
}

interface VisitDto {
  id: number;
  visitDate: string;
}

type AppointmentDto = {
  appointmentID: number;
  startTime: string;
  appointmentType: string;
  status: string;
  doctorName?: string;
};

interface HealthReminderRecord {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  isActive: boolean;
}

const HEALTH_STORAGE_KEY = 'carenota_health_reminders';
const TOGGLE_STORAGE_KEY = 'carenota_reminder_states';

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private http               = inject(HttpClient);
  private appointmentService = inject(AppointmentService);
  private patientService     = inject(PatientService);
  private base               = environment.apiUrl;

  // ─── Public ───────────────────────────────────────────────────────────────

  buildReminders(patientId: number): Observable<Reminder[]> {
    const appointments$ = this.appointmentService.getByPatient(patientId).pipe(catchError(() => of([])));
    const visits$       = this.patientService.getVisits(patientId).pipe(catchError(() => of([])));

    return forkJoin({ appointments: appointments$, visits: visits$ }).pipe(
      switchMap(({ appointments, visits }) => {
        const apptReminders = this.appointmentsToReminders(appointments as unknown as AppointmentDto[]);

        const recentVisits = (visits as unknown as VisitDto[])
          .sort((a, b) => +new Date(b.visitDate) - +new Date(a.visitDate))
          .slice(0, 5);

        if (!recentVisits.length) {
          const health = this.loadHealthReminders();
          return of(this.applyStates([...apptReminders, ...health]));
        }

        return forkJoin(recentVisits.map(v => this.visitMedReminders(v.id))).pipe(
          map(groups => {
            const medReminders = groups.flat();
            const health       = this.loadHealthReminders();
            return this.applyStates([...medReminders, ...apptReminders, ...health]);
          })
        );
      })
    );
  }

  toggle(reminder: Reminder): boolean {
    reminder.isActive = !reminder.isActive;
    saveReminderState(reminder.id, reminder.isActive);
    return reminder.isActive;
  }

  addHealthReminder(title: string, subtitle: string, time: string): Reminder {
    const records = this.loadHealthRecords();
    const id      = `health-${Date.now()}`;
    const rec: HealthReminderRecord = { id, title, subtitle, time, isActive: true };
    records.push(rec);
    localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(records));
    return this.healthRecordToReminder(rec);
  }

  // ─── Private: API fetchers ────────────────────────────────────────────────

  private visitMedReminders(visitId: number): Observable<Reminder[]> {
    return this.http
      .get<PrescriptionDto>(`${this.base}/Api/Prescription/Visit/${visitId}`)
      .pipe(
        switchMap(p =>
          this.http.get<MedicationLineDto[]>(`${this.base}/Api/Prescription/${p.id}/Medications`)
        ),
        map(meds => meds.map((m, i) => this.medicationToReminder(m, i))),
        catchError(() => of([]))
      );
  }

  // ─── Private: builders ────────────────────────────────────────────────────

  private appointmentsToReminders(appts: AppointmentDto[]): Reminder[] {
    return appts
      .filter(a => a.status === 'Scheduled')
      .map(a => {
        const dt = new Date(a.startTime);
        return {
          id:         `appt-${a.appointmentID}`,
          type:       'appointment' as ReminderType,
          title:      a.doctorName ? `Follow-up with ${a.doctorName}` : `Appointment — ${a.appointmentType}`,
          subtitle:   a.appointmentType,
          time:       dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recurrence: dt.toLocaleDateString('en-GB'),
          date:       a.startTime,
          isActive:   true,
          sourceId:   a.appointmentID,
        };
      });
  }

  private medicationToReminder(med: MedicationLineDto, idx: number): Reminder {
    const freq    = (med.frequency ?? 'Once daily').toLowerCase();
    const timeMap: Record<string, string> = {
      'once daily':          '08:00 AM',
      'once daily(evening)': '08:00 PM',
      'twice daily':         '08:00 AM',
      'at bedtime':          '10:00 PM',
      'every 8 hours':       '08:00 AM',
    };
    const time    = timeMap[freq] ?? '08:00 AM';
    const display = freq.includes('daily') || freq.includes('bedtime') ? 'Daily' : freq;
    return {
      id:         `med-${med.medicationID}-${idx}`,
      type:       'medication',
      title:      `Take ${med.medicationName ?? 'Medication'}`,
      subtitle:   [med.dosage, med.frequency].filter(Boolean).join(' · '),
      time,
      recurrence: display.charAt(0).toUpperCase() + display.slice(1),
      isActive:   true,
      sourceId:   med.medicationID,
    };
  }

  private healthRecordToReminder(r: HealthReminderRecord): Reminder {
    return { id: r.id, type: 'health', title: r.title, subtitle: r.subtitle,
             time: r.time, recurrence: 'Weekly', isActive: r.isActive };
  }

  // ─── Private: localStorage ────────────────────────────────────────────────

  private loadStates(): Record<string, boolean> {
    try { return JSON.parse(localStorage.getItem(TOGGLE_STORAGE_KEY) ?? '{}'); }
    catch { return {}; }
  }

  private loadHealthRecords(): HealthReminderRecord[] {
    try { return JSON.parse(localStorage.getItem(HEALTH_STORAGE_KEY) ?? '[]'); }
    catch { return []; }
  }

  private loadHealthReminders(): Reminder[] {
    return this.loadHealthRecords().map(r => this.healthRecordToReminder(r));
  }

  private applyStates(reminders: Reminder[]): Reminder[] {
    const saved = this.loadStates();
    return reminders.map(r => ({ ...r, isActive: saved[r.id] !== undefined ? saved[r.id] : r.isActive }));
  }
}
