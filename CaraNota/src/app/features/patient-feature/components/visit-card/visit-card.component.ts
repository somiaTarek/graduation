// src/app/features/patient/components/visit-card/visit-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface VisitCardData {
  id: number;
  doctorName: string;
  specialty: string;
  visitDate: string;          // ISO string
  visitTime?: string;         // ISO string (from startTime of linked appointment)
  appointmentType?: string;   // e.g. "Follow-up", "Annual Physical"
  summary?: string;           // subjective field from SOAP note
  medications?: string[];     // medication names for display chips
  followUpDate?: string;      // from plan field
  labTests?: string[];        // lab test names
  status?: string;            // "Completed" | "Scheduled"
}

@Component({
  selector: 'app-visit-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './visit-card.component.html',
})
export class VisitCardComponent {
  @Input({ required: true }) visit!: VisitCardData;

  /** Emits when "View Details" is clicked */
  @Output() viewDetails = new EventEmitter<number>();

  get typeClass(): string {
    const map: Record<string, string> = {
      'Follow-up':       'bg-green-100 text-green-700',
      'Annual Physical': 'bg-blue-100  text-blue-700',
      'Consultation':    'bg-purple-100 text-purple-700',
      'Check-up':        'bg-teal-100  text-teal-700',
      'Emergency':       'bg-red-100   text-red-700',
    };
    return map[this.visit.appointmentType ?? ''] ?? 'bg-gray-100 text-gray-600';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-CA');  // YYYY-MM-DD
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
