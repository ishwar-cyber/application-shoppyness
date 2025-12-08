import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ProductModel, ResponsePayload } from '../commons/models/product.model';
import { environment } from '../../environments/environment';
import { TransferState, makeStateKey } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Product {
  URL = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly state = inject(TransferState);

  getProduct() {
    const KEY = makeStateKey<ProductModel[]>('products');
    const saved = this.state.get(KEY, null as any);
    if (saved) return of(saved);
    return this.http.get<ProductModel[]>(`${this.URL}/products`).pipe(
      tap(data => this.state.set(KEY, data))
    );
  }

  getProductById(slug: string) {
    return this.http.get<ResponsePayload>(`${this.URL}/products/${slug}`);
  }

  getRelatedProducts(slug: string) {
    return this.http.get(`${this.URL}/products/${slug}/related`);
  }

  search(query: string) {
    const params = new HttpParams().set('products', query);
    return this.http.get(`${this.URL}/products/search`, { params });
  }

  getProductByCategoryId(id: string) {
    return this.http.get(`${this.URL}/products/category/${id}`);
  }
  getProductBySubCategorySlug(payload: any) {
    return this.http.get(`${this.URL}/products/category/${payload.slug}/${payload.subSlug}`);
  }

  filterProduct(categorys: string[], brands: string[], price: any) {
    let params = new HttpParams();

    if (categorys.length) {
      params = params.set('categories', categorys.join(','));
    }
    if (brands.length) {
      params = params.set('brands', brands.join(','));
    }
    if (price) {
      params = params.set('minPrice', price[0].toString());
      params = params.set('maxPrice', price[1].toString());
    }
    
    return this.http.get<any[]>(`${this.URL}/products/filter`, { params });
  }

  searchProducts(query: string) {
    return this.http.get(`${this.URL}/products/search?q=${query}`);
  }
}