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

  getOrderById(userId: string, orderId: any) {
    return this.http.get(`${this.apiBase}/order/${orderId}/tracking`);
  }

  getUserOrdersNew(page: number, limit = 10) {
    return this.http.get<any>(
      `${this.apiBase}/order/user/${sessionStorage.getItem('userId')}?page=${page}&limit=${limit}`
    );
  }

  cancelOrder(orderId: string, reason: object){
    return this.http.put(`${this.apiBase}/order/${orderId}/cancelled`, reason)
  }
}
