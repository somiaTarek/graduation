// components/weekcalendar/weekcalendar.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent } from '../../models/scheduling.models';

interface WeekDay {
  name: string;
  date: number;
  fullDate: Date;
}

@Component({
  selector: 'app-weekcalendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weekcalendar.html',
})
export class Weekcalendar implements OnChanges {
  @Input() events: CalendarEvent[] = [];

  // Owned by parent — when doctor navigates we emit the new date and parent re-fetches
  @Input() weekStart: Date = new Date();
  @Output() weekChanged = new EventEmitter<Date>();

  readonly rowHeight = 64;
  readonly dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
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
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    this.weekDays = this.dayNames.map((name, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      return { name, date: d.getDate(), fullDate: d };
    });
    const s = this.weekDays[0].fullDate;
    const e = this.weekDays[5].fullDate;
    this.weekLabel = `${s.getDate()} ${months[s.getMonth()]} → ${e.getDate()} ${months[e.getMonth()]}`;
  }

  prevWeek(): void {
    const prev = new Date(this.weekStart);
    prev.setDate(prev.getDate() - 6);
    this.weekChanged.emit(prev);
  }

  nextWeek(): void {
    const next = new Date(this.weekStart);
    next.setDate(next.getDate() + 6);
    this.weekChanged.emit(next);
  }

  getEvents(dayIdx: number, slotHour: number): CalendarEvent[] {
    return this.events.filter(
      e => e.dayIndex === dayIdx && Math.floor(e.startHour) === slotHour
    );
  }

  getTopOffset(slotHour: number, startHour: number): number {
    return (startHour - slotHour) * this.rowHeight;
  }

  getEventHeight(start: number, end: number): number {
    return Math.max((end - start) * this.rowHeight - 4, 28);
  }

  formatEventTime(start: number, end: number): string {
    return `${this.hourToString(start)} – ${this.hourToString(end)}`;
  }

  private hourToString(hour: number): string {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const display = h > 12 ? h - 12 : h;
    return `${display}:${m === 0 ? '00' : m} ${suffix}`;
  }
}
