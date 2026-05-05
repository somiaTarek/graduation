// src/app/features/patient/models/reminder.model.ts
//
// Reminders are a FRONTEND-ONLY concept — the CareNota API has no /reminders
// endpoint. They are derived from:
//   - Prescriptions  → medication reminders  (type: 'medication')
//   - Appointments   → appointment reminders (type: 'appointment')
//   - User-created   → health reminders      (type: 'health')
//
// We persist user toggles (active/inactive) in localStorage under the key
// "carenota_reminders" so state survives page refreshes.

export type ReminderType = 'medication' | 'appointment' | 'health';

export interface Reminder {
  /** Unique stable key — used for localStorage persistence */
  id: string;

  type: ReminderType;

  /** Display title — e.g. "Take Loratadine" */
  title: string;

  /** Subtitle line — e.g. "10mg · Once daily" */
  subtitle: string;

  /** Time string for display — e.g. "08:00 AM" */
  time: string;

  /** Recurrence label — e.g. "Daily", "Weekly" or a date string */
  recurrence: string;

  /** Whether the reminder is currently active */
  isActive: boolean;

  // ── Optional fields for richer display ───────────────────────────────────

  /** ISO date string — used for appointment reminders */
  date?: string;

  /** Source IDs — used to deep-link back to the API resource */
  sourceId?: number;          // prescriptionId or appointmentId
}

// ── Filter tab type ───────────────────────────────────────────────────────────
export type ReminderFilter = 'all' | 'medication' | 'appointment' | 'health';

// ── Persistence helpers ───────────────────────────────────────────────────────
const STORAGE_KEY = 'carenota_reminders';

export function loadReminderStates(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveReminderState(id: string, isActive: boolean): void {
  const states = loadReminderStates();
  states[id] = isActive;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
}
