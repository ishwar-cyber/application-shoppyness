import { CommonModule, ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core'
import { Subject, takeUntil } from 'rxjs';
import { Seo } from '../../services/seo';
import { Auth } from '../../services/auth';
import { CartService } from '../../services/cart';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Loader } from '../../components/loader/loader';

interface CartItemResponse {
  productId: string,
  image: string,
  name: string,
  quantity: number,
  price: number
}
@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, Loader, FormsModule],
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
  isLoader =signal<boolean>(false);
  updatingItemId: string | null = '';
  // Services
  private scroller = inject(ViewportScroller);
  public cartService = inject(CartService);
  private readonly seoService = inject(Seo);
  private readonly router = inject(Router);
  private readonly authService = inject(Auth);
  
  ngOnInit(): void {
    this.scroller.scrollToPosition([0, 0]); // safe scroll
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
          this.loadCartItems();
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
      this.cartService.cartItems.set(item?.data?.items);
      this.cartService.cartCount.set(item?.data?.itemCount)
  }
  
  clearCart(): void {
    this.cartService.clearCart()
      .subscribe({
        next: (response: any) => {
          // Update cart items and totals
          this.loadCartItems();
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
    this.isLoader.set(true);
    if (!this.authService.isLoggedIn()) {
      
      this.router.navigate(['/login']);
      this.isLoader.set(false);
      return;
    }
    this.router.navigate(['/checkout']);
    this.isLoader.set(false);

  }
}
