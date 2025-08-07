import { Component, inject, Input, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
  private router = inject(Router)
    @Input() product:any = [];

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
