import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core'
import { Subject, takeUntil } from 'rxjs';
import { Seo } from '../../services/seo';
import { Auth } from '../../services/auth';
import { CartService } from '../../services/cart';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface CartItemResponse {
  productId: string,
  image: string,
  name: string,
  quantity: number,
  price: number
}
@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Cart implements OnInit{

  private readonly destroy$ = new Subject<void>();
  
  // Cart items and loading state
  cartItems = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  // Computed values - now these will be direct values from the CartResponse
  subtotal = signal<number>(0);
  tax = signal<number>(0);
  shipping = signal<number>(0);
  discount = signal<any>(0);
  couponCode = signal<any>(null);
  total = signal<number>(0);
  
  // Loading state for quantity updates
  updatingItemId: string | null = '';
  
  // Coupon state
  couponInput = signal<string>('');
  isCouponLoading = signal<boolean>(false);
  couponMessage = signal<string | null>(null);
  couponError = signal<boolean>(false);
  
  // Services
  private readonly cartService = inject(CartService);
  private readonly seoService = inject(Seo);
  private readonly router = inject(Router);
  private readonly authService = inject(Auth);
  
  ngOnInit(): void {
    this.loadCartItems();
    // Set SEO tags
    this.seoService.updateMetaTags({
      title: 'Your Cart | Computer Shop',
      description: 'Review and checkout your selected computer products. Secure payment and fast delivery options available.',
      keywords: 'shopping cart, checkout, computer purchase, ecommerce',
      url: 'https://computershop.com/cart'
    });
    
    // Load cart items from service

  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadCartItems(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.cartService.loadCart().subscribe({
        next: (response: any) => {
          this.updateRes(response);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load cart items. Please try again.');
          this.isLoading.set(false);
        }
      });
  }
  
  updateQuantity(id: string, newQuantity: number): void {
    if (newQuantity < 1) return;
    // Set updating state
    this.updatingItemId = id;
    this.cartService.updateQuantity(id, newQuantity)
      .subscribe({
        next: (response: any) => {
            this.updateRes(response);

        },
        error: (err) => {
          console.error('Error updating cart item:', err);
          this.updatingItemId = null;
          // Reload cart to ensure consistency
          this.loadCartItems();
        }
      });
  }
  
  removeItem(id: string): void {
    // Set updating state
    this.cartService.removeFromCart(id)
      .subscribe({
        next: (response: any) => {
           this.updateRes(response);
        },
        error: (err) => {
          console.error('Error removing cart item:', err);
          this.updatingItemId = null;
          // Reload cart to ensure consistency
          this.loadCartItems();
        }
      });
  }

  updateRes(item:any) {
    // Update cart items and totals
          this.cartItems.set(item.items);
          this.subtotal.set(item.subTotal);
          this.tax.set(item.tax || 0);
          this.shipping.set(item.shipping);
          this.discount.set(item.discount);
          this.couponCode.set(item.couponCode);
          this.total.set(item.total || item.subTotal);
          this.updatingItemId = null;
  }
  
  clearCart(): void {
    if (this.cartItems().length === 0) return;
    
    // Mark all items as updating
    // this.updatingItemId = -1; // Special value to indicate all items
    
    this.cartService.clearCart()
      .subscribe({
        next: (response: any) => {
          // Update cart items and totals
          this.cartItems.set([]);
          this.subtotal.set(0);
          this.tax.set(response.tax);
          this.shipping.set(response.shipping);
          this.discount.set(response.discount);
          this.couponCode.set(response.couponCode);
          this.total.set(response.total);
          this.updatingItemId = null;
        },
        error: (err) => {
          console.error('Error clearing cart:', err);
          this.updatingItemId = null;
          // Reload cart to ensure consistency
          this.loadCartItems();
        }
      });
  }
  
  /**
   * Apply a coupon code to the cart
   * 
   * This method validates the entered coupon code and applies it to the cart.
   * Valid coupon codes will result in a discount being applied to the order.
   * For this demo, coupon validation happens locally for guest users and
   * via API for logged-in users.
   * 
   * Available demo coupons: WELCOME10, FLAT500, SUMMER25
   */
  applyCoupon(): void {
    const code = this.couponInput();
    if (!code) {
      this.couponError.set(true);
      this.couponMessage.set('Please enter a valid coupon code to receive a discount');
      return;
    }
    
    this.isCouponLoading.set(true);
    this.couponError.set(false);
    this.couponMessage.set(null);

    this.cartService.applyCoupon(code, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isCouponLoading.set(false);
          
          if (response.success) {
            this.couponError.set(false);
            this.couponMessage.set(response.message);
            this.loadCartItems(); // Refresh cart to reflect discount
          } else {
            this.couponError.set(true);
            this.couponMessage.set(response.message);
          }
        },
        error: (err) => {
          console.error('Error applying coupon:', err);
          this.isCouponLoading.set(false);
          this.couponError.set(true);
          this.couponMessage.set('Failed to apply coupon. Please try again.');
        }
      });
  }
  
  /**
   * Remove the applied coupon from the cart
   */
  removeCoupon(code: string): void {
    this.isCouponLoading.set(true);
    
    this.cartService.removeCoupon(code).subscribe({
        next: () => {
          this.isCouponLoading.set(false);
          this.couponCode.set(null);
          this.couponInput.set('');
          this.couponMessage.set('Coupon removed');
          this.couponError.set(false);
          this.loadCartItems(); // Refresh cart
        },
        error: (err) => {
          console.error('Error removing coupon:', err);
          this.isCouponLoading.set(false);
          this.couponError.set(true);
          this.couponMessage.set('Failed to remove coupon. Please try again.');
        }
      });
  }
  
  // Format currency for display
  formatCurrency(value: number): string {
    return Math.round(value).toLocaleString('en-IN');
  }
  
  // Round to nearest integer
  roundNumber(value: number): number {
    return Math.round(value);
  }

  checkout(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      // Redirect to login page
      this.router.navigate(['/login']);
      return;
    }
    
    // User is logged in, proceed to checkout
    this.router.navigate(['/checkout']);
  }
}
