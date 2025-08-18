import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CartResponse, Item } from '../commons/models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  apiUrl = `${environment.apiUrl}/cart`;

  // Signals for cart state
  cartItems = signal<Item[]>([]);
  cartCount = signal<number>(0);
  totalPrice = signal<number>(0);
  subTotal = signal<number>(0);
  cartItems$ = this.cartItems.asReadonly();

  constructor(private http: HttpClient) {}

  loadCart() {
    return this.http.get<CartResponse>(`${this.apiUrl}`, { withCredentials: true }).pipe(
      tap(res => {
        if (res.success) {
          this.cartItems.set(res.data.items); 
          this.cartCount.set(res.data.itemCount);
          this.subTotal.set(res.data.subTotal);
          this.totalPrice.set(res.data.total)
        }
      })
    );
  }

addToCart(productId: string, quantity: number = 1) {
  return this.http.post<any>(`${this.apiUrl}/add`, { productId, quantity }, { withCredentials: true}
  ).pipe(
    tap(res => {
      if (res?.success && res?.data) {
        this.cartItems.set([...res.data.items]); // replace reference
        this.cartCount.set(res.data.itemCount);
        this.subTotal.set(res.data.subTotal);
        this.totalPrice.set(res.data.total);
      } else {
        console.warn('Add to cart failed, invalid response:', res);
      }
    }),
    catchError(err => {
      console.error('Error adding to cart:', err);
      return of(null);
    })
  );
}

  /** ✏️ Update quantity (optimistic + rollback) */
  updateQuantity(itemId: string, quantity: number) { 
    const oldItems = [...this.cartItems()];

    // optimistic update
    this.cartItems.update(items =>
      items.map(i => (i._id === itemId ? { ...i, quantity } : i))
    );    
    this.http.put<CartResponse>(`${this.apiUrl}/update/${itemId}/quantity`, { quantity }, { withCredentials: true }).subscribe({
      next: res => {
        if (res.success) {
          this.cartItems.set(res.data.items);
          this.cartCount.set(res.data.itemCount);
          this.subTotal.set(res.data.subTotal);
          this.totalPrice.set(res.data.total)
        }
      },
      error: () => {
        this.cartItems.set(oldItems); // rollback
        alert('Failed to update quantity. Please try again.');
      },
    });
  }

  /** ❌ Remove item */
  removeFromCart(itemId: string) {
    return this.http.delete<CartResponse>(`${environment.apiUrl}/${itemId}/remove`, { withCredentials: true }).pipe(
      tap(res => {
        if (res.success) {
          this.cartItems.set(res.data.items);
          this.cartCount.set(res.data.itemCount);
           this.subTotal.set(res.data.subTotal);
          this.totalPrice.set(res.data.total)
        }
      }),
      catchError(err => {
        console.error('Error removing item:', err);
        return of(null);
      })
    );
  }

  /** 🎟 Apply coupon */
  applyCoupon(code: string) {
    return this.http.post<CartResponse>(`${environment.apiUrl}/coupons/apply-coupon`, { code }, { withCredentials: true}).pipe(
      tap(res => {
        if (res.success) {
          this.cartItems.set(res.data.items);
          this.cartCount.set(res.data.itemCount);
          this.totalPrice.set(res.data.subTotal);
        }
      }),
      catchError(err => {
        console.error('Error applying coupon:', err);
        return of(null);
      })
    );
  }

  /** 🔄 Clear cart */
  clearCart() {
    return this.http.delete<CartResponse>(`${this.apiUrl}/clear`, { withCredentials: true}).pipe(
      tap(res => {
        if (res.success) {
          this.cartItems.set([]);
          this.cartCount.set(0);
          this.totalPrice.set(0);
        }
      }),
      catchError(err => {
        console.error('Error clearing cart:', err);
        return of(null);
      })
    );
  }

  /** ❌ Remove coupon */
  removeCoupon(code: string) {
    return this.http.delete<CartResponse>(`${this.apiUrl}/remove-coupon/${code}`, { withCredentials: true});
  }
}
