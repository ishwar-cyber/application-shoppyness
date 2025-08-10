import { Component, inject, OnInit, signal } from '@angular/core';
import { Seo } from '../../services/seo';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../services/product';
import { HomeService } from '../../services/home';
import { forkJoin } from 'rxjs';
interface Category {
  id:string,
  name: string,
  image?: string[],
  isactive: boolean
}
@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit{
  products = signal<any[]>([]); // Show only first 4 products
  
  categories = signal<Category[]>([]);
  brands = signal<any[]>(['Acer', 'Dell', 'HP', 'Lenovo', 'Apple']);
  
  // testimonials: Testimonial[] = [
  //   {
  //     name: 'Rahul Sharma',
  //     title: 'Software Developer',
  //     text: 'The gaming laptop I purchased exceeded my expectations. The performance is outstanding and customer service was excellent throughout the buying process.'
  //   },
  //   {
  //     name: 'Priya Patel',
  //     title: 'Graphic Designer',
  //     text: 'As a designer, I needed a powerful workstation that could handle complex projects. Computer Shop helped me find the perfect setup within my budget.'
  //   },
  //   {
  //     name: 'Amit Singh',
  //     title: 'IT Manager',
  //     text: 'We\'ve been purchasing our office equipment from Computer Shop for years. Their business solutions and after-sales support are unmatched in the industry.'
  //   }
  // ];
  private readonly product = inject(Product);
  private readonly home = inject(HomeService)

  constructor(private readonly seoService: Seo) {}

  ngOnInit(): void {
    // Set SEO meta tags for home page
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
        this.products.set(res.product.data);
        this.brands.set(res.brand.data);
        this.categories.set(res.category.data);

        console.log('Products:', this.products());
        console.log('Brands:', this.brands());
        console.log('Categories:', this.categories());
      },
      error: (err) => {
        console.error('Error fetching data', err);
      }
    })
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
}
