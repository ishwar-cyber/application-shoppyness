import { CommonModule, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, HostListener, inject, OnInit, PLATFORM_ID, Input, Output, EventEmitter, signal, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Seo } from '../../services/seo';
import { CartService } from '../../services/cart';
import { Product } from '../../services/product';
import { HomeService } from '../../services/home';
import { ProductModel } from '../../commons/models/product.model';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
    animations: [
    trigger('cardClick', [
      state('default', style({ transform: 'scale(1)', opacity: 1 })),
      state('clicked', style({ transform: 'scale(0.95)', opacity: 0.6 })),
      transition('default → clicked', animate('200ms ease-in'))
    ])
  ],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']
})
export class ProductList implements OnInit {
  animationState = 'default';
  // -------------------------------------------
  // ❤️ REUSABLE COMPONENT INPUTS / OUTPUTS
  // -------------------------------------------
  @Input() mode: 'category' | 'subcategory' | 'search' | 'external'= 'external';
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

  // -------------------------------------------
  // Inject Services (Unchanged)
  // -------------------------------------------
  private readonly seo = inject(Seo);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly cartService = inject(CartService);
  private readonly productService = inject(Product);
  private readonly homeService = inject(HomeService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scroller = inject(ViewportScroller);

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
    // console.log('changes' , changes?.['apiParams']['currentValue']);
    //     if (this.mode === 'external' && this.products) {  
    //   this.prepareProductList(this.products);
    //   this.isLoading.set(false);
    // }
    this.mode = sessionStorage.getItem('mode') as any || this.mode;
    this.setupFromRoute();
  }
  // -------------------------------------------
  // INIT
  // -------------------------------------------
  ngOnInit() {
    this.isLoading.set(true);
    this.mode = sessionStorage.getItem('mode') as any || 'default';  
    this.isMobileView.set(isPlatformBrowser(this.platformId) ? window.innerWidth <= 768 : false);
    this.checkScreenSize();
    this.scroller.scrollToPosition([0, 0]);

    // -------------------------
    // CASE 1: External products
    // -------------------------
    if (this.mode === 'external' && this.products) {
      this.prepareProductList(this.products);
      this.isLoading.set(false);
      this.loadAllProducts();
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

  setupFromRoute() {
    this.isLoading.set(true);
    // CATEGORY
    if (this.mode === 'category') {
      this.categorySlug.set(this.apiParams.slug || '');
      this.loadCategoryProducts(this.categorySlug());
      return;
    }

    // SUBCATEGORY
    if (this.mode === 'subcategory') {
      console.log('sub category', this.apiParams);
      
      this.subCategorySlug.set(this.apiParams.slug || '');
      this.loadCategoryProducts(this.subCategorySlug());
      return;
    }

    // SEARCH
    if (this.mode === 'search') {
      this.searchQuery.set(this.apiParams.search || '');
      this.loadSearchProducts();
      return;
    }

    // DEFAULT (Your original behavior)
    this.route.paramMap.subscribe((params: any) => {
      const p = params.params;
      this.categorySlug.set(p['catSlug'] || p['slug'] || '');
      this.subCategorySlug.set(p['subSlug'] || '');

      if (p['search']) {
        this.searchQuery.set(p['search']);
      }

      this.loadDataBasedOnRoute();
    });

    this.loadQueryParams();
  }

  loadQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['cat']) this.selectedCategories.set(params['cat'].split(','));
      if (params['brand']) this.selectedBrands.set(params['brand'].split(','));

      if (params['min'] && params['max']) {
        this.priceRange.set([Number(params['min']), Number(params['max'])]);
      }

      this.filterProducts();
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

    this.loadAllProducts();
  }

  loadAllProducts() {
    this.productService.getProduct().subscribe(res => {
      this.prepareProductList(res.data);
    });
  }

  loadCategoryProducts(slug: string) {
    this.productService.getProductByCategoryId(slug).subscribe((res: any) => {
      console.log('response', res);
      this.prepareProductList(res.data);
    });
  }

  loadSearchProducts() {
    this.productService.searchProducts(this.searchQuery()).subscribe((res: any) => {
      this.prepareProductList(res.data);
    });
  }

  // ----------------------------------------------------
  // Prepare Products (Unchanged)
  // ----------------------------------------------------
  private prepareProductList(data: any[]) {
    const prices = data.map((p: any) => p.price || 0);

    this.minPrice.set(Math.min(...prices));
    this.maxPrice.set(Math.max(...prices));
    this.priceRange.set([this.minPrice(), this.maxPrice()]);

    this.allProducts.set(data);
    this.filteredProducts.set(data);
    this.isLoading.set(false);
  }

  // ----------------------------------------------------
  // FILTER / SORT (Unchanged)
  // ----------------------------------------------------
  filterProducts1() {
    this.productService
      .filterProduct(
        this.selectedCategories(),
        this.selectedBrands(),
        this.priceRange()
      )
      .subscribe((res: any) => this.filteredProducts.set(res.data));
  }

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

  // ----------------------------------------------------
  // BRAND / CATEGORY FILTERS (Unchanged)
  // ----------------------------------------------------
   toggleBrand(brand: string) {
    const list = [...this.selectedBrands()];

    if (list.includes(brand)) {
      this.selectedBrands.set(list.filter(b => b !== brand));
    } else {
      this.selectedBrands.set([...list, brand]);
    }

    this.updateParams();
  }

  /* ----------------------------------------------------------
     PRICE FILTER
  ---------------------------------------------------------- */
  filterProducts() {
    this.isFilterDrawerOpen.set(!this.isFilterDrawerOpen());

    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('filter-drawer-open', this.isFilterDrawerOpen());
    }
    this.updateParams();
  }
   toggleCategory(slug: string) {
    const list = [...this.selectedCategories()];

    if (list.includes(slug)) {
      this.selectedCategories.set(list.filter(c => c !== slug));
    } else {
      this.selectedCategories.set([...list, slug]);
    }

    this.updateParams();
  }
  updateParams() {
    const params: any = {};
    const cat = this.selectedCategories();
    const brand = this.selectedBrands();
    const price = this.priceRange()[1];

    if (cat.length) params['category'] = cat.join(',');
    if (brand.length) params['brand'] = brand.join(',');
    if (price > 0) params['price'] = price;

    // If all empty → remove params → show all products
    const noFilters =
      !cat.length && !brand.length && price === this.priceRange()[0];

    if (noFilters) {
      this.router.navigate([], {
        queryParams: {},
        replaceUrl: true,
      });
      return;
    }

    this.router.navigate([], {
      queryParams: params,
      replaceUrl: true,
    });
  }

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
}
