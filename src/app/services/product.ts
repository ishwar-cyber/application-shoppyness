import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ProductModel, ResponsePayload } from '../commons/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class Product {
  URL = 'http://localhost:8000/api/v1'
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
}
