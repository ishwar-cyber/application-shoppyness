import { CommonModule, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, HostListener, inject, OnInit, PLATFORM_ID, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Seo } from '../../services/seo';
import { CartService } from '../../services/cart';
import { Product } from '../../services/product';
import { HomeService } from '../../services/home';

import { ProductModel } from '../../commons/models/product.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']
})
export class ProductList implements OnInit {

  // ----------------------------------------------------
  // Signals
  // ----------------------------------------------------
  allProducts = signal<ProductModel[]>([]);
  filteredProducts = signal<ProductModel[]>([]);
  isLoading = signal<boolean>(true);

  selectedCategories = signal<string[]>([]);
  selectedBrands = signal<string[]>([]);
  selectedStorage = signal<string>('');
  selectedProcessor = signal<string>('');
  priceRange = signal<[number, number]>([0, 0]);

  minPrice = signal<number>(0);
  maxPrice = signal<number>(0);

  searchQuery = signal<string>('');
  viewMode = signal<'grid' | 'list'>('grid');
  sortOption = signal<string>('featured');

  brands = signal<any[]>([]);
  categories = signal<any[]>([]);

  categorySlug = signal<string>('');
  subCategorySlug = signal<string>('');

  isMobileView = signal<boolean>(false);
  isFilterDrawerOpen = signal<boolean>(false);

  sortOptionValue: string = '';
  // ----------------------------------------------------
  // Inject Services
  // ----------------------------------------------------
  private readonly seo = inject(Seo);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly cartService = inject(CartService);
  private readonly productService = inject(Product);
  private readonly homeService = inject(HomeService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scroller = inject(ViewportScroller);

  // ----------------------------------------------------
  // Window Resize Listener
  // ----------------------------------------------------
  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  // Close drawer with Escape key
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isFilterDrawerOpen()) {
      this.toggleFilterDrawer();
    }
  }

  // ----------------------------------------------------
  // INIT
  // ----------------------------------------------------
  ngOnInit(): void {
    this.checkScreenSize();
    this.scroller.scrollToPosition([0, 0]);
    this.categorySlug = signal(this.route.snapshot.params['catSlug'] || '');
    this.subCategorySlug = signal(this.route.snapshot.params['subSlug'] || '');
    // Handle route changes (category / sub-category / search)
    this.route.paramMap.subscribe((params: any) => {
      const p = params.params;
      this.categorySlug.set(p['catSlug'] || p['slug'] || '');
      this.subCategorySlug.set(p['subSlug'] || '');

      if (p['search']) {
        this.searchQuery.set(p['search']);
      }
      this.loadDataBasedOnRoute();
    });
    this.loadCategoryAndBrandData();

    // Initial SEO Setup
    this.seo.updateMetaTags({
      title: 'Product Listing | Shoppyness',
      description: 'Browse the best computers, laptops, accessories and more.',
      keywords: 'laptop, mobile, electronics, computers',
      url: 'https://shoppyness.com/products'
    });


    this.route.queryParams.subscribe(params => {
      if (params['cat']) {
        this.selectedCategories.set(params['cat'].split(','));
      }

      if (params['brand']) {
        this.selectedBrands.set(params['brand'].split(','));
      }

      if (params['min'] && params['max']) {
        this.priceRange.set([Number(params['min']), Number(params['max'])]);
      }

      this.filterProducts();
    });

  }

  // ----------------------------------------------------
  // Load Categories & Brands
  // ----------------------------------------------------
  loadCategoryAndBrandData() {
    forkJoin({
      brand: this.homeService.getBrand(),
      category: this.homeService.getCategories()
    }).subscribe({
      next: (res: any) => {
        this.brands.set(res.brand?.data || []);
        this.categories.set(res.category?.data || []);
      }
    });
  }

  // ----------------------------------------------------
  // Main Data Loader (Category/Subcategory/Search)
  // ----------------------------------------------------
  loadDataBasedOnRoute() {
    this.isLoading.set(true);

    // Search only
    if (this.searchQuery()) {
      this.loadSearchProducts();
      return;
    }

    // Sub-category
    if (this.subCategorySlug()) {
      this.loadCategoryProducts(this.subCategorySlug());
      return;
    }

    // Category only
    if (this.categorySlug()) {
      this.loadCategoryProducts(this.categorySlug());
      return;
    }

    // Default: all products
    this.loadAllProducts();
  }

  // ----------------------------------------------------
  // Load ALL Products
  // ----------------------------------------------------
  loadAllProducts() {
    this.productService.getProduct().subscribe({
      next: (res: any) => {
        this.prepareProductList(res.data);
      },
      error: (err) => console.error(err)
    });
  }

  // ----------------------------------------------------
  // Load CATEGORY or SUBCATEGORY
  // ----------------------------------------------------
  loadCategoryProducts(slug: string) {
    this.productService.getProductByCategoryId(slug).subscribe({
      next: (res: any) => {
        this.prepareProductList(res.data);
      },
      error: (err) => console.error(err)
    });
  }

  // ----------------------------------------------------
  // Load SEARCH PRODUCTS
  // ----------------------------------------------------
  loadSearchProducts() {
    this.productService.searchProducts(this.searchQuery()).subscribe({
      next: (res: any) => {
        this.prepareProductList(res.data);
      },
      error: (err) => console.error(err)
    });
  }

  // ----------------------------------------------------
  // Prepare Product List (common function)
  // ----------------------------------------------------
  private prepareProductList(data: any[]) {
    const prices = data.map(p => p.price || 0);

    this.minPrice.set(Math.min(...prices));
    this.maxPrice.set(Math.max(...prices));
    this.priceRange.set([this.minPrice(), this.maxPrice()]);

    this.allProducts.set(data);
    this.filteredProducts.set(data);
    this.isLoading.set(false);
  }

  // ----------------------------------------------------
  // Filter Products
  // ----------------------------------------------------
  filterProducts() {
    this.productService
      .filterProduct(
        this.selectedCategories(),
        this.selectedBrands(),
        this.priceRange()
      )
      .subscribe((res: any) => {
        this.filteredProducts.set(res.data);
      });
  }

  // ----------------------------------------------------
  // Sorting
  // ----------------------------------------------------
  sortProducts() {
    let sorted = [...this.filteredProducts()];

    switch (this.sortOption()) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;

      case 'price-high':
        sorted.sort((x, y) => y.price - x.price);
        break;

      case 'name-asc':
        sorted.sort((c, d) => c.name.localeCompare(d.name));
        break;

      case 'name-desc':
        sorted.sort((j, k) => k.name.localeCompare(j.name));
        break;

      default:
        sorted.sort((y, z) => Number(y.id) - Number(z.id));
        break;
    }

    this.filteredProducts.set(sorted);
  }

  // ----------------------------------------------------
  // Toggle Brand
  // ----------------------------------------------------
