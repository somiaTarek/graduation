// src/app/features/doctor/pages/visit-summary/visit-summary.ts
// ─────────────────────────────────────────────────────────────────────────────
// All DoctorSummaryDto + PatientSummaryDto fields are now editable via
// the shared inline-edit modal. PDF export uses jsPDF + html2canvas from
// npm (not CDN window globals) to avoid "html2canvas is not a function" errors.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Component, inject, signal, OnInit, OnDestroy, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DoctorNavbar }    from '../../../../layout/doctor-layout/doctor-navbar/doctor-navbar';
import { SummaryService }  from '../../../../core/services/summary.service';

import {
  VisitSummaryResponseDto,
  EditSummaryDto,
  PatientSummaryViewDto,
} from '../../../../core/models/visit.model';

type PageState =
  | 'loading'
  | 'ready'
  | 'editing'
  | 'saving'
  | 'approving'
  | 'approved'
  | 'error';

// All editable fields across both doctor + patient summaries
type EditableField =
  // Doctor summary fields
  | 'subjective'
  | 'objective'
  | 'assessment'
  | 'plan'
  | 'comparisonWithPreviousVisit'
  // Patient summary fields
  | 'diagnosis'
  | 'symptoms'
  | 'treatmentPlan'
  | 'whenToSeekHelp'
  | 'followUp';

@Component({
  selector: 'app-visit-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DoctorNavbar],
  templateUrl: './visit-summary.html',
  styleUrl:    './visit-summary.css',
})
export class VisitSummary implements OnInit, OnDestroy {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private summaryService = inject(SummaryService);

  // ── Core state ─────────────────────────────────────────────────────────────
  visitId     = signal<number>(0);
  pageState   = signal<PageState>('loading');
  errorMsg    = signal<string | null>(null);
  isManualMode = signal(false);

  summary     = signal<VisitSummaryResponseDto | null>(null);

  // Approval
  docApproved  = signal(false);
  patApproved  = signal(false);

  bothApproved = computed(() => this.docApproved() && this.patApproved());

  // Inline edit
  editingField = signal<EditableField | null>(null);
  editLabel    = signal<string>('');
  editDraft    = signal<string>('');

  // PDF export
  isExporting  = signal(false);

  // Patient info from router state
  patientName  = signal<string>('');

