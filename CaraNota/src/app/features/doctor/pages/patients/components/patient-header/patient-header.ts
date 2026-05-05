import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
// ✅ FIXED: use PatientViewModel class (has getters like initials, allergyList)
//           NOT the Patient interface (which only has raw fields)
import { PatientViewModel } from '../../../../../../core/models/patient.model';

@Component({
  selector: 'app-patient-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-header.html',
  styleUrl: './patient-header.css',
})
export class PatientHeader {
  @Input() patient!: PatientViewModel;
}
