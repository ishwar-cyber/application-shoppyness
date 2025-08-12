import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../services/product';
@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  searchQuery = '';
  isSearchFocused = false;
  filteredProducts = signal<any>([]);
  private readonly router = inject(Router);
  private readonly product = inject(Product);

    // Search functionality
  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.filteredProducts.set([]);
      return;
    }
    this.product.search(this.searchQuery).subscribe({
      next: (product : any) =>{
       this.filteredProducts.set(product.data)
        
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
    this.filteredProducts.set([]);
  }
  
  selectProduct(product: any): void {
    this.router.navigate(['/product/', product.id]);
    this.isSearchFocused = false;
    this.clearSearch();
  }

}
