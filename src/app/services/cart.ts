import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ResponseModel {
  success: boolean
  message: string
  data: CartResponse
}
export interface CartItem {
  _id: string;         // cart item id from backend
  product: any;        // product object (id, name, price, image, etc.)
  quantity: number;
}
export interface CartResponse {
  visitorId: string
  items: Item[]
  isActive: boolean
  expiresAt?: string
  createdAt?: string
  updatedAt?: string
  itemCount?: number
  subTotal?: number
  id: string
}

export interface Item {
  product: Product
  name: string
  price: number
  discount: number
  quantity: number
  _id: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  _id: string
  name: string
  price: number
  stock: string
  id: string
}


@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;

  // Signals for cart state
  cartItems = signal<CartItem[]>([]);
  totalItems = signal<number>(0);
  totalPrice = signal<number>(0);
  cartCount = signal<number>(0);
  constructor(private http: HttpClient) {}

  /** 🛒 Load cart from backend */
 
loadCart() {
  return this.http.get<CartResponse>(`${this.apiUrl}`, {withCredentials: true}).pipe(
    tap((res: any) => {
      const newCount = res.itemCount || 0;
      this.cartCount.update(current => current + newCount);      
    })
  );
}

  /** ➕ Add item to cart */
  addToCart(productId: string, quantity: number = 1) {
    return this.http.post<ResponseModel>(`${this.apiUrl}`, { productId, quantity }).pipe(
      tap((res:ResponseModel) => {
        this.cartCount.set(res?.data?.itemCount || 0);
      }),
      catchError(err => {
        console.error('Error adding to cart:', err);
        return of(null);
      })
    );
  }

  /** ✏️ Update item quantity */
  updateQuantity(id: string, quantity: number) {    
    return this.http.put<CartResponse>(`${this.apiUrl}/update/${id}`,  { quantity }, {withCredentials: true});
     
  }

  /** ❌ Remove item from cart */
  removeFromCart(id: string) {
    return this.http.delete<ResponseModel>(`${this.apiUrl}/remove/${id}`).pipe(
      tap(res => {
        // this.cartItems.set(res.items);
        // this.totalItems.set(res.totalItems);
        // this.totalPrice.set(res.totalPrice);
      }),
      catchError(err => {
        console.error('Error removing item:', err);
        return of(null);
      })
    );
  }

  /** 🎟 Apply coupon code */
  applyCoupon(code: string, subTotal: number) {
    return this.http.post<ResponseModel>(`${this.apiUrl}/apply-coupon`, { code }).pipe(
      tap((res: ResponseModel) => {
        this.cartItems.set(res?.data?.items);
        // this.totalItems.set(res.data?.totalItems);
        // this.totalPrice.set(res.data?.totalPrice);
      }),
      catchError(err => {
        console.error('Error applying coupon:', err);
        return of(null);
      })
    );
  }

  /** 🔄 Clear cart */
  clearCart() {
    return this.http.delete<CartResponse>(`${this.apiUrl}/clear`).pipe(
      tap(res => {
        this.cartItems.set([]);
        this.totalItems.set(0);
        this.totalPrice.set(0);
      }),
      catchError(err => {
        console.error('Error clearing cart:', err);
        return of(null);
      })
    );
  }

  removeCoupon(code: string) {
    return this.http.delete(`${this.apiUrl}/remove-coupon/${code}`)
  }
}
