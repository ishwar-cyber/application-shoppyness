import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { ProductModel } from '../../commons/models/product.model';
import { ProductCard } from '../../components/product-card/product-card';
import { Seo } from '../../services/seo';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';
import { Product } from '../../services/product';
import { HomeService } from '../../services/home';
import { forkJoin } from 'rxjs';
import { SkeltonLoader } from '../../components/skelton-loader/skelton-loader';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, RouterModule, RouterLink, ProductCard, SkeltonLoader],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']   // ✅ fixed (was styleUrl)
})
export class ProductList implements OnInit {

  // Forms Fields
  allProducts = signal<ProductModel[]>([]);
  isLoading = signal<boolean>(false);

  selectedCategories = signal<any[]>([]);
  selectedBrands = signal<any[]>([]);
  maxPrice = signal<number>(0);
  minPrice = signal<number>(0);
  priceRange = signal<number[]>([0]);

  searchQuery = signal<string>('');

  selectedStorage = '';
  selectedProcessor = '';

  isMobileView = signal<boolean>(false);
  isFilterDrawerOpen = signal<boolean>(false);

  brands = signal<any[]>([]);
  categories = signal<any[]>([]);

  categoryId = signal<string>('');
  sortOption = signal<string>('featured');

  get sortOptionValue() {
    return this.sortOption();
  }
  set sortOptionValue(value: string) {
    this.sortOption.set(value);
  }
  get priceRangeValue() {
    return this.priceRange();
  }

  viewMode = signal<'grid' | 'list'>('grid');
  filteredProducts = signal<any[]>([]);
  isCategoryRoute = signal<boolean>(false);

  private readonly seoService = inject(Seo);
  private readonly route = inject(ActivatedRoute);
  public cartService = inject(CartService);
  private readonly productService = inject(Product);
  private readonly platformId = inject(PLATFORM_ID);
  public readonly homeService = inject(HomeService);

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isFilterDrawerOpen()) {
      this.toggleFilterDrawer();
    }
  }

  ngOnInit(): void {
    // Check initial screen size
    this.checkScreenSize();

    this.route.queryParams.subscribe(params => {
      this.isCategoryRoute.set(false);
      if (params['search']) {
        this.searchQuery.set(params['search']);
        this.filterProducts();
      } else if (params['category']) {
        this.categoryId.set(params['category']);
        this.isCategoryRoute.set(true);
      }
    });
    this.loadCategoryAndBrandData();
    if (!this.isCategoryRoute()) {
      this.loadAllProducts();
    } else {
      this.loadCategoryProducts(this.categoryId());
    }

    // Set SEO tags
    this.seoService.updateMetaTags({
      title: 'Shop Computers, Laptops & Accessories | Computer Shop',
      description: 'Browse our selection of high-quality laptops, desktops, and computer accessories. Filter by brand, category, and specifications to find the perfect computer for your needs.',
      keywords: 'computers, laptops, accessories, gaming PC, business laptops, shop computers',
      url: 'https://shoppyness.com/products'
    });

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadCategoryAndBrandData(): void {
        forkJoin({
          brand: this.homeService.getBrand(),
          category: this.homeService.getCategories()
        }).subscribe({
          next: (res: any) => {
            this.brands.set(res.brand?.data);
            this.categories.set(res.category?.data);
          },
          error: (err) => {
            console.error('Error fetching data', err);
          }
        })
  }
  private loadAllProducts(): void {
    this.productService.getProduct().subscribe({
      next: (product: any) => {
        this.allProducts.set(product.data);
        this.filteredProducts.set(product.data);

        const prices = product.data.map((p: any) => p.price || 0);
        this.minPrice.set(Math.min(...prices));
        this.maxPrice.set(Math.max(...prices));
        this.priceRange.set([this.minPrice(), this.maxPrice()]);
        this.isLoading.set(false);
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  private loadCategoryProducts(categoryId: string): void {
    this.productService.getProductByCategoryId(categoryId).subscribe({
      next: (res: any) => {
        this.allProducts.set(res.data);
        this.filteredProducts.set(res.data);

        const prices = res.data.map((p: any) => p.price || 0);
        this.minPrice.set(Math.min(...prices));
        this.maxPrice.set(Math.max(...prices));
        this.priceRange.set([this.minPrice(), this.maxPrice()]);
        this.isLoading.set(false);
      },
      error: (err) => console.error('Error loading category products:', err)
    });
  }

  // Check if we're in mobile view
  checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobileView.set(window.innerWidth < 768);
      // Close filter drawer when switching to desktop
      if (!this.isMobileView()) {
        this.isFilterDrawerOpen.set(false);
      }
    } else {
      this.isMobileView.set(false);
    }
  }

  // Toggle filter drawer for mobile
  toggleFilterDrawer(): void {
    this.isFilterDrawerOpen.set(!this.isFilterDrawerOpen());

    if (isPlatformBrowser(this.platformId)) {
      if (this.isFilterDrawerOpen()) {
        document.body.classList.add('filter-drawer-open');
        document.body.style.height = document.documentElement.scrollHeight + 'px';
      } else {
        document.body.classList.remove('filter-drawer-open');
        document.body.style.height = '';
      }
    }
  }

  applyFiltersAndClose(): void {
    this.filterProducts();
    if (this.isMobileView()) {
      this.toggleFilterDrawer();
    }
  }

  toggleCategory(category: string): void {
    if (this.selectedCategories().includes(category)) {
      this.selectedCategories.set(
        this.selectedCategories().filter(c => c !== category)
      );
    } else {
      this.selectedCategories.update(cats => [...cats, category]);
    }
    if (!this.isMobileView()) this.filterProducts();
  }

  toggleBrand(brand: string): void {
    if (this.selectedBrands().includes(brand)) {
      this.selectedBrands.set(
        this.selectedBrands().filter(b => b !== brand)
      );
    } else {
      this.selectedBrands.update(brands => [...brands, brand]);
    }
    if (!this.isMobileView()) this.filterProducts();
  }

  filterProducts(): void {
    this.productService
      .filterProduct(this.selectedCategories(), this.selectedBrands(), this.priceRangeValue)
      .subscribe((res: any) => {
        this.filteredProducts.set(res.data);
      });
  }

  sortProducts(): void {
    let sorted = [...this.filteredProducts()];
    switch (this.sortOption()) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'featured':
      default:
        sorted.sort((a, b) => Number(a.id) - Number(b.id));
        break;
    }
    this.filteredProducts.set(sorted);
  }

  resetFilters(): void {
    this.selectedCategories.set([]);
    this.selectedBrands.set([]);
    this.priceRange.set([this.minPrice(), this.maxPrice()]);
    this.selectedStorage = '';
    this.selectedProcessor = '';
    this.searchQuery.set('');
    this.filterProducts();
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('filter-drawer-open');
      document.body.style.height = '';
    }
  }

   // Add product to cart
  addToCart(product: any): void {
    const payload = {
      productId: product,
      quantity: 1,
      variant: null
    }
    // Add product to cart through CartService
    this.cartService.addToCart(payload).subscribe({
      next: (res: any) => {
        // this.isAddingToCart.set(false);
        // // Clear success message after 3 seconds
        // setTimeout(() => {
        //   this.addedToCartMessage.set('');
        // }, 3000);
      },
      error: (error: Error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }
}
