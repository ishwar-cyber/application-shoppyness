import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
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
  cartItems = signal<Item[]>([]);
  cartCount = signal<number>(0);
  totalPrice = signal<number>(0);
  subTotal = signal<number>(0);
  cartItems$ = this.cartItems.asReadonly();
  cart = computed(()=> this.cartItems());

  /** 🔄 Load cart (SSR-safe) */
  loadCart() {
    if (!this.isBrowser) return of(null); // SSR safety
    return this.http.get<CartResponse>(this.apiUrl, { withCredentials: true }).pipe(
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
  addToCart(productId: string, quantity: number = 1) {
    if (!this.isBrowser) return of(null);
    return this.http.post<CartResponse>(`${this.apiUrl}/add`, { productId, quantity }, { withCredentials: true }).pipe(
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
  updateQuantity(itemId: string, quantity: number) {
    if (!this.isBrowser) return;

    const oldItems = [...this.cartItems()]; // backup for rollback
    this.cartItems.update(items =>
      items.map(i => (i._id === itemId ? { ...i, quantity } : i))
    );

    this.http.put<CartResponse>(`${this.apiUrl}/update/${itemId}/quantity`, { quantity }, { withCredentials: true }).subscribe({
      next: res => res.success ? this.updateSignals(res) : this.cartItems.set(oldItems),
      error: () => {
        this.cartItems.set(oldItems); // rollback
        alert('Failed to update quantity. Please try again.');
      },
    });
  }

  /** ❌ Remove item */
  removeFromCart(itemId: string) {
    if (!this.isBrowser) return of(null);
    return this.http.delete<CartResponse>(`${this.apiUrl}/${itemId}/remove`, { withCredentials: true }).pipe(
      tap(res => res.success && this.updateSignals(res)),
      catchError(err => {
        console.error('Error removing item:', err);
        return of(null);
      })
    );
  }

  /** 🎟 Apply coupon */
  applyCoupon(code: string) {
    if (!this.isBrowser) return of(null);
    return this.http.post<CartResponse>(`${environment.apiUrl}/coupons/apply-coupon`, { code }, { withCredentials: true }).pipe(
      tap(res => res.success && this.updateSignals(res)),
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
      tap(res => res.success && this.updateSignals(res)),
      catchError(err => {
        console.error('Error removing coupon:', err);
        return of(null);
      })
    );
  }

  /** 🔄 Clear cart */
  clearCart() {
    if (!this.isBrowser) return of(null);
    return this.http.delete<CartResponse>(`${this.apiUrl}/clear`, { withCredentials: true }).pipe(
      tap(res => {
        if (res.success) {
          this.cartItems.set([]);
          this.cartCount.set(0);
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
    this.cartItems.set(res.data.items);
    this.cartCount.set(res.data.itemCount);
    this.subTotal.set(res.data.subTotal);
    this.totalPrice.set(res.data.total);
  }
                                                                                                 }
