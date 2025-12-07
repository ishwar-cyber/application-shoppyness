import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Seo } from '../../services/seo';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../services/product';
import { HomeService } from '../../services/home';
import { forkJoin } from 'rxjs';
interface Category {
  id:string,
  slug:string,
  name: string,
  image?:image,
  isactive: boolean
}

interface image {
  url: string,
  public_id: string
}
@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, ProductCard],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit{
  products = signal<any[]>([]); // Show only first 4 products
  
  // Default placeholder
  defaultImage = 'https://via.placeholder.com/200x150?text=Loading...';
  categories = signal<Category[]>([]);
  brands = signal<any[]>([]);
  info = signal<any>([
    { title: 'Free Shipping', description: 'On orders over $50', icon: 'bi-truck' },
    { title: '24/7 Support', description: 'We are here to help', icon: 'bi-headset' },
    { title: 'Secure Payment', description: '100% secure payment', icon: 'bi-shield-lock' },
    { title: 'Easy Returns', description: '30-day return policy', icon: 'bi-arrow-counterclockwise' }
  ]);

  bannerImages = signal([
    { id: 1, url: 'assets/banners/banner_1.png', alt: 'Latest Deals Electronics' },
    { id: 2, url: 'assets/banners/banner_2.png', alt: 'New Launches Gadgets' },
    { id: 3, url: 'assets/banners/banner_3.png', alt: 'Best Discounts on Accessories' }
  ]);

  currentSlide = signal(0);

  autoSlideInterval: any;
  private readonly product = inject(Product);
  private readonly home = inject(HomeService)
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  constructor() {}

  private readonly seoService = inject(Seo);
  private readonly homeService = inject(HomeService);

  ngOnInit(): void {
    // Set SEO meta tags for home page
     this.startAutoSlide();
    this.seoService.updateMetaTags({
      title: 'Computer Shop - Premium Laptops, Desktops & Accessories',
      description: 'Shop the latest laptops, desktops, and computer accessories at the best prices. Free shipping, extended warranty, and expert support available.',
      keywords: 'computer shop, laptops, desktops, computer accessories, gaming PC, business laptops, Acer, Dell, HP, Lenovo, Apple',
      image: '/assets/og-image.jpg',
      url: 'https://shoppyness.com'
    });
    forkJoin({
      product: this.product.getProduct(),
      brand: this.home.getBrand(),
      category: this.home.getCategories()
    }).subscribe({
      next: (res: any) => {
        this.products.set(res.product?.data);
        this.brands.set(res.brand?.data);
        this.categories.set(res.category?.data);
      },
      error: (err) => {
        console.error('Error fetching data', err);
      }
    })

    this.homeService.getCategoryAndSubcategory();
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 4500);
  }

  
  getCategoryIcon(category: string): string {
    switch(category.toLowerCase()) {
      case 'laptop':
        return 'bi-laptop';
      case 'desktop':
        return 'bi-pc-display';
      case 'accessories':
        return 'bi-keyboard';
      case 'gaming':
        return 'bi-controller';
      default:
        return 'bi-box';
    }
  }

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({ left: -220, behavior: 'smooth' });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({ left: 220, behavior: 'smooth' });
  }
    nextSlide() {
    const total = this.bannerImages().length;
    this.currentSlide.set((this.currentSlide() + 1) % total);
  }
    goToSlide(index: number) {
    this.currentSlide.set(index);
  }

  prevSlide() {
    const total = this.bannerImages().length;
    this.currentSlide.set(
      (this.currentSlide() - 1 + total) % total
    );
  }
}