toggleBrand(brand: string) {
  let selected = [...this.selectedBrands()];
  console.log('selected brand',selected, 'toggling brand',this.selectedBrands());
  
  if (selected.includes(brand)) {
    selected = selected.filter(b => b !== brand);
  } else {
    selected.push(brand);
  }

  this.selectedBrands.set(selected);

  this.updateUrlParams();
  this.filterProducts();
}


toggleCategory(category: string) {
  let selected = [...this.selectedCategories()];

  if (selected.includes(category)) {
    selected = selected.filter(c => c !== category);
  } else {
    selected.push(category);
  }

  this.selectedCategories.set(selected);

  this.updateUrlParams();
  this.filterProducts();
}



updateUrlParams() {
  const queryParams: any = {};

  // Add brands
  if (this.selectedBrands().length > 0) {
    queryParams.brand = this.selectedBrands().join(',');
  }

  // Add categories (multi select for future use)
  if (this.selectedCategories().length > 0) {
    queryParams.cat = this.selectedCategories().join(',');
  }

  // Add price range
  queryParams.min = this.priceRange()[0];
  queryParams.max = this.priceRange()[1];

  // Update URL without reloading the page
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: queryParams,
    queryParamsHandling: 'merge'
  });
}


  // ----------------------------------------------------
  // Reset Filters
  // ----------------------------------------------------
  resetFilters() {
    this.selectedBrands.set([]);
    this.selectedCategories.set([]);
    this.selectedProcessor.set('');
    this.selectedStorage.set('');
    this.searchQuery.set('');
    this.priceRange.set([this.minPrice(), this.maxPrice()]);
    this.filterProducts();
  }

  // ----------------------------------------------------
  // Filter Drawer (Mobile)
  // ----------------------------------------------------
  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobileView.set(window.innerWidth < 768);
      if (!this.isMobileView()) this.isFilterDrawerOpen.set(false);
    }
  }

  toggleFilterDrawer() {
    this.isFilterDrawerOpen.set(!this.isFilterDrawerOpen());

    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('filter-drawer-open', this.isFilterDrawerOpen());
    }
  }

  // ----------------------------------------------------
  // Add to Cart
  // ----------------------------------------------------
  addToCart(product: any) {
    const payload = {
      productId: product,
      quantity: 1,
      variant: null
    };

    this.cartService.addToCart(payload).subscribe({
      next: () => {},
      error: (err) => console.error(err)
    });
  }

  // Cleanup
  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('filter-drawer-open');
    }
  }
}
