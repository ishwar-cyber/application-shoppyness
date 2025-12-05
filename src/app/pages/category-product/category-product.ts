import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
  ngOnInit(): void {
    sessionStorage.setItem('mode', 'category');
    this.route.paramMap.subscribe(params => {
      console.log('params', params);
      const slug = params.get('catSlug') || '';
      this.apiParams = { slug };
    });
  }
}
