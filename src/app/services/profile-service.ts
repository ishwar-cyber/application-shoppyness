import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  
  private http = inject(HttpClient);
  apiBase = `${environment.apiUrl}`;
  getUserProfile(id: string) {
    return this.http.get(`${this.apiBase}/users/${id}`);
  }

  getUserOrders() {
    return this.http.get(`${this.apiBase}/order/user/${sessionStorage.getItem('userId')}`);
  }
}
