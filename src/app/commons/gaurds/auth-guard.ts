import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '../../services/auth';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // ✅ SSR-safe: Only check login in the browser
  // if (isPlatformBrowser(platformId)) {
    if (authService.isLoggedIn()) {
      return true;
    } 
    console.log('router.url', router.url);
    
    router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
    return false;
  // }
};  