import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';

interface Login {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  BASE_URL = `${environment.apiUrl}/auth`;

  // 🔹 Reactive signals
  userName = signal<string>('');
  isLoggedInSignal = signal<boolean>(false);
  userId = signal<string>('');

  // 🔹 Injected dependencies
  private readonly http = inject(HttpClient);
  private readonly cookiesService = inject(CookieService);
  private readonly platformId = inject(PLATFORM_ID) as Object;

  constructor() {
    // Sync the signal with actual cookie status on service initialization
    this.updateLoginStatus();
  }

  // 🔹 Method: check login status from cookies
  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.cookiesService.get('authToken');
      return !!token;
    }
    return false;
  }

  // 🔹 Update reactive signal
  updateLoginStatus(): void {
    this.isLoggedInSignal.set(this.isLoggedIn());
  }

  // 🔹 Login API
  login(payload: Login) {
    return this.http.post(`${this.BASE_URL}/sign-in/user`, payload,);
  }

  // 🔹 Merge visitor cart to logged-in user
  mergeCartToUser(visitorId: { visitorId: string }) {
    return this.http.post(`${this.BASE_URL}/merge-cart`, visitorId,);
  }

  // 🔹 Signup API
  signUp(payload: any) {
    return this.http.post(`${this.BASE_URL}/sign-up`, payload,);
  }

  // 🔹 Logout helper
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cookiesService.deleteAll();
      this.updateLoginStatus();
    }
  }
}
