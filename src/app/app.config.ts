import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './commons/interceptors/auth-interceptor';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { productReducer } from './store/products/products.reducer';
import { ProductsEffect } from './store/products/products.effects';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
    CookieService,
    provideStore({
      products: productReducer
    }),
    provideEffects([
      ProductsEffect
    ]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
],
}

