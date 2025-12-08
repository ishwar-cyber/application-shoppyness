import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { ProductList } from '../product-list/product-list';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sub-category-product',
  imports: [CommonModule, ProductList],
  templateUrl: './sub-category-product.html',
  styleUrl: './sub-category-product.scss',
})
export class SubCategoryProduct {

  isLoading = signal<boolean>(true);
  apiParams: any = {};
  route = inject(ActivatedRoute);
  isBrowser = signal<boolean>(false);
  private readonly platformId = inject(PLATFORM_ID);
  
  ngOnInit(): void {
    this.isBrowser.set(isPlatformBrowser(this.platformId));
    if(this.isBrowser()){
    sessionStorage.setItem('mode', 'subcategory');
  }
    this.route.paramMap.subscribe(params => {
      console.log('paramssss', params);
      
      const subSlug = params.get('subSlug') || '';
      const catSlug = params.get('slug') || '';
      this.apiParams = { subSlug, catSlug };
      this.isLoading.set(false);
    });
  }
}
