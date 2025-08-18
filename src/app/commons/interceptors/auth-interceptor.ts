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
  const token = cookiesService.get('authToken');
  
  if(token){
    authService.isLoggedIn.set(true);
  }
  // Clone request to add Authorization header
  
const authReq = req.clone({
  withCredentials: true,
  setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
});
  
return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        cookiesService.delete('authToken');
        router.navigate(['/login']);
      } else if (error instanceof Error) {
        console.error("General Error:", error.message);
      } else {
        console.error("Unknown Error:", error);
      }

      return throwError(() => error);
    })
  );
};

