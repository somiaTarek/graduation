// scheduling/services/scheduling.service.ts
//
// Uses endpoints from api.ts / swagger_new.json:
//
//   GET /api/Appointment/doctor/{doctorId}/weekly?startOfWeek=   → weekly calendar
//   GET /api/Appointment/doctor/{doctorId}                       → upcoming sidebar
//   PUT /api/Appointment/{id}/cancel                             → cancel action
//
// ⚠️  IMPORTANT — Naive datetime strings:
//   The backend returns NAIVE Egypt local time (no Z, no UTC offset).
//   NEVER pass them to `new Date()` for comparison — always compare the
//   date/time string parts directly to avoid UTC-shift bugs (Egypt = UTC+3).

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of, delay } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../../core/services/auth.service';
import { Appointment } from '../../../../../core/models/appointment.model';
import { CalendarEvent, SchedulingData } from '../models/scheduling.models';

// ─── Flip to false when backend is ready ─────────────────────────────────────
const USE_FAKE_DATA = false;
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class SchedulingService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // lowercase /api — matches swagger_new.json for Appointment
  private base = `${environment.apiUrl}/api/Appointment`;

  // ─── Public entry point ──────────────────────────────────────────────────

  getSchedulingData(weekStart: Date = this.currentWeekStart()): Observable<SchedulingData> {
    if (USE_FAKE_DATA) return this.getFakeData(weekStart);
    return this.getRealData(weekStart);
  }

  cancelAppointment(id: number): Observable<void> {
    // PUT /api/Appointment/{id}/cancel
    return this.http.put<void>(`${this.base}/${id}/cancel`, {});
  }

  // ─── Real API ────────────────────────────────────────────────────────────

  private getRealData(weekStart: Date): Observable<SchedulingData> {
    const doctorId = this.auth.getDoctorId();
    if (!doctorId) throw new Error('DoctorId not found — call resolveDoctorId() after login');

    return forkJoin({
      weekly: this.getWeekly(doctorId, weekStart),
      all:    this.getByDoctor(doctorId),
    }).pipe(
      map(({ weekly, all }) => this.buildSchedulingData(weekly, all))
    );
  }

  // GET /api/Appointment/doctor/{doctorId}/weekly?startOfWeek=
  private getWeekly(doctorId: number, weekStart: Date): Observable<Appointment[]> {
    // Build a naive local datetime string for the query param — no UTC conversion
    const y  = weekStart.getFullYear();
    const m  = String(weekStart.getMonth() + 1).padStart(2, '0');
    const d  = String(weekStart.getDate()).padStart(2, '0');
    const startOfWeekParam = `${y}-${m}-${d}T00:00:00`;

    const params = new HttpParams().set('startOfWeek', startOfWeekParam);
    return this.http.get<Appointment[]>(
      `${this.base}/doctor/${doctorId}/weekly`, { params }
    );
  }

  // GET /api/Appointment/doctor/{doctorId}
  private getByDoctor(doctorId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.base}/doctor/${doctorId}`);
  }

  // ─── Build SchedulingData from API responses ─────────────────────────────

  private buildSchedulingData(
    weekly: Appointment[],
    all: Appointment[]
  ): SchedulingData {
    const todayDatePart = this.getTodayDatePart(); // "YYYY-MM-DD"

    // Upcoming sidebar — today's Scheduled appointments sorted by startTime string
    const todayScheduled = all
      .filter(a =>
        a.status === 'Scheduled' &&
        this.getDatePart(a.startTime) === todayDatePart
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Calendar grid — all non-cancelled appointments from the weekly response
    // We do NOT filter to today only — the calendar shows the full week.
    // toDayIndex() derives the column from the date string, not new Date().
    const calendarEvents: CalendarEvent[] = weekly
      .filter(a => a.status !== 'Cancelled')
      .map(a => this.toCalendarEvent(a));

    const doctorName = weekly[0]?.doctorName ?? all[0]?.doctorName ?? 'Doctor';

    return {
      doctorName,
      greeting:         this.getGreeting(),
      nextAppointment:  todayScheduled[0] ?? null,
      upcomingList:     todayScheduled.slice(1),
      calendarEvents,
    };
  }

  // ─── Fake data (mirrors real AppointmentDto shape exactly) ───────────────

  private getFakeData(weekStart: Date): Observable<SchedulingData> {
    // All strings are NAIVE local time — no Z suffix
    const y = weekStart.getFullYear();
    const m = String(weekStart.getMonth() + 1).padStart(2, '0');

    // Sat = weekStart (day 0), Sun = day+1, Mon = day+2 …
    const dayStr = (offset: number): string => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + offset);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    };

    const sat = dayStr(0);
    const sun = dayStr(1);
    const mon = dayStr(2);
    const tue = dayStr(3);
    const wed = dayStr(4);
    const thu = dayStr(5);

    const fakeAppointments: Appointment[] = [
      // Saturday
      { appointmentID: 1, startTime: `${sat}T09:00:00`, endTime: `${sat}T09:30:00`, status: 'Scheduled',  appointmentType: 'General check-up', patientID: 101, patientName: 'Khaled Youssef',   doctorID: 1, doctorName: 'Dr. Hassan', createdAt: `${sat}T00:00:00` },
      { appointmentID: 2, startTime: `${sat}T10:00:00`, endTime: `${sat}T10:30:00`, status: 'Scheduled',  appointmentType: 'Follow-up',        patientID: 102, patientName: 'Mariam Tarek',     doctorID: 1, doctorName: 'Dr. Hassan', createdAt: `${sat}T00:00:00` },
      // Sunday
      { appointmentID: 3, startTime: `${sun}T11:00:00`, endTime: `${sun}T11:30:00`, status: 'Scheduled',  appointmentType: 'Consultation',     patientID: 103, patientName: 'Ahmed Samir',      doctorID: 1, doctorName: 'Dr. Hassan', createdAt: `${sun}T00:00:00` },
      // Monday
      { appointmentID: 4, startTime: `${mon}T09:00:00`, endTime: `${mon}T09:30:00`, status: 'Scheduled',  appointmentType: 'General check-up', patientID: 104, patientName: 'Tarek Mansour',    doctorID: 1, doctorName: 'Dr. Hassan', createdAt: `${mon}T00:00:00` },
      // Tuesday
      { appointmentID: 5, startTime: `${tue}T13:00:00`, endTime: `${tue}T13:30:00`, status: 'Scheduled',  appointmentType: 'Follow-up',        patientID: 105, patientName: 'Eman Khalil',      doctorID: 1, doctorName: 'Dr. Hassan', createdAt: `${tue}T00:00:00` },
      // Wednesday — cancelled (should not appear on calendar)
      { appointmentID: 6, startTime: `${wed}T14:00:00`, endTime: `${wed}T14:30:00`, status: 'Cancelled',  appointmentType: 'General check-up', patientID: 106, patientName: 'Abdelrhman Nabil', doctorID: 1, doctorName: 'Dr. Hassan', createdAt: `${wed}T00:00:00` },
      // Thursday
      { appointmentID: 7, startTime: `${thu}T10:00:00`, endTime: `${thu}T10:30:00`, status: 'Scheduled',  appointmentType: 'Consultation',     patientID: 107, patientName: 'Sara Mostafa',     doctorID: 1, doctorName: 'Dr. Hassan', createdAt: `${thu}T00:00:00` },
    ];

    const data = this.buildSchedulingData(fakeAppointments, fakeAppointments);
    return of(data).pipe(delay(300));
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private toCalendarEvent(a: Appointment): CalendarEvent {
    // Parse time components directly from the naive string — no new Date()
    const [sh, sm] = this.getTimeParts(a.startTime);
    const [eh, em] = this.getTimeParts(a.endTime);

    return {
      id:          a.appointmentID,
      patientName: a.patientName,
      startHour:   sh + sm / 60,
      endHour:     eh + em / 60,
      dayIndex:    this.toDayIndex(a.startTime), // derived from date string, not JS Date
      color:       'pink',
    };
  }

  /**
   * Derive the Egyptian work-week column index from a naive datetime string.
   * Egyptian work week: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5
   *
   * We parse using noon local time to avoid any DST edge case — still safe
   * because we only care about the weekday number, and noon is never ambiguous.
   */
  private toDayIndex(naiveString: string): number {
    const datePart = this.getDatePart(naiveString); // "YYYY-MM-DD"
    const [y, mo, d] = datePart.split('-').map(Number);
    // Use Date constructor with explicit parts — no string parsing, so no UTC shift
    const dayOfWeek = new Date(y, mo - 1, d).getDay(); // 0=Sun … 6=Sat
    const map: Record<number, number> = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 };
    return map[dayOfWeek] ?? 0;
  }

  /** Extract "YYYY-MM-DD" from a naive datetime string */
  private getDatePart(naiveString: string): string {
    return naiveString.split('T')[0];
  }

  /** Extract [hours, minutes] from a naive datetime string */
  private getTimeParts(naiveString: string): [number, number] {
    const timePart = naiveString.split('T')[1] ?? '00:00:00';
    const [h, m]   = timePart.split(':').map(Number);
    return [h, m];
  }

  /** Today's date as "YYYY-MM-DD" using local clock — no UTC conversion */
  private getTodayDatePart(): string {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Returns the most recent Saturday (start of Egyptian work week).
   * Sets time to midnight local — the naive param is built from this in getWeekly().
   */
  currentWeekStart(): Date {
    const d   = new Date();
    const day = d.getDay();                    // 0=Sun … 6=Sat
    const diff = day === 6 ? 0 : day + 1;     // days since last Saturday
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}
