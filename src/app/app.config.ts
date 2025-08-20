import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAppInitializer } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { provideToastr } from 'ngx-toastr';
import { CartService } from './services/cart';
import { firstValueFrom } from 'rxjs':
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { authInterceptor } from './commons/interceptors/auth-interceptor';
import { isPlatformBrowser } from '@angular/common';
// ✅ Startup function
function loadCartOnInit() {
  const http = inject(HttpClient);
  const cartService = inject(CartService);

  return () =>
    firstValueFrom(
      http.get('https://your-api.com/api/v1/cart', { withCredentials: true }).pipe(
        tap((cart: any) => {
          cartService.setCart(cart); // store in signals/store
        })
      )
    );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient( withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
    CookieService,
    // ✅ New Angular 20 way
    provideAppInitializer(loadCartOnInit),
  ],
  ]
};

