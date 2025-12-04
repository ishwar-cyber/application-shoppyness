import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '../../services/auth';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 🔒 SSR safe
  if (!isPlatformBrowser(platformId)) {
    return true; // Allow SSR to render the page
  }

  // 🔒 Browser logic
  if (authService.isLoggedIn()) {
    return true;
  }

  // Browser-only redirect
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
