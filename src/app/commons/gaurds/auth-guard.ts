import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Auth } from '../../services/auth';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  console.log(' state.url', state.url,  { queryParams: { returnUrl: state.url }});
  
  // Store return URL in query params
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};