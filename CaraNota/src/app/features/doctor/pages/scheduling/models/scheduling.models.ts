// scheduling/models/scheduling.models.ts
//
// ⚠️  DO NOT redefine Appointment here.
// Single source of truth → core/models/appointment.model.ts
//
// This file only defines what is SPECIFIC to the scheduling feature.

import { Appointment } from '../../../../../core/models/appointment.model';

// ─── Calendar event ───────────────────────────────────────────────────────────
// Derived inside SchedulingService from the Appointment list.
// Never returned directly by the API.
export interface CalendarEvent {
  id: number;
  patientName: string;
  startHour: number;   // decimal hours  e.g. 11.5 = 11:30
  endHour: number;     // decimal hours  e.g. 12.0 = 12:00
  dayIndex: number;    // 0=Sat  1=Sun  2=Mon  3=Tue  4=Wed  5=Thu
  color: 'pink' | 'blue';
}

// ─── Everything the scheduling page needs ────────────────────────────────────
export interface SchedulingData {
  doctorName: string;
  greeting: string;
  nextAppointment: Appointment | null;   // first Scheduled appointment today
  upcomingList: Appointment[];           // rest of today's Scheduled list
  calendarEvents: CalendarEvent[];       // derived from the weekly appointments
}
