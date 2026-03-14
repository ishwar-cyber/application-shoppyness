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
export class ProductService {
  URL = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly state = inject(TransferState);

  getProduct(
    page?: number,
    limit?: number,
    categories?: string[],
    brands?: string[],
    processors?: string[],
    generic?: string[],
    price?: number[]
  ) {
    let params = new HttpParams();

    if (categories?.length) {
      params = params.set('categories', categories.join(','));
    }

    if (brands?.length) {
      params = params.set('brands', brands.join(','));
    }

    if (processors?.length) {
      params = params.set('processors', processors.join(','));
    }

    if (generic?.length) {
      params = params.set('generic', generic.join(','));
    }

    if (price?.length === 2) {
      params = params.set('minPrice', price[0].toString());
      params = params.set('maxPrice', price[1].toString());
    }

    if (page !== undefined) {
      params = params.set('page', page.toString());
    }

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get(`${this.URL}/products`, { params });
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

    return this.http.get<any[]>(`${this.URL}/products`, { params });
  }

  searchProducts(query: string) {
    return this.http.get(`${this.URL}/products/search?q=${query}`);
  }

  checkPincode(payload: any) {
    return this.http.post<{ serviceable: boolean }>(`${this.URL}/pincode/couriers`, payload).pipe(
      catchError(() => of({ serviceable: false }))
    );
  }

  shareProduct(data: {
    title: string;
    text: string;
    url: string;
  }) {
    // ✅ Native share (mobile best experience)
    if (navigator.share) {
      navigator.share({
        title: data.title,
        text: data.text,
        url: data.url
      }).catch(() => { });
      return true;
    }
    return false;
  }

  openPopup(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}