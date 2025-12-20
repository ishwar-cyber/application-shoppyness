import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, inject, PLATFORM_ID, signal } from '@angular/core';
import { ProductList } from '../product-list/product-list';
import { Store } from '@ngrx/store';
import { selectAllProducts, selectProductLoading } from '../../store/products/products.selectors';
import { loadProducts } from '../../store/products/products.actions';
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
  
  private readonly store = inject(Store);
  product = this.store.select(selectAllProducts);
  loading = this.store.select(selectProductLoading);

  ngOnInit(): void {
    this.store.dispatch(loadProducts())
    this.isBrowser.set(isPlatformBrowser(this.platformId));
    if(this.isBrowser()){
      sessionStorage.setItem('mode', 'external');
    }
  }
}