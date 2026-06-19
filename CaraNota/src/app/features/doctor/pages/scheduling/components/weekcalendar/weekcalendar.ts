// components/weekcalendar/weekcalendar.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent } from '../../models/scheduling.models';

interface WeekDay {
  name: string;
  shortName: string;
  date: number;
  fullDate: Date;
  isToday: boolean;
}

// Color palette — cycles per appointment id so colors are stable across re-renders
const PALETTES = [
  { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' }, // blue
  { bg: '#EDE9FE', border: '#8B5CF6', text: '#5B21B6' }, // violet
  { bg: '#D1FAE5', border: '#10B981', text: '#065F46' }, // emerald
  { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' }, // amber
  { bg: '#FFE4E6', border: '#F43F5E', text: '#9F1239' }, // rose
  { bg: '#CFFAFE', border: '#06B6D4', text: '#164E63' }, // cyan
  { bg: '#FCE7F3', border: '#EC4899', text: '#9D174D' }, // pink
];

@Component({
  selector: 'app-weekcalendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weekcalendar.html',
})
export class Weekcalendar implements OnChanges {
  @Input() events: CalendarEvent[] = [];
  @Input() weekStart: Date = new Date();
  @Output() weekChanged = new EventEmitter<Date>();

  readonly rowHeight = 64;
  readonly dayNames  = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  readonly timeSlots = [
    { label: '9 AM',  hour: 9  },
    { label: '10 AM', hour: 10 },
    { label: '11 AM', hour: 11 },
    { label: '12 PM', hour: 12 },
    { label: '1 PM',  hour: 13 },
    { label: '2 PM',  hour: 14 },
    { label: '3 PM',  hour: 15 },
  ];

  weekDays: WeekDay[] = [];
  weekLabel = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['weekStart'] || changes['events']) {
      this.buildWeek();
    }
  }

  private buildWeek(): void {
    const months  = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
    // Compare date parts as strings — avoids any UTC/timezone shift
    const todayDatePart = this.getTodayDatePart(); // "YYYY-MM-DD"

    this.weekDays = this.dayNames.map((name, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      const y  = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const datePart = `${y}-${mo}-${dd}`;
      return {
        name,
        shortName: name.slice(0, 3).toUpperCase(),
        date:      d.getDate(),
        fullDate:  d,
        isToday:   datePart === todayDatePart,
      };
    });

    const s = this.weekDays[0].fullDate;
    const e = this.weekDays[5].fullDate;
    this.weekLabel = `${s.getDate()} ${months[s.getMonth()]} → ${e.getDate()} ${months[e.getMonth()]}`;
  }

  // ── Week navigation — step by exactly 7 days ──────────────────────────────

  prevWeek(): void {
    const prev = new Date(this.weekStart);
    prev.setDate(prev.getDate() - 7); // ✅ was -6 (bug: caused overlapping weeks)
    this.weekChanged.emit(prev);
  }

  nextWeek(): void {
    const next = new Date(this.weekStart);
    next.setDate(next.getDate() + 7); // ✅ was +6 (bug: caused overlapping weeks)
    this.weekChanged.emit(next);
  }

  // ── Event helpers ─────────────────────────────────────────────────────────

  /** All events for a given day column (used in template if needed) */
  getEventsForDay(dayIdx: number): CalendarEvent[] {
    return this.events.filter(e => e.dayIndex === dayIdx);
  }

  /**
   * Events that START in this slot hour for a given day column.
   * Rendered once at the correct row — no duplicates across rows.
   */
  getEvents(dayIdx: number, slotHour: number): CalendarEvent[] {
    return this.events.filter(
      e => e.dayIndex === dayIdx && Math.floor(e.startHour) === slotHour
    );
  }

  /** Pixel offset from the top of this slot row */
  getTopOffset(slotHour: number, startHour: number): number {
    return (startHour - slotHour) * this.rowHeight;
  }

  /** Pixel height — minimum 44 px so short appointments remain readable */
  getEventHeight(start: number, end: number): number {
    return Math.max((end - start) * this.rowHeight - 4, 44);
  }

  formatEventTime(start: number, end: number): string {
    return `${this.hourToString(start)} – ${this.hourToString(end)}`;
  }

  /** Stable color per event — id modulo palette length */
  getPalette(evt: CalendarEvent): { bg: string; border: string; text: string } {
    return PALETTES[evt.id % PALETTES.length];
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private hourToString(hour: number): string {
    const h      = Math.floor(hour);
    const m      = Math.round((hour - h) * 60);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const disp   = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${disp}:${m === 0 ? '00' : String(m).padStart(2, '0')} ${suffix}`;
  }

  /** Today's date as "YYYY-MM-DD" from local clock — no UTC conversion */
  private getTodayDatePart(): string {
    const t  = new Date();
    const y  = t.getFullYear();
    const mo = String(t.getMonth() + 1).padStart(2, '0');
    const d  = String(t.getDate()).padStart(2, '0');
    return `${y}-${mo}-${d}`;
  }
}
