import { CommonModule, ViewportScroller } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Seo } from '../../services/seo';
import { Auth } from '../../services/auth';
import { CartService } from '../../services/cart';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Loader } from '../../components/loader/loader';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, Loader, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Cart implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();

  // ✅ SINGLE loading source for page actions
  isPageLoading = signal(true);
 
  // ✅ Derived UI states (USED IN TEMPLATE)
  loading = computed(() =>
    this.isPageLoading() ?? this.cartService.isLoader()
  );

  cartItems = computed(() =>
    this.cartService.cartItems() ?? []
  );
  
  hasItems = computed(() =>
    !this.loading() && this.cartItems().length > 0
  );

  // Services
  private readonly scroller = inject(ViewportScroller);
  public readonly cartService = inject(CartService);
  private readonly seoService = inject(Seo);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.scroller.scrollToPosition([0, 0]);

    this.seoService.updateMetaTags({
      title: 'Your Cart | Computer Shop',
      description: 'Review and checkout your selected computer products.',
      keywords: 'shopping cart, checkout, ecommerce',
      url: 'https://shoppyness.com/cart'
    });

    this.loadCartItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ Load cart once → update SERVICE → UI reacts
  loadCartItems(): void {
    this.isPageLoading.set(true);

    this.cartService.loadCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          // Scroll top
         this.scroller.scrollToPosition([0, 0]);
          this.cartService.cartItems.set(res?.data?.items ?? []);
          this.cartService.cartCount.set(res?.data?.itemCount ?? 0);
          this.isPageLoading.set(false);
        },
        error: () => {
          this.cartService.cartItems.set([]);
          this.isPageLoading.set(false);
        }
      });
  }

  removeItem(id: number): void {
    this.cartService.isLoader.set(true);

    this.cartService.removeFromCart(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadCartItems(),
        error: () => this.loadCartItems()
      });
  }

  clearCart(): void {
    this.cartService.isLoader.set(true);

    this.cartService.clearCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {this.loadCartItems(); this.cartService.isLoader.set(false);},
        error: () => this.loadCartItems()
      });
  }

  checkout(): void {
    this.cartService.isLoader.set(true);

    // Navigate to checkout; `authGuard` will redirect to `/login` with
    // `returnUrl` when the user is not authenticated.
    this.router.navigate(['/checkout']);
    this.cartService.isLoader.set(false);
  }
}
