import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  PLATFORM_ID,
  signal,
  computed,
  effect,
  runInInjectionContext
} from '@angular/core';
import {
  Router,
  RouterModule,
  RouterLink,
  NavigationEnd
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Product } from '../../services/product';
import { CartService } from '../../services/cart';
import { HomeService } from '../../services/home';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {

  // UI Signals
  searchQuery = signal('');
  isSearchFocused = signal(false);
  toggleUserDropdown = signal(false);
  selectedBottomMenu = signal('home');

  // Data Signals
  categories = signal<any[]>([]);
  cartCount = signal(0);
  userName = signal('');
  isBrowser = signal(false);

  searchResults = signal<any[]>([]);
  searchTimeout: any = null;
  // Screen width
  screenWidth = signal(1200);
  isMobileView = computed(() => this.screenWidth() <= 768);

  // Inject services
  private readonly router = inject(Router);
  public readonly authService = inject(Auth);
  private readonly productService = inject(Product);
  private readonly cartService = inject(CartService);
  private readonly homeService = inject(HomeService);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {

    // ----------------------------------
    //  FIX: effect() inside constructor 
    // ----------------------------------
    // runInInjectionContext(this, () => {
      effect(() => {
        this.cartCount.set(this.cartService.cartCount());
      });
    // });

    // router menu update
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const segment = event.urlAfterRedirects.split('/')[1];
        this.selectedBottomMenu.set(segment || 'home');

        this.toggleUserDropdown.set(false);
      }
    });
  }

  ngOnInit(): void {
    // Enable browser mode
    this.isBrowser.set(isPlatformBrowser(this.platformId));
    if (this.isBrowser()) {
    //   document.addEventListener('click', (e: any) => {
    //   if (!e.target.closest('.search-wrapper')) {
    //     this.isSearchFocused.set(false);
    //   }
    // });
      this.screenWidth.set(window.innerWidth);
      this.userName.set(sessionStorage.getItem('userName') || '');
    }
    this.loadCategories();

    
  }

  // ----------------------------------
  //  Window Resize
  // ----------------------------------
  @HostListener('window:resize')
  onResize() {
    if (this.isBrowser()) {
      this.screenWidth.set(window.innerWidth);
    }
  }

  // ----------------------------------
  //  Load Categories
  // ----------------------------------
  loadCategories() {
    this.homeService.getCategoryAndSubcategory().subscribe({
      next: (res: any) => this.categories.set(res),
      error: (err) => console.error(err)
    });
  }

  // ----------------------------------
  //  Mega Menu
  // ----------------------------------
  activeCategory = signal<string | null>(null);

  openMegaMenu(cat: any) {
    this.activeCategory.set(cat.slug);
  }

  closeMegaMenu() {
    this.activeCategory.set(null);
  }

  // ----------------------------------
  //  Logout
  // ----------------------------------
  logout() {
    this.authService.logout();
    this.toggleUserDropdown.set(false);
    this.router.navigate(['/']);
  }

  // ----------------------------------
  // Bottom Menu Switcher
  // ----------------------------------
  selectBottomMenu(menu: string) {
    this.selectedBottomMenu.set(menu);
  }
  // ----------------------------------
// SEARCH LOGIC (UPDATED)
// ----------------------------------

onSearchChange() {
  const query = this.searchQuery().trim();

  // ❌ If input cleared → close search
  if (!query) {
    this.closeSearch();
    return;
  }

  // ✅ Open dropdown while typing

  if (this.searchTimeout) clearTimeout(this.searchTimeout);

  // ✅ Debounce
  this.searchTimeout = setTimeout(() => {
    if (query.length < 2) {
      this.searchResults.set([]);
      return;
    }

    this.productService.searchProducts(query).subscribe({
      next: (res: any) => {
        this.searchResults.set(res || []);
        this.isSearchFocused.set(true);

      },
      error: () => {
        this.searchResults.set([]);
      }
    });
  }, 300);
}

performSearch() {
  const q = this.searchQuery().trim();
  if (!q) return;

  this.router.navigate(['/products'], {
    queryParams: { search: q }
  });

  this.closeSearch();
}

openProduct(slug: string) {
  this.router.navigate(['/product', slug]);
  this.closeSearch();
}

onFocusSearch() {
  if (this.searchQuery().trim()) {
    this.isSearchFocused.set(true);
  }
}

// ✅ Centralized close logic (IMPORTANT)
closeSearch() {
  this.isSearchFocused.set(false);
  this.searchQuery.set('');
  this.searchResults.set([]);
}

}
