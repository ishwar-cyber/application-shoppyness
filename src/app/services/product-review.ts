import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
export interface Review {
  name: string,
  email: string,
  productId: string,
  rating: number,
  comment: string,
  average?: number
}
@Injectable({
  providedIn: 'root'
})
export class ProductReviewService {
  
  private readonly httpService = inject(HttpClient);
  baseUrl = `${environment.apiUrl}/reviews`;
  addProductReview(payload: Review){
    return this.httpService.post(this.baseUrl, payload);
  }

  getProductByIdReview(id: string){
    return this.httpService.get(`${this.baseUrl}/${id}`)
  }
}
