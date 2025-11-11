import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  
  private readonly http = inject(HttpClient);

  createOrder(payload: any):Observable<void>{
    return this.http.post<any>(`${environment.apiUrl}/order/create-order`, payload)
  }

  updateAddress(userId: string, addressData: any): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/update-user/${userId}`, addressData);
  }
}
