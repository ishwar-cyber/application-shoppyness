import { CommonModule, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, HostListener, inject, OnInit, PLATFORM_ID, Input, Output, EventEmitter, signal, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { combineLatest } from 'rxjs';
import { Seo } from '../../services/seo';
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product';
import { HomeService } from '../../services/home';
import { ProductModel } from '../../commons/models/product.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ScrollingModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']
})
export class ProductList implements OnInit {
  animationState = 'default';
  // -------------------------------------------
  // ❤️ REUSABLE COMPONENT INPUTS / OUTPUTS
  // -------------------------------------------
  @Input() mode: 'category' | 'subcategory' | 'search' | 'external' = 'external';
  @Input() apiParams: any = {};
  @Input() products: ProductModel[] | null = null;

  @Output() itemClick = new EventEmitter<any>();
  @Output() addToCartEvent = new EventEmitter<any>();

  // -------------------------------------------
  // Original Signals (Unchanged)
  // -------------------------------------------
  allProducts = signal<ProductModel[]>([]);
  filteredProducts = signal<ProductModel[]>([]);
  isLoading = signal<boolean>(true);

  selectedCategories = signal<string>('');
  selectedBrands = signal<string>('');
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
  isBrowser = signal<boolean>(false);
  includeCategoryInFilter = signal<boolean>(false);

  page = signal<number>(1);
  limit = 100;
  hasMore = signal<boolean>(true);
  isFetching = signal<boolean>(false);

  // Prevent multiple automatic loads; trigger once when sentinel is visible
  private loadInitiated = false;
  // -------------------------------------------
  // Inject Services (Unchanged)
  // -------------------------------------------
  private readonly seo = inject(Seo);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly homeService = inject(HomeService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scroller = inject(ViewportScroller);
  @ViewChild('scrollTrigger') scrollTrigger!: ElementRef;
  // Listen window resize
  @HostListener('window:resize') onResize() { this.checkScreenSize(); }

  // Escape key close drawer
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isFilterDrawerOpen()) {
      this.toggleFilterDrawer();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // If mode is 'external' and products are provided
    this.apiParams = changes?.['apiParams'] ? changes?.['apiParams']['currentValue'] : this.mode;
    this.isBrowser.set(isPlatformBrowser(this.platformId));
    if (this.isBrowser()) {
      this.mode = sessionStorage.getItem('mode') as any || this.mode;
    }
    // this.setupFromRoute();
  }
  // -------------------------------------------
  // INIT
  // -------------------------------------------
  ngOnInit() {
    this.isLoading.set(true);
    // this.loadAllProducts();
    if (this.isBrowser()) {
      this.mode = sessionStorage.getItem('mode') as any || this.mode;
    }
    this.isMobileView.set(isPlatformBrowser(this.platformId) ? window.innerWidth <= 768 : false);
    this.checkScreenSize();
    this.scroller.scrollToPosition([0, 0]);

    // -------------------------
    // CASE 1: External products
    // -------------------------
    if (this.mode === 'external' && this.products) {
      console.log('Using external products input', this.products);
      this.prepareProductList(this.products);
      this.isLoading.set(false);
      return;
    }

    // --------------------------
    // CASE 2: API-driven (default)
    // --------------------------
    this.setupFromRoute();
    this.loadCategoryAndBrandData();

    // Default SEO (you may override)
    this.seo.updateMetaTags({
      title: 'Product Listing | Shoppyness',
      description: 'Browse the best products.',
      keywords: 'laptop, mobile, electronics',
      url: 'https://shoppyness.com/products'
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {

        if (
          this.selectedBrands() ||
          this.selectedCategories() ||
          this.searchQuery()
        ) return;

        this.loadAllProducts();
      }
    }, { threshold: 0.5 });

    observer.observe(this.scrollTrigger.nativeElement);
  }

  setupFromRoute() {
    combineLatest([
      this.route.paramMap,
      this.route.queryParams
    ]).subscribe(([params, query]) => {

      const catSlug = params.get('catSlug') || params.get('slug') || '';
      const subSlug = params.get('subSlug') || '';

      this.categorySlug.set(catSlug);
      this.subCategorySlug.set(subSlug);

      const search = params.get('search');
      if (search) {
        this.searchQuery.set(search);
      }

      if (query['brand']) {
        this.selectedBrands.set(String(query['brand']));
      }

      if (query['category']) {
        this.selectedCategories.set(String(query['category']));
      }

      if (query['min'] && query['max']) {
        this.priceRange.set([Number(query['min']), Number(query['max'])]);
      }

      this.includeCategoryInFilter.set(Boolean(query['category']));

      this.applyFilters();
    });
  }

