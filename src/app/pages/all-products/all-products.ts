import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, inject, PLATFORM_ID, signal } from '@angular/core';
import { ProductList } from '../product-list/product-list';
@Component({
  selector: 'app-all-products',
  standalone: true,
  imports: [CommonModule, ProductList],
  templateUrl: './all-products.html',
  styleUrls: ['./all-products.scss'],
})
export class AllProducts {
  isBrowser = signal<boolean>(false);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.isBrowser.set(isPlatformBrowser(this.platformId));
    if(this.isBrowser()){
      sessionStorage.setItem('mode', 'external');
    }
  }
}