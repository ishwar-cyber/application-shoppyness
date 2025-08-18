import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CredentialsInterceptor } from './commons/interceptors/http-interceptor';
import { CookieService } from 'ngx-cookie-service';
import { provideToastr } from 'ngx-toastr';
import { CartService } from './services/cart';
import { authInterceptor } from './commons/interceptors/auth-interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([authInterceptor,CredentialsInterceptor])),
    provideHttpClient(withFetch(), {withCredentials: true}),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
    CookieService,
    {
      provide: APP_INITIALIZER,
      useFactory: (cartService: CartService) => () => cartService.loadCart(),
      deps: [CartService],
      multi: true
    }
  ]
};

