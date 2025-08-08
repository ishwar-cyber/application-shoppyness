import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, tap, takeUntil, switchMap, EMPTY, catchError, of, finalize, Observable } from 'rxjs';
import { Product } from '../../services/product';
import { Seo } from '../../services/seo';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Cart } from '../../services/cart';
import { ProductModel, ResponsePayload } from '../../commons/models/product.model';
import { FormsModule } from '@angular/forms';
import { cartSignal } from '../../commons/store';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule,FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit{
  private readonly destroy$ = new Subject<void>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seoService = inject(Seo);
  private readonly productService = inject(Product);
  public cartService = inject(Cart);
  private readonly platformId = inject(PLATFORM_ID);
  
  // Product signals
  product = signal<any| null>(null);
  relatedProducts = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');
  
  // Add to cart states
  isAddingToCart = signal<boolean>(false);
  quantity = signal<number>(1);
  addedToCartMessage = signal<string>('');
  
  // Location popup states
  showLocationPopup = signal<boolean>(false);
  userLocation = signal<string>('');
  deliveryCheckInput$ = new Subject<string>();
  punePincodes = signal<string[]>([
    '411001', // Pune City Central
    '411002', // Camp, Pune
    '411004', // Shivaji Nagar
    '411005', // Deccan Gymkhana
    '411006', // Kothrud
    '411007', // Aundh
    '411009', // Viman Nagar
    '411014', // Hadapsar
    '411027', // Hinjewadi
    '411028'  // Baner
  ]);
  deliveryAvailable = signal<boolean>(true);
  deliveryDate = signal<string>('');
  deliveryChecking = signal<boolean>(false);
  
  // Image gallery states
  selectedImageIndex = signal<number>(0);
  
  // Product cache to improve navigation performance
  private readonly productCache = new Map<number, Product>();
  
  constructor() {
    // Initialize delivery check with debounce
    this.deliveryCheckInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.deliveryChecking.set(true)),
      takeUntil(this.destroy$)
    ).subscribe(pincode => {
      this.checkDeliveryAvailability(pincode);
    });
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.route.params.subscribe((params) => {
      const productId = params['id'];
      if (!productId) return;

      this.loading.set(true);

      this.productService.getProductById(productId).subscribe({
        next: (res: ResponsePayload) => {
          console.log('Product fetched:', res.data);
          this.loading.set(false);
          this.loading.set(false);

          this.product.set(res.data)
          // this.product.set(res.data);

          if (this.product()) {
            this.updateSeoTags(this.product());
          }
        },
        error: (err) => {
          console.error('Failed to fetch product:', err);
          this.loading.set(false);
        }
      });
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Load related products from API
  private loadRelatedProducts(productId: string): void {
    this.productService.getRelatedProducts(productId).subscribe((products: any) => {
      this.relatedProducts.set(products);
      
      // Preload images for better performance
      if (products.length > 0) {
        this.preloadRelatedProductImages();
      }
    });
  }
  
  // Update SEO tags
  private updateSeoTags(product: any): void {
    this.seoService.updateMetaTags({
      title: `${product.name} - ${product.brand} | Computer Shop`,
      description: product.description,
      keywords: `${product.name}, ${product.brand}, ${product.category}, computer, laptop, desktop`,
      image: product.image,
      url: `https://computershop.com/products/${product.id}`
    });
  }

  // Add product to cart
  addToCart(product: any): void {
    // Add product to cart through CartService
    const cartPayload = {
      productId: product.id,
      quantity: this.quantity()
    }
    this.cartService.addToCart(cartPayload).subscribe({
      next: (res: any) => {
       cartSignal.set(res.data.itemCount);
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.addedToCartMessage.set('');
        }, 3000);
      },
      error: (error: Error) => {
        console.error('Error adding to cart:', error);
        this.addedToCartMessage.set('Failed to add to cart. Please try again.');
      }
    });
  }

  // Location popup methods
  toggleLocationPopup(): void {
    this.showLocationPopup.update(val => !val);
  }

  // Handle input change for delivery check
  onDeliveryPincodeChange(pincode: string): void {
    this.userLocation.set(pincode);
    
    if (!pincode.trim() || pincode.length !== 6) {
      this.deliveryAvailable.set(false);
      this.deliveryDate.set('');
      return;
    }
    
    // Push to subject for debounced processing
    this.deliveryCheckInput$.next(pincode);
  }

  // Check delivery availability
  private checkDeliveryAvailability(pincode: string): void {
    if (!pincode || pincode.length !== 6) {
      this.deliveryChecking.set(false);
      this.deliveryAvailable.set(false);
      this.deliveryDate.set('');
      return;
    }
    
    // Mock validation - assume valid pincodes are 6 digits
    const isValidPincode = /^\d{6}$/.test(pincode);
    
    if (!isValidPincode) {
      this.deliveryChecking.set(false);
      this.deliveryAvailable.set(false);
      this.deliveryDate.set('');
      return;
    }
    
    // Simulate API call with timeout
    setTimeout(() => {
      // For Pune pincodes, use a more realistic availability check
      const isPunePincode = this.punePincodes().includes(pincode);
      
      // For Pune pincodes, all are available except 411004 and 411028
      if (isPunePincode) {
        const unavailablePincodes = ['411004', '411028'];
        const isAvailable = !unavailablePincodes.includes(pincode);
        
        this.deliveryAvailable.set(isAvailable);
        
        if (isAvailable) {
          // Calculate a faster delivery date for Pune (1-3 days)
          const days = Math.floor(Math.random() * 3) + 1; // Random number between 1-3
          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + days);
          
          // Format the date
          const options: Intl.DateTimeFormatOptions = { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          };
          this.deliveryDate.set(deliveryDate.toLocaleDateString('en-US', options));
        } else {
          this.deliveryDate.set('');
        }
      } else {
        // For non-Pune pincodes, use the original logic (odd/even)
        const lastDigit = parseInt(pincode.charAt(pincode.length - 1));
        const isAvailable = lastDigit % 2 === 0;
        
        this.deliveryAvailable.set(isAvailable);
        
        if (isAvailable) {
          // Calculate a delivery date (2-5 days from now)
          const days = Math.floor(Math.random() * 3) + 2; // Random number between 2-4
          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + days);
          
          // Format the date
          const options: Intl.DateTimeFormatOptions = { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          };
          this.deliveryDate.set(deliveryDate.toLocaleDateString('en-US', options));
        } else {
          this.deliveryDate.set('');
        }
      }
      
      this.deliveryChecking.set(false);
    }, 800); // Simulate network delay
  }
  
  // Get delivery date estimate for a pincode - memoized for performance
  getDeliveryEstimate(pincode: string): string {
    const isPunePincode = this.punePincodes().includes(pincode);
    
    // Calculate delivery date
    const days = isPunePincode ? 
      (Math.floor(Math.random() * 3) + 1) : // 1-3 days for Pune
      (Math.floor(Math.random() * 3) + 2);  // 2-4 days for others
      
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);
    
    // Format the date
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return deliveryDate.toLocaleDateString('en-US', options);
  }
  
  // Get the currently selected image
