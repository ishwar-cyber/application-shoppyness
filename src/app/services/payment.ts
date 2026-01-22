import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { CreateOrder } from '../commons/models/payments.model';
interface CreateOrderResponse {
  paymentSessionId: string;
  orderNumber: string;
  // add other fields your backend sends
}
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  
  private baseUrl = `${environment.apiUrl}/order`;

  constructor(private http: HttpClient) {}

  /** STEP 1: Create Cashfree order (Backend) */
  createOrder(payload: CreateOrder): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(
      `${this.baseUrl}/create-order`,
      payload
    );
  }

  /** STEP 2: Verify payment (Backend) */
  verifyPayment(orderId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify`, { orderId });
  }
}
