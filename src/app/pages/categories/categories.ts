import { Component, inject, OnInit, signal } from '@angular/core';
import { Category } from '../../commons/models/product.model';
import { HomeService } from '../../services/home';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class Categories implements OnInit{

  categories = signal<Category[]>([]);
  selectedCategory = signal<Category | null>(null);

  private readonly homeService = inject(HomeService);
  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.homeService.getCategories().subscribe({
      next: (res: any) => {
        this.categories.set(res.data);
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
  }
}
