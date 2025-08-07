import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { cartSignal } from '../../commons/store';
import { Product } from '../../services/product';

interface CategoryItem {
  name: string;
  slug: string;
  subcategories: SubcategoryItem[];
}

interface SubcategoryItem {
  name: string;
  slug: string;
}
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  searchQuery = '';
  isSearchFocused = false;
  filteredProducts: any[] = [];
  private readonly router = inject(Router);
  public authService = inject(Auth); // Assuming AuthService is available for login state
  private readonly product = inject(Product);
  // Active Category for Mega Menu
  activeCategory: string | null = null;
  
  // Categories data with subcategories
  categories: CategoryItem[] = [
    {
      name: 'Laptops',
      slug: 'laptop',
      subcategories: [
        { name: 'Gaming Laptops', slug: 'gaming-laptop' },
        { name: 'Business Laptops', slug: 'business-laptop' },
        { name: 'Ultrabooks', slug: 'ultrabook' },
        { name: 'Chromebooks', slug: 'chromebook' },
        { name: 'MacBooks', slug: 'macbook' }
      ]
    },
    {
      name: 'Desktops',
      slug: 'desktop',
      subcategories: [
        { name: 'Gaming PCs', slug: 'gaming-pc' },
        { name: 'All-in-One PCs', slug: 'all-in-one' },
        { name: 'Mini PCs', slug: 'mini-pc' },
        { name: 'Workstations', slug: 'workstation' }
      ]
    },
    {
      name: 'Components',
      slug: 'components',
      subcategories: [
        { name: 'Processors', slug: 'cpu' },
        { name: 'Graphics Cards', slug: 'gpu' },
        { name: 'Motherboards', slug: 'motherboard' },
        { name: 'Memory (RAM)', slug: 'ram' },
        { name: 'Storage', slug: 'storage' },
        { name: 'Power Supplies', slug: 'psu' },
        { name: 'Cases', slug: 'case' },
        { name: 'Cooling', slug: 'cooling' }
      ]
    },
    {
      name: 'Monitors',
      slug: 'monitor',
      subcategories: [
        { name: 'Gaming Monitors', slug: 'gaming-monitor' },
        { name: 'Ultrawide Monitors', slug: 'ultrawide' },
        { name: 'Professional Monitors', slug: 'professional-monitor' },
        { name: '4K Monitors', slug: '4k-monitor' }
      ]
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      subcategories: [
        { name: 'Keyboards', slug: 'keyboard' },
        { name: 'Mice', slug: 'mouse' },
        { name: 'Headsets', slug: 'headset' },
        { name: 'Webcams', slug: 'webcam' },
        { name: 'External Storage', slug: 'external-storage' }
      ]
    },
    {
      name: 'Gaming',
      slug: 'gaming',
      subcategories: [
        { name: 'Gaming Chairs', slug: 'gaming-chair' },
        { name: 'Gaming Desks', slug: 'gaming-desk' },
        { name: 'Controllers', slug: 'controller' },
        { name: 'Gaming Accessories', slug: 'gaming-accessories' }
      ]
    }
  ];
  
  // Get cart count
  get cartCount(): number {
    return cartSignal().length;
  }
  
  // Megamenu functions
  showMegaMenu(slug: string): void {
    this.activeCategory = slug;
  }
  
  hideMegaMenu(): void {
    this.activeCategory = null;
  }
  
  // Search functionality
  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.filteredProducts = [];
      return;
    }
    this.product.getProduct().subscribe({
      next: (product) =>{
        console.log('header procxucr',product);
        
      }
    })
    const query = this.searchQuery.toLowerCase().trim();
    // this.filteredProducts = PRODUCTS.filter(product => 
    //   product.name.toLowerCase().includes(query) || 
    //   product.brand.toLowerCase().includes(query) || 
    //   product.category.toLowerCase().includes(query) ||
    //   product.description.toLowerCase().includes(query) ||
    //   product.sku.toLowerCase().includes(query)
    // ).slice(0, 5); // Limit to 5 results for dropdown
  }
  
  clearSearch(): void {
    this.searchQuery = '';
    this.filteredProducts = [];
  }
  
  selectProduct(product: any): void {
    this.router.navigate(['/products/', product.id]);
    this.isSearchFocused = false;
    this.clearSearch();
  }

  logout(): void {
    // this.authService.userLoggedIn.set(false);
    // this.authService.logout();
  }
}
