export interface Visit {
  visitId: number;
  visitDate: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  appointmentID: number;
}

export interface CreateVisitDto {
  visitDate: string;          // ISO 8601 UTC — send current time
  appointmentID: number;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}