  // ── Rating ─────────────────────────────────────────────────────────────────
  selectedRating = signal<number>(0);
  ratingHover    = signal<number>(0);
  ratingFeedback = signal<string>('');
  ratingError    = signal<string | null>(null);
  ratingState    = signal<'idle' | 'submitting' | 'done' | 'submitted'>('idle');

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('visitId'));
    this.visitId.set(id);

    const state = history.state as any;
    if (state?.patient?.name) this.patientName.set(state.patient.name);

    if (state?.skipPolling === true) {
      this.isManualMode.set(true);
      this.pageState.set('ready');
      this.tryLoadExistingSummary();
    } else {
      this.loadSummary();
    }
  }

  ngOnDestroy(): void {}

  // ── Load helpers ───────────────────────────────────────────────────────────
  private tryLoadExistingSummary(): void {
    this.summaryService.getSummary(this.visitId()).subscribe({
      next: (data) => {
        this.summary.set(data);
        if (data.isApproved) {
          this.docApproved.set(true);
          this.patApproved.set(true);
          this.pageState.set('approved');
        } else {
          this.pageState.set('ready');
        }
      },
      error: () => { this.pageState.set('ready'); },
    });
  }

  private loadSummary(): void {
    this.pageState.set('loading');
    this.summaryService.getSummary(this.visitId()).subscribe({
      next: (data) => {
        this.summary.set(data);
        if (data.isApproved) {
          this.docApproved.set(true);
          this.patApproved.set(true);
          this.pageState.set('approved');
        } else {
          this.pageState.set('ready');
        }
      },
      error: (err) => {
        this.pageState.set('error');
        this.errorMsg.set(err?.error?.message ?? 'Failed to load visit summary.');
      },
    });
  }

  // ── Inline edit ────────────────────────────────────────────────────────────
  startEdit(field: EditableField, label: string, currentValue: string | undefined | null): void {
    if (this.pageState() !== 'ready') return;
    this.editingField.set(field);
    this.editLabel.set(label);
    this.editDraft.set(currentValue ?? '');
    this.pageState.set('editing');
  }

  cancelEdit(): void {
    this.editingField.set(null);
    this.editLabel.set('');
    this.editDraft.set('');
    this.pageState.set('ready');
  }

  saveEdit(): void {
    const field = this.editingField();
    const draft = this.editDraft().trim();
    if (!field) return;

    this.pageState.set('saving');

    // EditSummaryDto contains all 10 possible fields
const dto: EditSummaryDto = { [field]: draft };

    this.summaryService.editSummary(this.visitId(), dto).subscribe({
      next: () => {
        this.summary.update(s => {
          if (!s) {
            // Manual mode — bootstrap a minimal shell
            return {
              visitId: this.visitId(),
              isApproved: false,
              doctorSummary: {
                aiSummaryId: 0,
                subjective:  field === 'subjective'  ? draft : '',
                objective:   field === 'objective'   ? draft : '',
                assessment:  field === 'assessment'  ? draft : '',
                plan:        field === 'plan'        ? draft : '',
                comparisonWithPreviousVisit: field === 'comparisonWithPreviousVisit' ? draft : '',
              },
              patientSummary: {
                aiSummaryId:    0,
                diagnosis:      field === 'diagnosis'      ? draft : '',
                symptoms:       field === 'symptoms'       ? draft : '',
                treatmentPlan:  field === 'treatmentPlan'  ? draft : '',
                whenToSeekHelp: field === 'whenToSeekHelp' ? draft : '',
                followUp:       field === 'followUp'       ? draft : '',
              },
            } as VisitSummaryResponseDto;
          }

          const docFields: EditableField[] = ['subjective', 'objective', 'assessment', 'plan', 'comparisonWithPreviousVisit'];
          if (docFields.includes(field)) {
            return { ...s, doctorSummary: { ...s.doctorSummary, [field]: draft } };
          } else {
            return { ...s, patientSummary: { ...s.patientSummary, [field]: draft } };
          }
        });
        this.editingField.set(null);
        this.editLabel.set('');
        this.editDraft.set('');
        this.pageState.set('ready');
      },
      error: (err) => {
        this.pageState.set('editing');
        this.errorMsg.set(err?.error?.message ?? 'Save failed. Please try again.');
        setTimeout(() => this.errorMsg.set(null), 4000);
      },
    });
  }

  // ── Approval ───────────────────────────────────────────────────────────────
  toggleDocApproval(): void {
    if (this.pageState() === 'approved') return;
    this.docApproved.update(v => !v);
  }

  togglePatApproval(): void {
    if (this.pageState() === 'approved') return;
    this.patApproved.update(v => !v);
  }

  sendToPatient(): void {
  if (!this.bothApproved()) return;
  this.pageState.set('approving');

  this.summaryService.approveSummary(this.visitId()).subscribe({
      next: () => {
        this.pageState.set('approved');
        this.summary.update(s => s ? { ...s, isApproved: true } : s);
      },
      error: (err) => {
        this.pageState.set('ready');
        this.errorMsg.set(err?.error?.message ?? 'Approval failed. Please try again.');
        setTimeout(() => this.errorMsg.set(null), 5000);
      },
    });
  }

  // ── PDF export — uses npm jsPDF + html2canvas (no CDN window globals) ──────
  async exportPDF(): Promise<void> {
    this.isExporting.set(true);
    try {
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const html2canvas = html2canvasModule.default;
      const { jsPDF }   = jsPDFModule;

      const area = document.getElementById('pdf-export-area');
      if (!area) throw new Error('Export area not found');

      const canvas = await html2canvas(area, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const pdf   = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const imgW  = 297;
      const imgH  = (canvas.height * imgW) / canvas.width;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH);

      const safeName = this.patientName().replace(/\s+/g, '-') || 'Patient';
      pdf.save(`CareNota-Visit-${this.visitId()}-${safeName}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      this.isExporting.set(false);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  isStarActive(star: number): boolean {
    return star <= (this.ratingHover() || this.selectedRating());
  }

  skipRating(): void {
    this.selectedRating.set(0);
    this.ratingFeedback.set('');
    this.ratingError.set(null);
    this.ratingState.set('idle');
  }

  submitRating(): void {
    if (this.selectedRating() === 0) return;
    this.ratingState.set('submitting');
    this.ratingError.set(null);

    this.summaryService.rateSummary(this.visitId(), {
      rating:   this.selectedRating(),
      feedback: this.ratingFeedback(),
    }).subscribe({
      next: () => {
        this.ratingState.set('submitted');
      },
      error: (err) => {
        this.ratingState.set('idle');
        this.ratingError.set(err?.error?.message ?? 'Failed to submit rating. Please try again.');
        setTimeout(() => this.ratingError.set(null), 4000);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/doctor/today-visits']);
  }
}
