import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly http =inject(HttpClient);
  public category = signal<any[]>([]);
  public categoriesHeader = signal<any[]>([]);
  url = environment.apiUrl;
  
  getBrand(){
    return this.http.get(`${this.url}/brands`);
  }
  getCategories(){
    return this.http.get(`${this.url}/category`)
  }

  getCategoryAndSubcategory(){
    return this.http.get(`${this.url}/category/header`);
  }
}
