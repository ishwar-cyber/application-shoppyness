import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';
import { cartSignal } from '../commons/store';

@Injectable({
  providedIn: 'root'
})
export class Cart {
  
  API_URL = `${environment.apiUrl}/cart`
  private readonly http = inject(HttpClient);
  addToCart(payload: any) {
     return this.http.post<{count: number}>(`${this.API_URL}`, payload,{ withCredentials: true})
      .pipe(
        tap((response: any) => {
          // Update the cart count from API response
         cartSignal.set(response.data.itemCount);
         sessionStorage.setItem('visitorId',response.data.visitorId);
        })
      );
  }


  increaseQuantity(productId: string, quantity = -1){
    
  }

  decreaseQuantity(productId: string, quantity = 1) {
   
  }
}
