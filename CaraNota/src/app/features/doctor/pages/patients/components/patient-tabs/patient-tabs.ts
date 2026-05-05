import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientViewModel, PatientAppointment, Medication } from '../../../../../../core/models/patient.model';

type Tab = 'overview' | 'medication' | 'appointment' | 'summarization';

@Component({
  selector: 'app-patient-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-tabs.html',
  styleUrls: ['./patient-tabs.css'],
})
export class PatientTabs {
  @Input() patient!: PatientViewModel;
  @Input() appointments: PatientAppointment[] = [];
  @Input() medications: Medication[] = [];

  activeTab: Tab = 'overview';

  tabs: { key: Tab; label: string }[] = [
    { key: 'overview',      label: 'Overview'      },
    { key: 'medication',    label: 'Medication'    },
    { key: 'appointment',   label: 'Appointment'   },
    { key: 'summarization', label: 'Summarization' },
  ];

  setTab(tab: Tab): void {
    this.activeTab = tab;
  }
}