get selectedImage(): string {
  const images = this.product()?.images;
  
  // If no images exist at all
  if (!images || images.length === 0) {
    return '';
  }

  // Handle case where images is an array
  if (Array.isArray(images)) {
    const index = this.selectedImageIndex();
    // Ensure index is within bounds
    const selectedImage = images[Math.max(0, Math.min(index, images.length - 1))];
    return selectedImage?.url ?? '';
  }

  // Handle case where images is a single image object
  if (images.url) {
    return images.url;
  }

  // Final fallback
  return '';
}
  
  // Set the selected image by index
  selectImage(index: number): void {
    const product = this.product();
    if (!product?.images) return;
    if (index >= 0 && index < product.images.length) {
      this.selectedImageIndex.set(index);
    }
  }
  
  // Navigate to the next image
  // nextImage(): void {
  //   const product = this.product();
  //   if (!product?.images?.length || product.images.length <= 1) return;
  //   const nextIndex = (this.selectedImageIndex() + 1) % product.images.length;
  //   this.selectedImageIndex.set(nextIndex);
  // }
  
  // // Navigate to the previous image
  // prevImage(): void {
  //   const product = this.product();
  //   if (!product?.images?.length || product.images.length <= 1) return;
  //   const prevIndex = (this.selectedImageIndex() - 1 + product.images.length) % product.images.length;
  //   this.selectedImageIndex.set(prevIndex);
  // }

private updateImageIndex(offset: number): void {
  const images = this.product()?.images ?? [];
  if (images.length <= 1) return;

  const currentIndex = this.selectedImageIndex();
  const newIndex = (currentIndex + offset + images.length) % images.length;
  this.selectedImageIndex.set(newIndex);
}

nextImage(): void {
  this.updateImageIndex(1);
}

prevImage(): void {
  this.updateImageIndex(-1);
}

  // Navigate to related product with smooth scroll
  navigateToProduct(productId: number): void {
    // Log analytics event
    console.log(`Product clicked: ${productId}`);

    // Smooth scroll to top before navigation
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Navigate to product detail page
    this.router.navigate(['/products', productId]);
  }
  
  // Preload images for better performance
  preloadImages(imageUrls: string[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }
  
  // Preload related product images
  preloadRelatedProductImages(): void {
    const relatedImages = this.relatedProducts()
      .map(product => product.image);
    
    this.preloadImages(relatedImages);
  }

}
