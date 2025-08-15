import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
interface Login {
  email: string,
  password: string
}
@Injectable({
  providedIn: 'root'
})
export class Auth {

  BASE_URL = `${environment.apiUrl}/auth/sign-in`;
  isLoggedIn = signal<boolean>(false);
  private readonly http =inject(HttpClient);

  login(payload: Login){
    return this.http.post(`${this.BASE_URL}/user`, payload);
  }
}
