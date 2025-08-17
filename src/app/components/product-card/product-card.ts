import { Component, inject, input, Input, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CartService } from '../../services/cart';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
  private router = inject(Router);
  public cartService = inject(CartService);
  private toastr = inject(ToastrService);
  @Input() product:any = [];
  isLoading = input();

  navigateToProduct(slug: string): void {
    this.router.navigate(['/product', slug]);
  }

    // Add product to cart
  addToCart(product: any): void {
    // Add product to cart through CartService
    this.cartService.addToCart(product, 1).subscribe({
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
