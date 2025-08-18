import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  let headers: Record<string, string> = {};

  // 1. Add visitorId from cookies
  const visitorId = cookieService.get('visitorId');
  if (visitorId) {
    headers['X-Visitor-ID'] = visitorId;
  }

  // 2. Add JWT token
  const authToken = cookieService.get('authToken') || localStorage.getItem('authToken');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const cloned = Object.keys(headers).length > 0 ? req.clone({ setHeaders: headers }) : req;

  // 3. Handle response & errors
  return next(cloned).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 || error.status === 403) {
          // Remove invalid token
          cookieService.delete('authToken');
          localStorage.removeItem('authToken');

          // Redirect to login
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
