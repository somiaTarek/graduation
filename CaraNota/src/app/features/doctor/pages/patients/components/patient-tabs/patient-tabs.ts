// patient-tabs.ts
import { Component, Input, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  PatientViewModel,
  PatientAppointment,
  Medication,
  PatientVisit,
} from '../../../../../../core/models/patient.model';
import { PatientService } from '../../../../../../core/services/patient.service';

type Tab = 'overview' | 'medication' | 'appointment' | 'visits';

@Component({
  selector: 'app-patient-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-tabs.html',
  styleUrls: ['./patient-tabs.css'],
})
export class PatientTabs implements OnChanges {
  @Input() patient!: PatientViewModel;
  @Input() appointments: PatientAppointment[] = [];
  @Input() medications: Medication[] = [];

  private patientService = inject(PatientService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);  // ← add this


  activeTab: Tab = 'overview';

  visits: PatientVisit[] = [];
  visitsLoading = false;
  visitsError: string | null = null;

  tabs: { key: Tab; label: string }[] = [
    { key: 'overview',     label: 'Overview'     },
    { key: 'medication',   label: 'Medication'   },
    { key: 'appointment',  label: 'Appointment'  },
    { key: 'visits',       label: 'Visit History'},
  ];

  ngOnChanges(changes: SimpleChanges): void {
    // When the selected patient changes and the visits tab is active, reload
    if (changes['patient'] && this.activeTab === 'visits') {
      this.loadVisits();
    }
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'visits') {
      this.loadVisits();
    }
  }

  private loadVisits(): void {
    if (!this.patient?.id) return;
    this.visitsLoading = true;
    this.visitsError = null;

    this.patientService.getVisits(this.patient.id).subscribe({
      next: (list) => {
        this.visits = list.sort(
          (a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
        );
        this.visitsLoading = false;
        this.cdr.detectChanges();  // ← add this
      },
      error: (err) => {
        this.visitsError = err?.message ?? 'Failed to load visit history.';
        this.visitsLoading = false;
        this.cdr.detectChanges();  // ← add this
      },
    });
  }

  goToVisitSummary(visitId: number): void {
    this.router.navigate(['/doctor/visit-summary', visitId], {
      state: { patient: { name: this.patient.fullName, id: this.patient.id } },
    });
  }
}
