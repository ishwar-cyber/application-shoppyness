import { Injectable, signal, inject, PLATFORM_ID, computed} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CartResponse, Item } from '../commons/models/cart.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  apiUrl = `${environment.apiUrl}/cart`;
  isBrowser = isPlatformBrowser(this.platformId);

  // 🔔 Signals for cart state
  cartItems = signal<Item[] | null>(null);
  totalPrice = signal<number>(0);
  subTotal = signal<number>(0);
  shipping = signal<number>(100);
  isLoader = signal<boolean>(false);
  cart = computed(()=> this.cartItems());
  cartTotalTemp = signal<number>(0);
  cartCount = computed(()=>this.cartItems()?.length || this.cartTotalTemp());
  getSubtotal() {
    return this.subTotal();
  }
  getShippingCharge() {
    return this.shipping();
  }
  /** 🔄 Load cart (SSR-safe) */
  loadCart() {
    if (!this.isBrowser) return of(null); // SSR safety
    return this.http.get<CartResponse>(`${this.apiUrl}/my`, { withCredentials: true }).pipe(
      tap(res => {
        if (res.success) {
          this.updateSignals(res);
        }
      }),
      catchError(err => {
        console.error('Error loading cart:', err);
        return of(null);
      })
    );
  }

  setCart(cart: any) {
    this.cartItems.set(cart);
  }

  /** ➕ Add product */
  addToCart(payload: any) {
    if (!this.isBrowser) return of(null);
    return this.http.post<CartResponse>(`${this.apiUrl}/add`, payload, { withCredentials: true }).pipe(
      tap(res => {
        if (res?.success) {
          this.updateSignals(res);
        }
      }),
      catchError(err => {
        console.error('Error adding to cart:', err);
        return of(null);
      })
    );
  }

  /** ✏️ Update quantity (optimistic) */
  updateQuantity(itemId: number, quantity: number, action: boolean = true) {
    this.isLoader.set(true);
    if (!this.isBrowser) return;
    const oldItems = [...(this.cartItems() || [])]; // safe backup
    this.cartItems.update(items =>
      (items || []).map(i =>
        i.id === itemId ? { ...i, quantity } : i
      )
    );
    const payload = { 
      action: action
    };
  this.http
    .put<CartResponse>(`${this.apiUrl}/items/${itemId}/update`, payload, { withCredentials: true })
    .subscribe({
      next: res => {
        if (res.success) {
            this.isLoader.set(false);
          this.updateSignals(res);
        } else {
            this.isLoader.set(false);
          this.cartItems.set(oldItems);
        }
      },
      error: () => {
         this.isLoader.set(false);
        this.cartItems.set(oldItems); // rollback
        alert('Failed to update quantity. Please try again.');
      }
    });
}

  /** ❌ Remove item */
  removeFromCart(id: number) {
    if (!this.isBrowser) return of(null);
    return this.http.delete<CartResponse>(`${this.apiUrl}/items/${id}`, { withCredentials: true }).pipe(
      tap(res => {
        res.success && this.updateSignals(res)
      }),
      catchError(err => {
        console.error('Error removing item:', err);
        return of(null);
      })
    );
  }

  /** 🎟 Apply coupon */
  applyCoupon(code: string) {
     this.isLoader.set(true);
    if (!this.isBrowser) return of(null);
    return this.http.post<CartResponse>(`${environment.apiUrl}/coupons/apply-coupon`, { code }, { withCredentials: true }).pipe(
      tap(res => {
         this.isLoader.set(false);
      }),
      catchError(err => {
        console.error('Error applying coupon:', err);
        return of(null);
      })
    );
  }

  /** ❌ Remove coupon */
  removeCoupon(code: string) {
    if (!this.isBrowser) return of(null);
    return this.http.delete<CartResponse>(`${this.apiUrl}/remove-coupon/${code}`, { withCredentials: true }).pipe(
      tap(res => res.success),
      catchError(err => {
        console.error('Error removing coupon:', err);
        return of(null);
      })
    );
  }

  /** 🔄 Clear cart */
  clearCart() {
     this.isLoader.set(true);
    if (!this.isBrowser) return of(null);
    return this.http.delete<CartResponse>(`${this.apiUrl}/clear`, { withCredentials: true }).pipe(
      tap(res => {
        if (res.success) {
           this.isLoader.set(false);
          this.cartItems.set([]);
          this.subTotal.set(0);
          this.totalPrice.set(0);
        }
      }),
      catchError(err => {
        console.error('Error clearing cart:', err);
        return of(null);
      })
    );
  }

  /** 📌 Helper: update signals */
  private updateSignals(res: CartResponse) {
    const data = res.data;
    this.cartItems.set(data?.items || []);
    // this.cartCount.set(data?.items.length ?? 0);
    this.subTotal.set(data?.subTotal ?? 0);
    this.totalPrice.set(
      (data?.subTotal ?? 0) + this.shipping()
    );
    this.isLoader.set(false);
  }
}
