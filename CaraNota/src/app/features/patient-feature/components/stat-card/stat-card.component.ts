// src/app/features/patient/components/stat-card/stat-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent {
  @Input() label  = '';
  @Input() value: string | number = '';
  @Input() sub    = '';   // e.g. "Last visit 2026-02-05"
}
