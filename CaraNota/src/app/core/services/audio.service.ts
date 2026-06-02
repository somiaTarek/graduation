// core/services/audio.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// Covers /api/audio endpoints.
//
// CHANGES vs previous version:
//   ✅ Both endpoints now confirmed in final swagger (were missing before)
//   ✅ Uses API constants
//   ✅ AudioStatusDto — status field shape clarified
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AudioRecordResponseDto, AudioStatusDto } from '../models/appointment.model';
import { API } from '../constants/api';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private http = inject(HttpClient);

  // POST /api/audio/upload  — multipart/form-data
  // Fields: AudioFile (binary), VisitId (int)
  // Call this after creating a Visit to start AI transcription.
  uploadAudio(audioBlob: Blob, visitId: number): Observable<AudioRecordResponseDto> {
    const form = new FormData();
    form.append('AudioFile', audioBlob, `visit-${visitId}.webm`);
    form.append('VisitId', String(visitId));
    return this.http.post<AudioRecordResponseDto>(API.AUDIO.UPLOAD, form);
  }

  // GET /api/audio/{visitId}/status
  // Poll this after upload until status === 'Completed' or 'Failed'.
  // Suggested polling interval: 5–10 seconds.
  // Possible status values: 'Pending' | 'Processing' | 'Completed' | 'Failed'
  getStatus(visitId: number): Observable<AudioStatusDto> {
    return this.http.get<AudioStatusDto>(API.AUDIO.STATUS(visitId));
  }
}