  loadQueryParams() {
    this.route.queryParams.subscribe(params => {

      if (params['brand']) {
        this.selectedBrands.set(String(params['brand']).split(',')[0] || '');
      }

      if (params['category']) {
        this.selectedCategories.set(String(params['category']).split(',')[0] || '');
      }

      if (params['min'] && params['max']) {
        this.priceRange.set([Number(params['min']), Number(params['max'])]);
      }

      this.includeCategoryInFilter.set(Boolean(params['category']));

      // ✅ ONLY place where filters run
      this.applyFilters();
    });
  }

  // -------------------------------------------
  // Load Categories & Brands (Unchanged)
  // -------------------------------------------
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

  // -------------------------------------------
  // Main Loader (Unchanged)
  // -------------------------------------------
  loadDataBasedOnRoute() {
    this.isLoading.set(true);
    if (this.searchQuery()) return this.loadSearchProducts();
    if (this.subCategorySlug()) return this.loadCategoryProducts(this.subCategorySlug());
    if (this.categorySlug()) return this.loadCategoryProducts(this.categorySlug());

    // Defer loading all-products until user scrolls into the viewport sentinel
    // The IntersectionObserver in ngAfterViewInit will call `loadAllProducts()`
    this.isLoading.set(false);
  }

  loadAllProducts() {
    console.log('auto-loading products for page', this.page());
    if (
      this.selectedBrands() ||
      this.selectedCategories() ||
      this.searchQuery()
    ) {
      return; // filtered mode active
    }

    this.isFetching.set(true);
    this.productService.getProduct(this.page(), this.limit).subscribe((res: any) => {
      const newProducts = res.data || [];
      if (newProducts.length < this.limit) {
        this.hasMore.set(false); // no more pages
      }
      this.allProducts.update(prev => [...prev, ...newProducts]);
      this.filteredProducts.set(this.allProducts());
      this.page.update(p => p + 1);
      this.isFetching.set(false);
      this.isLoading.set(false);
    });
  }

  loadCategoryProducts(slug: string) {
    this.resetPagination();
    this.isLoading.set(true);
    this.productService.getProductByCategoryId(slug).subscribe((res: any) => {
      this.isLoading.set(false);
      this.prepareProductList(res.data);
    });
  }
  loadSubCategoryProducts(payload: object) {
    this.resetPagination();
    this.isLoading.set(true);
    this.productService.getProductBySubCategorySlug(payload).subscribe({
      next: (res: any) => {
        this.prepareProductList(res.data);
      }
    })
  }
  loadSearchProducts() {
    this.resetPagination();
    this.productService.searchProducts(this.searchQuery()).subscribe((res: any) => {
      this.prepareProductList(res.data);
    });
  }

  // ----------------------------------------------------
  // Prepare Products (Unchanged)
  // ----------------------------------------------------
  private prepareProductList(data: any[]) {
    console.log('Preparing product list', data);
    // Compute price per product using variants first, then price field, fallback 0
    const prices = data.map((p: any) => p?.variants?.[0]?.price ?? p?.price ?? 0);
    console.log('all prices', prices);

    let min = 0;
    let max = 0;
    if (prices.length > 0) {
      // Use Math.min/Math.max on finite numbers only
      const finitePrices = prices.filter((v: any) => Number.isFinite(v));
      if (finitePrices.length > 0) {
        min = Math.min(...finitePrices);
        max = Math.max(...finitePrices);
      }
    }

    this.minPrice.set(min);
    this.maxPrice.set(max);
    this.priceRange.set([this.minPrice(), this.maxPrice()]);

    this.allProducts.set(data);
    this.filteredProducts.set(data);
    this.isLoading.set(false);
  }

  // ----------------------------------------------------
  // FILTER / SORT (Unchanged)
  // ----------------------------------------------------
  sortProducts() {
    let sorted = [...this.filteredProducts()];

    switch (this.sortOption()) {
      case 'price-low': sorted.sort((a, b) => a.price - b.price); break;
      case 'price-high': sorted.sort((a, b) => b.price - a.price); break;
      case 'name-asc': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
    }

    this.filteredProducts.set(sorted);
  }



