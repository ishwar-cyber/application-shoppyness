import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
interface CreateOrderResponse {
  payment_session_id: string;
  order_id: string;
  // add other fields your backend sends
}
@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  
  private http = inject(HttpClient);

  createOrder(payload: any):Observable<void>{
    return this.http.post<any>(`${environment.apiUrl}/create-order`, payload)
  }
}
