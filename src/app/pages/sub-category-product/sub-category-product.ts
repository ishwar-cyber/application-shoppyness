import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
  ngOnInit(): void {
    sessionStorage.setItem('mode', 'subcategory');
    this.route.paramMap.subscribe(params => {
      const subSlug = params.get('subSlug') || '';
      this.apiParams = { subSlug };
      this.isLoading.set(false);
    });
  }
}
