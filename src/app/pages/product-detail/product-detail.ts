import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, tap, takeUntil, switchMap, EMPTY, catchError, of, finalize, Observable } from 'rxjs';
import { Product } from '../../services/product';
import { Seo } from '../../services/seo';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from '../../services/cart';
import { ProductModel, ResponsePayload, Variant } from '../../commons/models/product.model';
import { FormsModule } from '@angular/forms';
import { cartSignal } from '../../commons/store';
import { ProductCard } from "../../components/product-card/product-card";
import { CheckPincode } from '../../components/check-pincode/check-pincode';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, FormsModule, ProductCard, CheckPincode],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetail implements OnInit{
  private readonly destroy$ = new Subject<void>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seoService = inject(Seo);
  private readonly productService = inject(Product);
  public cartService = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);
  
  selectedVaraint = signal<string>('')
  relatedProductsScroll = viewChild<ElementRef>('relatedProductsScroll');
  // Product signals
  product = signal<any| null>(null);
  relatedProducts = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');
  
  // Add to cart states
  isAddingToCart = signal<boolean>(false);
  quantity = signal<number>(1);
  addedToCartMessage = signal<string>('');
  selectedImageIndex = signal<number>(0);
  private readonly productCache = new Map<number, Product>();

  ngOnInit(): void {
    this.loading.set(true);
    this.route.params.subscribe((params) => {
      const productId = params['id'];
      if (!productId) return;

      this.loading.set(true);

      this.productService.getProductById(productId).subscribe({
        next: (res: ResponsePayload) => {
          this.loading.set(false);
          this.loading.set(false);

          this.product.set(res.data)
          // this.product.set(res.data);
          this.loadRelatedProducts(productId);
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
    if(isPlatformBrowser(this.platformId)){
      window.scrollTo({top:0, behavior:'smooth'})
    }
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
      url: `https://shoppyness.com/products/${product.id}`
    });
  }

  // Add product to cart
  addToCart(product: any): void {
    this.isAddingToCart.set(true);
    // Add product to cart through CartService
    this.cartService.addToCart(product.id, this.quantity()).subscribe({
      next: (res: any) => {
        this.isAddingToCart.set(false);
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

  scrollProducts(direction: 'left' | 'right'){
    if(!isPlatformBrowser(this.platformId) || !this.relatedProductsScroll) return;
    const scrollElement = this.relatedProductsScroll()?.nativeElement;
    const scrollAmount = scrollElement.clientWidth * 0.8;

    if(direction === 'left'){
      scrollElement.scrollBy({left: -scrollAmount, behavior: 'smooth'});
    } else {
      scrollElement.scrollBy({left: scrollAmount, behavior: 'smooth'});

    }
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

  navigateToProduct(productId: number): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  selectVariant(variant:Variant){
    this.selectedVaraint.set(variant.name);
  }
}
