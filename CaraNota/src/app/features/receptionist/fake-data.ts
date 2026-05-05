// src/app/features/receptionist/fake-data.ts
// ─────────────────────────────────────────────────────────────────────────────
// All fake data lives here. To switch to real backend:
//   1. Set USE_FAKE_DATA = false  in this file
//   2. Delete this file
//   3. Remove the import from receptionist-dashboard.ts and new-appointment.ts
// ─────────────────────────────────────────────────────────────────────────────
import { Appointment } from '../../core/models/appointment.model';
import { Doctor } from '../../core/models/appointment.model';
import { TimeSlot } from '../../core/models/appointment.model';

export const USE_FAKE_DATA = true;

// ── Helpers ──────────────────────────────────────────────────────────────────
function todayAt(h: number, m = 0): string {
  const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString();
}
function slotAt(date: Date, h: number, m = 0): string {
  const d = new Date(date); d.setHours(h, m, 0, 0); return d.toISOString();
}

// ── In-memory store (mutations like cancel/create are reflected immediately) ──
let _appointments: Appointment[] = [
  { appointmentID: 1,  startTime: todayAt(9, 0),   endTime: todayAt(9, 30),  status: 'Completed',  appointmentType: 'Follow-up',    createdAt: todayAt(8), patientID: 12345, patientName: 'Daniel Wilson',   doctorID: 1, doctorName: 'Dr. Sarah Hassan', receptionistID: 5 },
  { appointmentID: 2,  startTime: todayAt(9, 30),  endTime: todayAt(10, 0),  status: 'Completed',  appointmentType: 'New Visit',    createdAt: todayAt(8), patientID: 12346, patientName: 'Matthew Thomas',  doctorID: 1, doctorName: 'Dr. Sarah Hassan', receptionistID: 5 },
  { appointmentID: 3,  startTime: todayAt(10, 0),  endTime: todayAt(10, 30), status: 'Cancelled',  appointmentType: 'New Visit',    createdAt: todayAt(8), patientID: 12347, patientName: 'Olivia Martinez', doctorID: 2, doctorName: 'Dr. Ahmed Karim',  receptionistID: 5 },
  { appointmentID: 4,  startTime: todayAt(10, 30), endTime: todayAt(11, 0),  status: 'Scheduled',  appointmentType: 'Follow-up',    createdAt: todayAt(8), patientID: 12348, patientName: 'Sarah Johnson',   doctorID: 1, doctorName: 'Dr. Sarah Hassan', receptionistID: 5 },
  { appointmentID: 5,  startTime: todayAt(11, 0),  endTime: todayAt(11, 30), status: 'Scheduled',  appointmentType: 'Follow-up',    createdAt: todayAt(8), patientID: 12349, patientName: 'Ava Harris',      doctorID: 2, doctorName: 'Dr. Ahmed Karim',  receptionistID: 5 },
  { appointmentID: 6,  startTime: todayAt(11, 30), endTime: todayAt(12, 0),  status: 'Scheduled',  appointmentType: 'Follow-up',    createdAt: todayAt(8), patientID: 12337, patientName: 'Ryan Walker',     doctorID: 1, doctorName: 'Dr. Sarah Hassan', receptionistID: 5 },
  { appointmentID: 7,  startTime: todayAt(12, 0),  endTime: todayAt(12, 30), status: 'Cancelled',  appointmentType: 'Consultation', createdAt: todayAt(8), patientID: 12326, patientName: 'Anna Walker',     doctorID: 3, doctorName: 'Dr. Mona Saleh',   receptionistID: 5 },
  { appointmentID: 8,  startTime: todayAt(12, 30), endTime: todayAt(13, 0),  status: 'Scheduled',  appointmentType: 'New Visit',    createdAt: todayAt(8), patientID: 12379, patientName: 'Andrew Hall',     doctorID: 2, doctorName: 'Dr. Ahmed Karim',  receptionistID: 5 },
  { appointmentID: 9,  startTime: todayAt(13, 0),  endTime: todayAt(13, 30), status: 'Scheduled',  appointmentType: 'Consultation', createdAt: todayAt(8), patientID: 12367, patientName: 'Natalie Young',   doctorID: 3, doctorName: 'Dr. Mona Saleh',   receptionistID: 5 },
];
let _nextId = 100;

