import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly http =inject(HttpClient);
  url = environment.apiUrl;
  getBrand(){
    return this.http.get(`${this.url}/brands`);
  }
}
