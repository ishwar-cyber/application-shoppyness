import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { cartSignal } from '../../commons/store';
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
export class Header implements OnInit, AfterViewInit{

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
  categories: CategoryItem[] = [
    {
      name: 'Laptops',
      slug: 'laptop',
      subcategories: [
        { name: 'Gaming Laptops', slug: 'gaming-laptop' },
        { name: 'Business Laptops', slug: 'business-laptop' },
        { name: 'Ultrabooks', slug: 'ultrabook' },
        { name: 'Chromebooks', slug: 'chromebook' },
        { name: 'MacBooks', slug: 'macbook' }
      ]
    },
    {
      name: 'Desktops',
      slug: 'desktop',
      subcategories: [
        { name: 'Gaming PCs', slug: 'gaming-pc' },
        { name: 'All-in-One PCs', slug: 'all-in-one' },
        { name: 'Mini PCs', slug: 'mini-pc' },
        { name: 'Workstations', slug: 'workstation' }
      ]
    },
    {
      name: 'Components',
      slug: 'components',
      subcategories: [
        { name: 'Processors', slug: 'cpu' },
        { name: 'Graphics Cards', slug: 'gpu' },
        { name: 'Motherboards', slug: 'motherboard' },
        { name: 'Memory (RAM)', slug: 'ram' },
        { name: 'Storage', slug: 'storage' },
        { name: 'Power Supplies', slug: 'psu' },
        { name: 'Cases', slug: 'case' },
        { name: 'Cooling', slug: 'cooling' }
      ]
    },
    {
      name: 'Monitors',
      slug: 'monitor',
      subcategories: [
        { name: 'Gaming Monitors', slug: 'gaming-monitor' },
        { name: 'Ultrawide Monitors', slug: 'ultrawide' },
        { name: 'Professional Monitors', slug: 'professional-monitor' },
        { name: '4K Monitors', slug: '4k-monitor' }
      ]
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      subcategories: [
        { name: 'Keyboards', slug: 'keyboard' },
        { name: 'Mice', slug: 'mouse' },
        { name: 'Headsets', slug: 'headset' },
        { name: 'Webcams', slug: 'webcam' },
        { name: 'External Storage', slug: 'external-storage' }
      ]
    },
    {
      name: 'Gaming',
      slug: 'gaming',
      subcategories: [
        { name: 'Gaming Chairs', slug: 'gaming-chair' },
        { name: 'Gaming Desks', slug: 'gaming-desk' },
        { name: 'Controllers', slug: 'controller' },
        { name: 'Gaming Accessories', slug: 'gaming-accessories' }
      ]
    }
  ];
  
  ngAfterViewInit(): void {
 
  }

  ngOnInit(): void {
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
    // this.selectedBottomMenu.set(menu);
     // check if current URL starts with path
    return this.router.url.startsWith(menu);
  }
}