  /* ----------------------------------------------------------
     PRICE FILTER
  ---------------------------------------------------------- */
  getProducts() {
    this.resetPagination();
    this.isFilterDrawerOpen.set(!this.isFilterDrawerOpen());
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('filter-drawer-open', this.isFilterDrawerOpen());
    }
    this.updateParams();
  }
  toggleCategory(slug: string) {
    // Single-select: toggle select/deselect
    if (this.selectedCategories() === slug) {
      this.selectedCategories.set('');
      // user deselected category -> do not include in API filters
      this.includeCategoryInFilter.set(false);
    } else {
      this.selectedCategories.set(slug);
      // user explicitly selected category -> include in API filters
      this.includeCategoryInFilter.set(true);
    }
    this.isFilterDrawerOpen.set(false);
    this.updateParams();
  }

  toggleBrand(brand: string) {
    this.selectedBrands.set(
      this.selectedBrands() === brand ? '' : brand
    );

    this.updateParams(); // URL change triggers filter
  }

  updateParams() {
    const params: any = {};

    const brand = this.selectedBrands();
    const priceRange = this.priceRange();
    const category = this.selectedCategories();

    // CATEGORY
    if (category) {
      const isSameAsRoute =
        this.mode === 'category' && category === this.categorySlug();

      params['category'] = isSameAsRoute ? null : category;
    } else {
      params['category'] = null;
    }

    // BRAND
    params['brand'] = brand || null;

    // PRICE
    if (
      priceRange &&
      (priceRange[0] !== this.minPrice() || priceRange[1] !== this.maxPrice())
    ) {
      params['min'] = priceRange[0];
      params['max'] = priceRange[1];
    } else {
      params['min'] = null;
      params['max'] = null;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private getBrandsArray(): string[] {
    const b = this.selectedBrands();
    if (!b) return [];
    return [String(b).trim()].filter(Boolean);
  }

  private getCategoriesArray(): string[] {
    const c = this.selectedCategories();
    if (!c) return [];
    return [String(c).trim()].filter(Boolean);
  }

  private applyFilters() {
    if (this.isFetching()) return;
    const brands = this.getBrandsArray();
    const categories = this.getCategoriesArray();
    const price = this.priceRange();

    if (
      !brands.length &&
      !categories.length &&
      (!price || (price[0] === this.minPrice() && price[1] === this.maxPrice()))
    ) {
      if (this.mode === 'category' && this.categorySlug())
        return this.loadCategoryProducts(this.categorySlug());

      if (this.mode === 'subcategory' && this.subCategorySlug())
        return this.loadSubCategoryProducts({ slug: this.subCategorySlug(), subSlug: '' });

      if (this.mode === 'search' && this.searchQuery())
        return this.loadSearchProducts();

      this.resetPagination();
      this.loadAllProducts();
      return;
    }

    // Only include category filter if allowed (from route, queryparam or user selection)
    const categoriesToSend = this.includeCategoryInFilter() ? categories : [];

    this.isLoading.set(true);
    this.productService.getProduct(undefined, undefined, categoriesToSend, brands, undefined, undefined, price).subscribe({
      next: (res: any) => {
        // Handle server response shape: { products: [], filters: { categories: [], brands: [], priceRange: { min, max } } }
        const data = res?.products ?? res?.data ?? res ?? [];

        // Update dynamic filter options if provided by backend
        const filters = res?.filters ?? res?.data?.filters ?? null;
        if (filters) {
          if (filters.brands) this.brands.set(filters.brands || []);
          if (filters.categories) this.categories.set(filters.categories || []);
          if (filters.priceRange) {
            this.minPrice.set(filters.priceRange.min ?? this.minPrice());
            this.maxPrice.set(filters.priceRange.max ?? this.maxPrice());
            // If current price range is outside new bounds, clamp it
            const pr = this.priceRange();
            const newMin = this.minPrice();
            const newMax = this.maxPrice();
            this.priceRange.set([Math.max(pr[0], newMin), Math.min(pr[1], newMax)]);
          }
        }

        this.prepareProductList(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  resetFilters() {
    this.resetPagination();
    this.selectedBrands.set('');
    this.selectedCategories.set('');
    this.selectedProcessor.set('');
    this.selectedStorage.set('');
    this.searchQuery.set('');
    this.priceRange.set([this.minPrice(), this.maxPrice()]);
    this.getProducts();
  }

  // ----------------------------------------------------
  // FILTER DRAWER (Unchanged)
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
  // Add to Cart (EXTENDED)
  // ----------------------------------------------------
  addToCart(product: any) {

    // 1️⃣ Emit to parent if needed:
    this.addToCartEvent.emit(product);

    // 2️⃣ Original logic
    const payload = {
      productId: product,
      quantity: 1,
      variant: null
    };

    this.cartService.addToCart(payload).subscribe();
  }

  // Cleanup (Unchanged)
  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('filter-drawer-open');
    }
  }
  getProductPrice(product: ProductModel): number {
    return product.variants?.[0]?.price ?? product.price ?? 0;
  }

  resetPagination() {
    this.page.set(1);
    this.hasMore.set(true);
    this.allProducts.set([]);
    this.filteredProducts.set([]);
  }


}
