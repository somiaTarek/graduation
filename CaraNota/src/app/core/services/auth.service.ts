// core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RawLoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserRole,
} from '../models/user';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY   = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly USER_KEY    = 'cn_user';

  private currentUserSubject = new BehaviorSubject<LoginResponse['user'] | null>(
    this.getUserFromStorage()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  // ─── Authentication API Calls ─────────────────────────────────────────

  login(payload: LoginRequest): Observable<RawLoginResponse> {
    return this.http
      .post<RawLoginResponse>(`${environment.apiUrl}/Api/Auth/Login`, payload)
      .pipe(
        tap((res) => {
          console.log('Raw login response:', res); // 👈 Check this in console
          const normalized = this.normalizeLoginResponse(res);
          console.log('Normalized:', normalized);  // 👈 And this
          this.setSession(normalized);
          this.currentUserSubject.next(normalized.user);
        })
      );
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${environment.apiUrl}/Api/Auth/Register`,
      payload
    );
  }

  refreshToken(): Observable<RawLoginResponse> {
    const accessToken  = this.getToken();
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);

    return this.http
      .post<RawLoginResponse>(`${environment.apiUrl}/Api/Auth/Refresh`, {
        accessToken,
        refreshToken,
      })
      .pipe(
        tap((res) => {
          const normalized = this.normalizeLoginResponse(res);
          this.setSession(normalized);
          this.currentUserSubject.next(normalized.user);
        })
      );
  }

  logout(): void {
    this.http
      .post(`${environment.apiUrl}/Api/Auth/Revoke`, {})
      .subscribe({ error: () => {} });

    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  // ─── Response Normalization ───────────────────────────────────────────

  /**
   * Converts whatever shape the .NET backend returns
   * into the consistent LoginResponse shape your app uses.
   */
  private normalizeLoginResponse(raw: RawLoginResponse): LoginResponse {
    // ── Token: try 'token' first, then 'accessToken'
    const token = raw.token ?? raw.accessToken ?? '';

    // ── Refresh token
    const refreshToken = raw.refreshToken ?? raw.refresh_token ?? '';

    // ── User: try nested object first, then flat fields at root
    const rawUser = raw.user;

    const user: LoginResponse['user'] = {
      id:    String(rawUser?.id ?? rawUser?.userId ?? raw.userId ?? raw.id ?? ''),
      name:  rawUser?.name ?? rawUser?.fullName ?? rawUser?.userName
             ?? raw.name ?? raw.fullName ?? raw.userName ?? '',
      email: rawUser?.email ?? raw.email ?? '',
      role:  (rawUser?.role ?? raw.role ?? 'patient') as UserRole,
    };

    return { token, refreshToken, user };
  }

  // ─── Token Management ─────────────────────────────────────────────────

  private setSession(authResult: LoginResponse): void {
    if (authResult?.token && authResult.token !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, authResult.token);
    } else {
      console.warn('setSession: token is missing or undefined', authResult);
    }

    if (authResult?.refreshToken && authResult.refreshToken !== 'undefined') {
      localStorage.setItem(this.REFRESH_KEY, authResult.refreshToken);
    }

    if (authResult?.user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('doctor_id');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token && token !== 'undefined' ? token : null;
  }

  private decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const base64Payload = token.split('.')[1];
      return JSON.parse(atob(base64Payload)) as JwtPayload;
    } catch {
      return null;
    }
  }

  // ─── State & Authorization ────────────────────────────────────────────

  isLoggedIn(): boolean {
    const payload = this.decodeToken();
    if (!payload) return false;
    return payload.exp * 1000 > Date.now();
  }

  getCurrentRole(): UserRole | null {
    return this.currentUserSubject.value?.role ?? this.decodeToken()?.role ?? null;
  }

  getUserId(): number | null {
    const payload = this.decodeToken();
    return payload ? parseInt(payload.sub, 10) : null;
  }

  getReceptionistId(): number | null {
    return this.getUserId();
  }

  getDoctorId(): number | null {
    const val = localStorage.getItem('doctor_id');
    return val ? parseInt(val, 10) : null;
  }

  getPatientId(): number | null {
    return this.getUserId();
  }

  saveDoctorId(doctorId: number): void {
    localStorage.setItem('doctor_id', doctorId.toString());
  }

  redirectByRole(role: UserRole): void {
    const routes: Record<UserRole, string> = {
      doctor:       '/doctor/dashboard',
      patient:      '/patient/dashboard',
      receptionist: '/receptionist/dashboard',
    };
    this.router.navigate([routes[role]]);
  }

  private getUserFromStorage(): LoginResponse['user'] | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }
}
