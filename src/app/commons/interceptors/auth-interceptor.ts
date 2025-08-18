// auth.interceptor.ts
import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Auth } from '../../services/auth';
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const cookiesService = inject(CookieService);
  const authService = inject(Auth);

  // Get token from localStorage (or any storage service)
    let headers: Record<string, string> = {};

    // 1. Add visitorId from cookie
    const visitorId = this.cookieService.get('visitorId');
    if (visitorId) {
      headers['X-Visitor-ID'] = visitorId;
    }

    // 2. Add JWT token from cookie/localStorage
    const authToken = this.cookieService.get('authToken') || localStorage.getItem('authToken');
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Clone request with extra headers
    if (Object.keys(headers).length > 0) {
      request = request.clone({ setHeaders: headers });
    }

    return next.handle(request);
  };

