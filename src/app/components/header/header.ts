import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, HostListener, inject, OnInit, PLATFORM_ID, Signal, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Product } from '../../services/product';
import { Search } from "../search/search";
import { CartService } from '../../services/cart';
import { HomeService } from '../../services/home';

interface CategoryItem {
  name: string;
  slug: string;
  subcategories: SubcategoryItem[];
}

interface SubcategoryItem {
  name: string;
  slug: string;
}
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, RouterLink, FormsModule, Search],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit{

  searchQuery = '';
  isSearchFocused = false;
  toggleUserDropdown =signal<boolean>(false)
  selectedBottomMenu = signal<string>('')
  filteredProducts = signal<any>([]);
  
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  public authService = inject(Auth); // Assuming AuthService is available for login state
  private readonly product = inject(Product);
  public cartService = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);
  public readonly home = inject(HomeService);
  isBrowser = signal<boolean>(isPlatformBrowser(this.platformId));
  // Signal to track screen width
  screenWidth = signal<number>(this.isBrowser() ? window.innerWidth : 1200); // default fallback

  // Active Category for Mega Menu
  activeCategory: string | null = null;
  cartCount = signal<number>(0);
  userName = signal<any>('');
  // Categories data with subcategories
  categories = signal<CategoryItem[]>([]);

  ngOnInit(): void {

   this.loadCategories();

  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      this.loadCategories(); // auto refresh
    }
  });

    if(isPlatformBrowser(this.platformId)){
      this.userName.set(sessionStorage.getItem('userName'));
    }
   this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      const segment = event.urlAfterRedirects.split('/')[1];
      this.selectedBottomMenu.set(segment || 'home');
    }
  });
  }

  
  // pdate screen width when window is resized
  @HostListener('window:resize')
  onResize() {
    if(isPlatformBrowser(this.platformId)){
      this.screenWidth.set(window.innerWidth);
    }
  }
  isMobileView(): boolean {
    return this.screenWidth() <= 768;
  }
  // Megamenu functions
  showMegaMenu(slug: string): void {
    this.activeCategory = slug;
  }
  
  hideMegaMenu(): void {
    this.activeCategory = null;
  }
  getFirstRouteSegment() {
      const firstRoute = this.router.url.split('/')[1]; // e.g., /products → "products"

      if (firstRoute) {
        this.selectedBottomMenu.set(firstRoute);
      }
  }

  loadCategories() {
    this.home.getCategoryAndSubcategory().subscribe({
      next: (res:any) => {
        this.categories.set(res);
        console.log('UPDATED HEADER DATA:', res);
      },
      error: (err) => console.error(err)
    });
  }
  logout(): void {
    this.authService.isLoggedInSignal.set(false);
    this.authService.logout();
    this.router.navigate(['/']);
  }
  selectBottomMenu(menu: string){
    this.selectedBottomMenu.set(menu);
  }
}
