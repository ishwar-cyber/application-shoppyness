import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { ProductModel } from '../../commons/models/product.model';
import { ProductCard } from '../../components/product-card/product-card';
import { Seo } from '../../services/seo';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';
import { Product } from '../../services/product';
import { log } from 'console';
import { strict } from 'assert';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, RouterModule, RouterLink, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit{

  // Forms Fields
  allProducts = signal<ProductModel[]>([]);
  // filterProducts = signal<ProductModel[]>([]);
  isLoading = signal<boolean>(false);

  selectedCategories = signal<any[]>([]);
  selectedBrands = signal<any[]>([]);
  maxPrice = signal<number>(0);
  minPrice = signal<number>(0);
  priceRange = signal<number[]>([0]);

  searchQuery = signal<string>('');

  selectedStorage = '';
  selectedProcessor = ''

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

   @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
      this.checkScreenSize();
    }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent){
   if(event.key === 'Escape' && this.isFilterDrawerOpen()){
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
      } else if(params['category']){
        this.categoryId.set(params['category']);
        this.isCategoryRoute.set(true);
      }
    });

    if(!this.isCategoryRoute()){
        this.productService.getProduct().subscribe({
          next:(product: any) =>{
            console.log('listed product', product);
            
            this.allProducts.set(product.data)
            this.filteredProducts.set(product.data);
            const prices = product.data.map((p: any) => p.price || 0);
            this.minPrice.set(Math.min(...prices));
            this.maxPrice.set(Math.max(...prices));
            this.priceRange.update(price =>[this.minPrice() , this.maxPrice()]);
          }, error :(error) =>{}
        })
    } else{
      this.productService.getProductByCategoryId(this.categoryId()).subscribe({
        next:(res:any)=>{
          this.allProducts.set(res.data)
          this.filteredProducts.set(res.data);
          const prices = res.data.map((p: any) => p.price || 0);
          this.minPrice.set(Math.min(...prices));
          this.maxPrice.set(Math.max(...prices));
          this.priceRange.update(price =>[this.minPrice() , this.maxPrice()]);
        }
      });
    }
  
    // Set SEO tags
    this.seoService.updateMetaTags({
      title: 'Shop Computers, Laptops & Accessories | Computer Shop',
      description: 'Browse our selection of high-quality laptops, desktops, and computer accessories. Filter by brand, category, and specifications to find the perfect computer for your needs.',
      keywords: 'computers, laptops, accessories, gaming PC, business laptops, shop computers',
      url: 'https://computershop.com/products'
    });
     if(isPlatformBrowser(this.platformId)){
      window.scrollTo({top:0, behavior:'smooth'})
    }
    // Simulate loading data with a delay
    // setTimeout(() => {
      // Extract unique categories, brands, and specs for filters
      console.log('this.allProducts()', this.allProducts());
      
     this.categories.set([
        ...new Set(
          this.allProducts()
            .flatMap(p => {
              return p?.category?.map(c => c?.name) || [];
            })
            .filter(Boolean)
        )
      ]);
      console.log(this.categories());
      
      this.brands.set([...new Set(this.allProducts().map(p => p?.brand?.name ))]);      
      // this.ramOptions = [...new Set(this.allProducts.map(p => p.variants.ram))];
      // this.storageOptions = [...new Set(this.allProducts.map(p => p.variants.ssd))];
      // this.processorOptions = [...new Set(this.allProducts.map(p => p.variants.processor))];
    
      // Set loading to false once data is ready
      this.isLoading.set(false);
    // }, 1000); // 1 second delay to simulate network request
    
    // Subscribe to query params for search functionality
  
  }
  
  // Check if we're in mobile view
  checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobileView.set(window.innerWidth < 768);
      // Close filter drawer when switching to desktop
      if (!this.isMobileView) {
        this.isFilterDrawerOpen.set(false);
      }
    } else {
      this.isMobileView.set(false);
    }
  }
  
  // Toggle filter drawer for mobile
  toggleFilterDrawer(): void {
    this.isFilterDrawerOpen.set(!this.isFilterDrawerOpen());
    
    // Manage body class for filter drawer - only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      if (this.isFilterDrawerOpen()) {
        document.body.classList.add('filter-drawer-open');
        // Make sure we can still see the footer by adjusting the body height
        document.body.style.height = document.documentElement.scrollHeight + 'px';
      } else {
        document.body.classList.remove('filter-drawer-open');
        document.body.style.height = '';
      }
    }
  }
  
  // Apply filters and close drawer on mobile
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
  // Main filter function
filterProducts(): void {
  this.productService.filterProduct(this.selectedCategories(), this.selectedBrands(), this.minPrice(), this.maxPrice()).subscribe((res: any) => {
      this.filteredProducts.set(res.data);
    });  
}
  
  // Sort products based on selected option
  sortProducts(): void {
    switch (this.sortOption()) {
      case 'price-low':
        this.filteredProducts().sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts().sort((a, b) => b?.price - a?.price);
        break;
      case 'name-asc':
        this.filteredProducts().sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        this.filteredProducts().sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'featured':
      default:
        // Sort by ID as default (assuming lower IDs are featured items)
        this.filteredProducts().sort((a, b) => Number(a.id) - Number(b.id));
        break;
    }
  }
  
  // Reset all filters
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
    // Clean up any modifications to the document body when component is destroyed
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('filter-drawer-open');
      document.body.style.height = '';
    }
  }
}
