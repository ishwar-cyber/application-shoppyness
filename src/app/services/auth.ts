import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
interface Login {
  email: string,
  password: string
}
@Injectable({
  providedIn: 'root'
})
export class Auth {

  BASE_URL = `${environment.apiUrl}/auth`;
  isLoggedIn = signal<boolean>(false);
  userName = signal<string>('')
  private readonly http =inject(HttpClient);
  private readonly cookiesService = inject(CookieService);

  login(payload: Login){
     return this.http.post(`${this.BASE_URL}/sign-in/user`, payload);
  }

  margeCartToUser(visitorId:{ visitorId: string}){
      return this.http.post(`${this.BASE_URL}/marge-cart`, visitorId);
  }
  signUp(payload: any){
    return this.http.post(`${this.BASE_URL}/sign-up`, payload);
  }
}
