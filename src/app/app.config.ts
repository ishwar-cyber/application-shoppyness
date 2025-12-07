import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { provideToastr } from 'ngx-toastr';
import { CartService } from './services/cart';
import { authInterceptor } from './commons/interceptors/auth-interceptor';

export function appLoadCard(cartService:CartService){
  return ()=> cartService.loadCart();
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
    CartService,
    // ✅ New Angular 20 way
    {
      provide: APP_INITIALIZER,
      useFactory: appLoadCard,
      deps:[CartService],
      multi: true
    }
],
}

