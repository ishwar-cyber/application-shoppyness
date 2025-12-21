import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { ProductList } from '../product-list/product-list';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category-product',
  imports: [CommonModule, ProductList],
  templateUrl: './category-product.html',
  styleUrl: './category-product.scss',
})
export class CategoryProduct {

  route = inject(ActivatedRoute);
  apiParams: any = {};
  isBrowser = signal<boolean>(false);
  private readonly platformId = inject(PLATFORM_ID);
  ngOnInit(): void {
    this.isBrowser.set(isPlatformBrowser(this.platformId));
    if(this.isBrowser()){
      sessionStorage.setItem('mode', 'category');
    }
    this.route.paramMap.subscribe(params => {
      const slug = params.get('catSlug') || '';
      this.apiParams = { slug };
    });
  }
}
