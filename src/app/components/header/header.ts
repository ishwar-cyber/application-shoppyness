import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Product } from '../../services/product';
import { Search } from "../search/search";
import { CartService } from '../../services/cart';
import { HomeService } from '../../services/home';
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
  selectedBottomMenu = signal<string>('home')
  filteredProducts = signal<any>([]);
  
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  public authService = inject(Auth); // Assuming AuthService is available for login state
  private readonly product = inject(Product);
  public cartService = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);
  public readonly home = inject(HomeService);


  // Active Category for Mega Menu
  activeCategory: string | null = null;
  cartCount = signal<number>(0);
  userName = signal<any>('');
  // Categories data with subcategories
  categories = this.home.categoriesHeader();

  ngOnInit(): void {
    this.home.getCategoryAndSubcategory();

    if(isPlatformBrowser(this.platformId)){
      this.userName.set(sessionStorage.getItem('userName'));
    }
  }

  isMobileView(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }
  // Megamenu functions
  showMegaMenu(slug: string): void {
    this.activeCategory = slug;
  }
  
  hideMegaMenu(): void {
    this.activeCategory = null;
  }
  

  logout(): void {
    this.authService.isLoggedInSignal.set(false);
    this.authService.logout();
  }
  selectBottomMenu(menu: string){
    this.selectedBottomMenu.set(menu);
     // check if current URL starts with path
    return this.router.url.startsWith(menu);
  }
}
