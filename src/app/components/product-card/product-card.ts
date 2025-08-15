import { Component, inject, input, Input, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from '../../services/cart';
@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
  private router = inject(Router);
  public cartService = inject(CartService);
  @Input() product:any = [];
  isLoading = input();

  navigateToProduct(slug: string): void {
    this.router.navigate(['/product', slug]);
  }
}
