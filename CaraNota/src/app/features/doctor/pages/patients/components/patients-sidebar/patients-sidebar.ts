// patients-sidebar.ts
// ─────────────────────────────────────────────────────────────────────────────
// CHANGES vs your original:
//   - Patient → PatientViewModel
//   - selectedPatientId: string → number  (API IDs are numbers)
//   - Search: p.id.toLowerCase() → p.fullName check only, or p.id.toString()
//     WHY: calling .toLowerCase() on a number crashes at runtime
//   - Search now also checks fullName (not "name") — field renamed in model
// ─────────────────────────────────────────────────────────────────────────────

import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientViewModel } from '../../../../../../core/models/patient.model';

@Component({
  selector: 'app-patients-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patients-sidebar.html',
  styleUrl: './patients-sidebar.css',
})
export class PatientsSidebar implements OnInit, OnChanges {
  @Input() patients: PatientViewModel[] = [];
  @Input() selectedPatientId: number = 0;   // ✅ FIXED: was string, API returns number
  @Output() patientSelected = new EventEmitter<PatientViewModel>();

  searchQuery = '';
  filteredPatients: PatientViewModel[] = [];

  ngOnInit(): void    { this.filteredPatients = this.patients; }
  ngOnChanges(): void { this.filteredPatients = this.patients; this.onSearch(); }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredPatients = this.patients;
      return;
    }
    this.filteredPatients = this.patients.filter(p =>
      // ✅ FIXED: search on fullName (not "name") and safe id.toString() (not id.toLowerCase())
      p.fullName.toLowerCase().includes(q) ||
      p.id.toString().includes(q)
    );
  }

  selectPatient(patient: PatientViewModel): void {
    this.patientSelected.emit(patient);
  }
}
