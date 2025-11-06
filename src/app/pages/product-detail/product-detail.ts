import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../../services/product';
import { Seo } from '../../services/seo';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CartService } from '../../services/cart';
import { ProductModel, ResponsePayload, Variant } from '../../commons/models/product.model';
import { FormsModule } from '@angular/forms';
import { ProductCard } from '../../components/product-card/product-card';
import { CheckPincode } from '../../components/check-pincode/check-pincode';
import { ProductReview } from '../../components/product-review/product-review';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCard, CheckPincode, ProductReview],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetail implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seoService = inject(Seo);
  private readonly productService = inject(Product);
  public cartService = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);

  // signals
  product = signal<any | null>(null);
  relatedProducts = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');

  selectedVariant = signal<Variant | null>(null);
  isAddingToCart = signal<boolean>(false);
  quantity = signal<number>(1);
  addedToCartMessage = signal<string>('');
  selectedImageIndex = signal<number>(0);

  @ViewChild('relatedProductsScroll', { static: false }) relatedProductsScroll!: ElementRef<HTMLElement> | undefined;

  ngOnInit(): void {
    this.loading.set(true);

    // subscribe to route params for product id
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const productId = params['slug'];
      if (!productId) return;
      this.loadProduct(productId);
    });
    // scroll to top on browser
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(productId: string) {
    this.loading.set(true);
    this.productService.getProductById(productId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: ResponsePayload) => {
        this.loading.set(false);
        this.product.set(res.data);
        this.selectedImageIndex.set(0);
        this.loadRelatedProducts(productId);
        this.updateSeoTags(res.data);

        // preselect variant logic:
        this.applyVariantSelectionFromQueryOrDefault();
      },
      error: (err) => {
        console.error('Failed to fetch product:', err);
        this.loading.set(false);
        this.error.set('Failed to load product');
      }
    });
  }
 // ✅ Helper computed signal to generate display names
  getVariantName = (product: any, variant: any): string => {
    if (!product) return '';
    if (!variant || !variant.name) return product?.name || '';
    // If name is array, join, else use as string
    const variantName = Array.isArray(variant.name)   ? variant.name.join(' ') : variant.name;
    return `${product?.name || ''}${variantName ? ' - ' + variantName : ''}`;
  };
  private applyVariantSelectionFromQueryOrDefault(): void {
    const prod = this.product();
    if (!prod) return;

    // try query param variantId or route param variantId
    const queryVariantId = this.route.snapshot.queryParamMap.get('variantId');
    const routeVariantId = this.route.snapshot.paramMap.get('variantId');

    const preselectId = queryVariantId ?? routeVariantId ?? null;

    if (prod.variants && prod.variants.length > 0) {
      // prefer passed id if matched, else first variant
      const matched = preselectId ? prod.variants.find((v: Variant) => v._id === preselectId || v.sku === preselectId) : null;
      this.selectedVariant.set(matched || prod.variants[0]);
    } else {
      this.selectedVariant.set(null);
    }
  }

  // Related products
  private loadRelatedProducts(productId: string): void {
    this.productService.getRelatedProducts(productId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (products: any) => {
        this.relatedProducts.set(products || []);
        if (products?.length) this.preloadRelatedProductImages();
      },
      error: (err) => {
        console.warn('Failed to load related products', err);
      }
    });
  }

  private updateSeoTags(product: any): void {
    if (!product) return;
    this.seoService.updateMetaTags({
      title: `${product.name} - ${product.brand?.name ?? product.brand} | Computer Shop`,
      description: product.description,
      keywords: `${product.name}, ${product.brand?.name ?? product.brand}, ${product.category}`,
      image: product.image ?? (product.images && product.images[0]?.url),
      url: `https://shoppyness.com/products/${product.id}`
    });
  }

  // UI helpers
  get selectedImage(): string {
    const images = this.product()?.images;
    if (!images) return '';
    if (Array.isArray(images)) {
      const idx = this.selectedImageIndex();
      const safeIdx = Math.max(0, Math.min(idx, images.length - 1));
      return images[safeIdx]?.url ?? '';
    }
    if ((images as any).url) return (images as any).url;
    return '';
  }

  selectImage(index: number): void {
    const imgs = this.product()?.images ?? [];
    if (!Array.isArray(imgs) || index < 0 || index >= imgs.length) return;
    this.selectedImageIndex.set(index);
  }

  private updateImageIndex(offset: number): void {
    const images = this.product()?.images ?? [];
    if (!Array.isArray(images) || images.length <= 1) return;
    const current = this.selectedImageIndex();
    const next = (current + offset + images.length) % images.length;
    this.selectedImageIndex.set(next);
  }

  nextImage(): void { this.updateImageIndex(1); }
  prevImage(): void { this.updateImageIndex(-1); }

  // Variant selection
  selectVariant(variant: Variant) {
    this.selectedVariant.set(variant);
    // optionally change main image if variant has image
    if (variant?.image && this.product()?.images?.length) {
      // try to find index of variant image in product images
      const imgs = this.product()!.images as any[];
      const idx = imgs.findIndex(i => i.url === variant?.image);
      if (idx >= 0) this.selectedImageIndex.set(idx);
    }
  }

// Add to Cart
addToCart(product: any): void {
  const hasVariants = product?.variants && product.variants.length > 0;
  // pick stock from variant or product
  const stock = hasVariants
    ? (this.selectedVariant()?.stock ?? 0)
    : (product?.stock ?? 0);

  // prevent add if out of stock
  if (stock <= 0) {
    this.addedToCartMessage.set('Selected item is out of stock.');
    setTimeout(() => this.addedToCartMessage.set(''), 3000);
    return;
  }

  this.isAddingToCart.set(true);

  // build payload
  const payload: any = {
    productId: product.id,
    quantity: this.quantity(),
    variantId: this.selectedVariant()?.['_id'] ?? null
  };

  this.cartService.addToCart(payload).pipe(takeUntil(this.destroy$)).subscribe({
    next: () => {
      this.isAddingToCart.set(false);
      this.addedToCartMessage.set('Added to cart successfully.');
      setTimeout(() => this.addedToCartMessage.set(''), 3000);
    },
    error: (err: any) => {
      console.error('Error adding to cart:', err);
      this.isAddingToCart.set(false);
      this.addedToCartMessage.set('Failed to add to cart. Please try again.');
      setTimeout(() => this.addedToCartMessage.set(''), 3000);
    }
  });
}

  // Related products horizontal scroll
  scrollProducts(direction: 'left' | 'right') {
    if (!isPlatformBrowser(this.platformId) || !this.relatedProductsScroll) return;
    const el = this.relatedProductsScroll.nativeElement;
    const amount = el.clientWidth * 0.8;
    if (direction === 'left') el.scrollBy({ left: -amount, behavior: 'smooth' });
    else el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  // Preload helpers
  preloadImages(imageUrls: string[]): void {
    if (!isPlatformBrowser(this.platformId) || !imageUrls?.length) return;
    imageUrls.forEach(url => { const i = new Image(); i.src = url; });
  }

  preloadRelatedProductImages(): void {
    const imgs = this.relatedProducts().map(p => p.image).filter(Boolean);
    this.preloadImages(imgs);
  }

  // small helper for template: computed-like
  currentPrice(): number {
    return this.selectedVariant()?.price ?? this.product()?.price ?? 0;
  }

  currentStock(): number {
    return this.selectedVariant()?.stock ?? this.product()?.stock ?? 0;
  }
}
