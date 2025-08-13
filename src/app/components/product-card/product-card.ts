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
  private readonly cartService = inject(CartService);
  @Input() product:any = [];
  isLoading = input();

  addToCart(event: any){
    
  }

  navigateToProduct(id: string): void {
  this.router.navigate(['/product', id]).then(() => {
    // if (isPlatformBrowser(this.platformId)) {
    //   window.scrollTo({ top: 0, behavior: 'smooth' });
    // }
  });
}
}
