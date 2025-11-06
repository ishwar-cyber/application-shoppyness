import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Review {
  name: string;
  rating: number;
  comment: string;
  date: string;
}
@Component({
  selector: 'app-product-review',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-review.html',
  styleUrl: './product-review.scss'
})

export class ProductReview {
  @Input() productId: string | null = null;
   reviews = signal<Review[]>([
    { name: 'John Doe', rating: 5, comment: 'Amazing product! Totally worth it.', date: '2025-11-05' },
    { name: 'Sarah Lee', rating: 4, comment: 'Good quality but a bit expensive.', date: '2025-11-04' }
  ]);

  newReview = signal<Review>({
    name: '',
    rating: 0,
    comment: '',
    date: ''
  });

  hoverRating = signal(0);

  setRating(value: number) {
    this.newReview.update(r => ({ ...r, rating: value }));
  }

  hoverStar(value: number) {
    this.hoverRating.set(value);
  }

  leaveStar() {
    this.hoverRating.set(0);
  }

  addReview() {
    if (!this.newReview().name || !this.newReview().comment || this.newReview().rating === 0) {
      alert('Please fill in all fields and select a rating.');
      return;
    }

    const review: Review = {
      ...this.newReview(),
      date: new Date().toISOString().split('T')[0]
    };

    this.reviews.update(r => [review, ...r]);
    this.newReview.set({ name: '', rating: 0, comment: '', date: '' });
  }

  getAverageRating(): number {
    const all = this.reviews();
    if (all.length === 0) return 0;
    const total = all.reduce((sum, r) => sum + r.rating, 0);
    return +(total / all.length).toFixed(1);
  }
}
