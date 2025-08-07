import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Cart {
  
  API_URL = `${environment.apiUrl}/cart`
  private readonly http = inject(HttpClient);

  addToCart(payload: any) {
    return this.http.post(this.API_URL, payload);
  }

  increaseQuantity(productId: string, quantity = -1){
    
  }

  decreaseQuantity(productId: string, quantity = 1) {
   
  }
}
