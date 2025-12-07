import { CommonModule, ViewportScroller, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, PLATFORM_ID, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { map, forkJoin } from 'rxjs';
import { ProductModel } from '../../commons/models/product.model';
import { CartService } from '../../services/cart';
import { HomeService } from '../../services/home';
import { Product } from '../../services/product';
import { Seo } from '../../services/seo';
import { FormsModule } from '@angular/forms';
import { ProductList } from '../product-list/product-list';

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
  
  ngOnInit(): void {
    this.isBrowser.set(isPlatformBrowser(this.platformId));
    if(this.isBrowser()){
      sessionStorage.setItem('mode', 'external');
    }
  }
}