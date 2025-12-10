import { Component, inject, OnInit, signal } from '@angular/core';
import { Category } from '../../commons/models/product.model';
import { HomeService } from '../../services/home';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Loader } from '../../components/loader/loader';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, RouterLink, Loader],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class Categories implements OnInit{

  categories = signal<Category[]>([]);
  selectedCategory = signal<Category | null>(null);
  private scroller = inject(ViewportScroller);
  private readonly homeService = inject(HomeService);
  ngOnInit(): void {
    this.loadCategories();
    this.scroller.scrollToPosition([0, 0]); // safe scroll
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
