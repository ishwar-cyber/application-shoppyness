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
    return this.http.get(`${this.URL}/products`);
  }

  getProductById(id: string){
    return this.http.get<ResponsePayload>(`${this.URL}/products/${id}`)
  }

  getRelatedProducts(id: string){
    return this.http.get(`${this.URL}/products/${id}`);
  }
  search(query: string) {
     const params = new HttpParams().set('q', query);
     return this.http.get(`${this.URL}/products/search?${ params }`, );
  }
}
