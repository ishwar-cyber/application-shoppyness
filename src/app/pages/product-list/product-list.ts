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

  selectedCategories = signal<string[]>([]);
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
    this.productService.getProduct().subscribe({
      next:(product: any) =>{
        console.log('prodiuct listiong', product);
        this.allProducts.set(product.data)
        this.filteredProducts.set(product.data);
          // Extract prices
        const prices = product.data.map((p: any) => p.price || 0);

        // Calculate min and max
        this.minPrice.set(Math.min(...prices));
        this.maxPrice.set(Math.max(...prices));
        this.priceRange.update(price =>[this.minPrice() , this.maxPrice()]);
        console.log('Min Price:', this.minPrice());
        console.log('Max Price:', this.maxPrice());
      }, error :(error) =>{
        
      }
    })
    // Set SEO tags
    this.seoService.updateMetaTags({
      title: 'Shop Computers, Laptops & Accessories | Computer Shop',
      description: 'Browse our selection of high-quality laptops, desktops, and computer accessories. Filter by brand, category, and specifications to find the perfect computer for your needs.',
      keywords: 'computers, laptops, accessories, gaming PC, business laptops, shop computers',
      url: 'https://computershop.com/products'
    });
    
    // Simulate loading data with a delay
    setTimeout(() => {
      // Extract unique categories, brands, and specs for filters
     this.categories.set([
        ...new Set(
          this.allProducts()
            .flatMap(p => {
              console.log("Product categories:", p?.category);
              return p?.category?.map(c => c?.name) || [];
            })
            .filter(Boolean)
        )
      ]);
      this.brands.set([...new Set(this.allProducts().map(p => p?.brand?.name ))]);      
      // this.ramOptions = [...new Set(this.allProducts.map(p => p.variants.ram))];
      // this.storageOptions = [...new Set(this.allProducts.map(p => p.variants.ssd))];
      // this.processorOptions = [...new Set(this.allProducts.map(p => p.variants.processor))];
      
      // Apply initial filters
      this.filterProducts();
      
      // Set loading to false once data is ready
      this.isLoading.set(false);
    }, 1000); // 1 second delay to simulate network request
    
    // Subscribe to query params for search functionality
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
        this.filterProducts();
      }
    });
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
    this.isFilterDrawerOpen.set(false);
    
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
  
  // Filter toggles
  toggleCategory(category: string): void {
    if (this.selectedCategories().includes(category)) {
      this.selectedCategories.set(this.selectedCategories().filter(c => c !== category));
    } else {
      this.selectedCategories.update(categories => [...categories, category]);
    }
    
    if (!this.isMobileView()) {
      this.filterProducts();
    }
  }
  
  toggleBrand(brand: string): void {
    if (this.selectedBrands().includes(brand)) {
      this.selectedBrands.set(this.selectedBrands().filter(b => b !== brand));
    } else {
      this.selectedBrands.update(brands => [...brands, brand]);
    }
    
    if (!this.isMobileView) {
      this.filterProducts();
    }
  }
  
  // Main filter function
  filterProducts(): void {
    this.filteredProducts.set(this.allProducts().filter(product => {
      // Search query filter
      if (this.searchQuery) {
        const query = this.searchQuery().toLowerCase().trim();
        const matchesSearch = 
          product.name?.toLowerCase().includes(query) || 
          product?.brand?.name?.toLowerCase().includes(query) || 
          // product.category?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query);
        
        if (!matchesSearch) {
          return false;
        }
      }
      
      // Category filter
      // if (this.selectedCategories.length > 0 && !this.selectedCategories().includes(product.category)) {
      //   return false;
      // }
      
      // Brand filter
      if (this.selectedBrands().length > 0 && !this.selectedBrands()?.includes(product?.brand?.name)) {
        return false;
      }
      // Price range filter
      if (product.price < this.priceRange()[0] || product.price > this.priceRange()[1]) {
        return false;
      }
      
      // // RAM filter
      // if (this.selectedRAM && product.variants.ram !== this.selectedRAM) {
      //   return false;
      // }
      
      // // Storage filter
      // if (this.selectedStorage && product.variants.ssd !== this.selectedStorage) {
      //   return false;
      // }
      
      // // Processor filter
      // if (this.selectedProcessor && product.variants.processor !== this.selectedProcessor) {
      //   return false;
      // }
      
      return true;
    }));
    
    // Apply sorting after filtering
    this.sortProducts();
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