// ── Appointments ─────────────────────────────────────────────────────────────

export function fakeGetByDateRange(from: Date, to: Date): Appointment[] {
  return _appointments.filter(a => {
    const t = new Date(a.startTime).getTime();
    return t >= from.getTime() && t <= to.getTime();
  });
}

export function fakeCancel(id: number): void {
  _appointments = _appointments.map(a =>
    a.appointmentID === id ? { ...a, status: 'Cancelled' as const } : a
  );
}

export function fakeCreate(appt: Omit<Appointment, 'appointmentID' | 'createdAt'>): Appointment {
  const newAppt: Appointment = {
    ...appt,
    appointmentID: _nextId++,
    createdAt: new Date().toISOString(),
  };
  _appointments = [..._appointments, newAppt];
  return newAppt;
}

// ── Doctors ───────────────────────────────────────────────────────────────────

export const FAKE_DOCTORS: Doctor[] = [
  { id: 1, fullName: 'Dr. Sarah Hassan', email: 'sarah@carenota.com', specialty: 'Cardiology' },
  { id: 2, fullName: 'Dr. Ahmed Karim',  email: 'ahmed@carenota.com', specialty: 'Dermatology' },
  { id: 3, fullName: 'Dr. Mona Saleh',   email: 'mona@carenota.com',  specialty: 'Pediatrics' },
];

// ── Patients (for name-search in booking form) ────────────────────────────────
export interface FakePatient { id: number; fullName: string; }

export const FAKE_PATIENTS: FakePatient[] = [
  { id: 12345, fullName: 'Daniel Wilson' },
  { id: 12346, fullName: 'Matthew Thomas' },
  { id: 12347, fullName: 'Olivia Martinez' },
  { id: 12348, fullName: 'Sarah Johnson' },
  { id: 12349, fullName: 'Ava Harris' },
  { id: 12337, fullName: 'Ryan Walker' },
  { id: 12326, fullName: 'Anna Walker' },
  { id: 12379, fullName: 'Andrew Hall' },
  { id: 12367, fullName: 'Natalie Young' },
  { id: 10001, fullName: 'Ahmed Hassan' },
  { id: 10002, fullName: 'Mariam Youssef' },
  { id: 10003, fullName: 'Tarek Mostafa' },
];

// ── Slots ─────────────────────────────────────────────────────────────────────

export function fakeGetSlots(doctorId: number, date: Date): TimeSlot[] {
  const booked = _appointments
    .filter(a => a.doctorID === doctorId && a.status !== 'Cancelled')
    .map(a => new Date(a.startTime).toISOString());

  const all: TimeSlot[] = [
    { start: slotAt(date, 9, 0),   end: slotAt(date, 9, 30) },
    { start: slotAt(date, 9, 30),  end: slotAt(date, 10, 0) },
    { start: slotAt(date, 10, 0),  end: slotAt(date, 10, 30) },
    { start: slotAt(date, 10, 30), end: slotAt(date, 11, 0) },
    { start: slotAt(date, 11, 0),  end: slotAt(date, 11, 30) },
    { start: slotAt(date, 11, 30), end: slotAt(date, 12, 0) },
    { start: slotAt(date, 14, 0),  end: slotAt(date, 14, 30) },
    { start: slotAt(date, 14, 30), end: slotAt(date, 15, 0) },
    { start: slotAt(date, 15, 0),  end: slotAt(date, 15, 30) },
    { start: slotAt(date, 15, 30), end: slotAt(date, 16, 0) },
  ];

  return all.filter(s => !booked.includes(s.start));
}
