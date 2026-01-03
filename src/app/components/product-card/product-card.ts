import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, Input, Output, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CartService } from '../../services/cart';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  private router = inject(Router);
  public cartService = inject(CartService);
  private toastr = inject(ToastrService);
  @Input() product:any = [];
  isLoading = input();

    // @Input() product: any;
  @Output() addToCart = new EventEmitter<any>();

  isWishlisted = signal(false);

  toggleWishlist() {
    this.isWishlisted.update(v => !v);
  }

  handleAddToCart() {
    this.addToCart.emit(this.product);
  }
  navigateToProduct(slug: string): void {
    this.router.navigate(['/product', slug]);
  }

    // Add product to cart
  addToCart1(product: any): void {
    // Add product to cart through CartService
     const payload = {
      productId: product,
      quantity: 1,
      variant: null
    };
    this.cartService.addToCart(payload).subscribe({
      next: (res: any) => {
        this.toastr.success('Item added on cart')
      },
      error: (error: Error) => {
        console.error('Error adding to cart:', error);
        // this.addedToCartMessage.set('Failed to add to cart. Please try again.');
      }
    });
  }
}
