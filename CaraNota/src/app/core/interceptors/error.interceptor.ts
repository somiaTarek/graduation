// core/interceptors/error.interceptor.ts
// ─────────────────────────────────────────────────────────────────────────────
// FIX: guard against 401 loop.
// Previously: any 401 (including from the /Revoke call itself) triggered logout
// again, causing an infinite loop.
// Now: we skip logout if the failing request IS the revoke or refresh endpoint.
// ─────────────────────────────────────────────────────────────────────────────

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthEndpoint =
        req.url.includes('/Auth/Revoke') ||
        req.url.includes('/Auth/Refresh');

      if (err.status === 401 && !isAuthEndpoint) {
        auth.logout();
      }

      return throwError(() => err);
    })
  );
};
