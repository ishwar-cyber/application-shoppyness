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
  total = signal<number>(0);
  
  // Loading state for quantity updates
  updatingItemId: string | null = '';
  

  
  // Services
  public cartService = inject(CartService);
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
      url: 'https://shoppyness.com/cart'
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
  removeItem(id: string): void {
    // Set updating state    
    this.cartService.removeFromCart(id)
      .subscribe({
        next: (response: any) => {
          
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
      this.cartService.cartItems.set(item.data.items);
      this.cartService.cartCount.set(item.data.itemCount)
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
