// auth-interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const cookieService = inject(CookieService);
  const router = inject(Router);

  let headers: Record<string, string> = {};

  // ✅ Only run cookie logic in the browser
  if (isPlatformBrowser(platformId)) {
    const visitorId = cookieService.get('visitorId');
    const authToken = cookieService.get('authToken');

    if (visitorId) {
      headers['X-Visitor-ID'] = visitorId;
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
  }

  // Always include withCredentials so cookies can flow in requests
  const cloned = Object.keys(headers).length
    ? req.clone({ setHeaders: headers, withCredentials: true })
    : req.clone({ withCredentials: true });

  // ✅ Handle errors only in browser
  return next(cloned).pipe(
    catchError((error: unknown) => {
      if (isPlatformBrowser(platformId) && error instanceof HttpErrorResponse) {
        if (error.status === 401 || error.status === 403) {
          // Remove invalid token
          cookieService.delete('authToken', '/');

          // Redirect to login (if not already there)
          if (router.url !== '/login') {
            router.navigate(['/login']);
          }
        }
      }
      return throwError(() => error);
    })
  );
};
