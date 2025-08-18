import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ProductModel, ResponsePayload } from '../commons/models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Product {
  URL = environment.apiUrl;
  private readonly http = inject(HttpClient);


  getProduct(){
    return this.http.get(`${this.URL}/products`, { withCredentials: true});
  }

  getProductById(id: string){
    return this.http.get<ResponsePayload>(`${this.URL}/products/${id}`, { withCredentials: true})
  }

  getRelatedProducts(id: string){
    return this.http.get(`${this.URL}/products/${id}/related`, { withCredentials: true})
  }
  search(query: string) {
     const params = new HttpParams().set('products', query);
     return this.http.get(`${this.URL}/products/search?${ params }`, { withCredentials: true} );
  }

  getProductByCategoryId(id: string){
    return this.http.get(`${this.URL}/products/category/${id}`, { withCredentials: true})
  }

  filterProduct(categorys: any, brands: any, minPrice: number, maxPrice: number){
     let params = new HttpParams();

    if (categorys.length) {
      params = params.set('categories', categorys.join(','));
    }
    if (brands.length) {
      params = params.set('brands', brands.join(','));
    }
    if (minPrice) {
      params = params.set('minPrice', minPrice!.toString());
    }
    if (maxPrice) {
      params = params.set('maxPrice', maxPrice!.toString());
    }
     return this.http.get<any[]>(`${this.URL}/products/filter`, { params });
  }
}
