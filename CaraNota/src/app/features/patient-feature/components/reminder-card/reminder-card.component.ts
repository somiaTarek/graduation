// src/app/features/patient/components/reminder-card/reminder-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reminder, ReminderType } from '../../models/reminder.model';

@Component({
  selector: 'app-reminder-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reminder-card.component.html',
})
export class ReminderCardComponent {
  @Input({ required: true }) reminder!: Reminder;

  /** Emits when the toggle switch is clicked */
  @Output() toggled = new EventEmitter<Reminder>();

  /** Emits when the edit pencil is clicked */
  @Output() edited = new EventEmitter<Reminder>();

  get iconBgClass(): string {
    const map: Record<ReminderType, string> = {
      medication:   'bg-blue-100',
      appointment:  'bg-blue-100',
      health:       'bg-red-100',
    };
    return map[this.reminder.type];
  }

  get iconColorClass(): string {
    const map: Record<ReminderType, string> = {
      medication:   'text-blue-600',
      appointment:  'text-blue-600',
      health:       'text-red-500',
    };
    return map[this.reminder.type];
  }
}
