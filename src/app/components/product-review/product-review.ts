import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductReviewService } from '../../services/product-review';

interface Review {
  name: string;
  email: string;
  userId?: string;
  productId: string | null;
  rating: number;
  comment: string;
  createdAt?: string;
}

@Component({
  selector: 'app-product-review',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-review.html',
  styleUrls: ['./product-review.scss'],
})
export class ProductReview implements OnInit {
  
  @Input() productId: string | null = null;
  productReviewForm!: FormGroup;

  private readonly formBuilder = inject(FormBuilder);
  private readonly reviewService = inject(ProductReviewService);

  // All reviews
  reviews = signal<Review[]>([]);

  // ⭐ Rating signals
  rating = signal<number>(0);
  hoverRating = signal(0);

  // 👇 Added Load More Signals
  visibleCount = signal(3); // show first 3 reviews
  visibleReviews = signal<Review[]>([]); // derived list (updated after load)

  ngOnInit(): void {
    this.buildForm();
    this.getProductReview();
  }

  // Build form
  buildForm() {
    this.productReviewForm = this.formBuilder.group({
      userName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      rating: [0, Validators.required],
      comment: ['', Validators.required],
    });
  }

  // Load reviews from backend
  getProductReview() {
    if (!this.productId) {
      this.reviews.set([]);
      this.updateVisibleReviews();
      return;
    }

    this.reviewService.getProductByIdReview(this.productId).subscribe({
      next: (res: any) => {
        this.reviews.set(res?.reviews || []);
        this.visibleCount.set(3);      // reset visible count
        this.updateVisibleReviews();   // show first 3 again
      },
      error: (err: any) => {
        console.error('Failed to load reviews', err);
      },
    });
  }

  // ⭐ Rating interactions
  setRating(value: number) {
    this.rating.set(value);
  }
  hoverStar(value: number) {
    this.hoverRating.set(value);
  }
  leaveStar() {
    this.hoverRating.set(0);
  }

  // Add new review locally + API
  addReview() {
    const payload = {
      name: this.productReviewForm.controls['userName'].value,
      email: this.productReviewForm.controls['userEmail'].value,
      productId: this.productId || '',
      rating: this.rating(),
      comment: this.productReviewForm.controls['comment'].value,
    };

    this.reviewService.addProductReview(payload).subscribe({
      next: () => {},
    });

    const review: Review = {
      ...payload,
      productId: this.productId || null,
      createdAt: new Date().toISOString(),
    };

    // Add new review at top
    this.reviews.update((r) => [review, ...r]);
    this.updateVisibleReviews();

    this.productReviewForm.reset();
    this.rating.set(0);
  }

  // ⭐⭐ NEW — LOAD MORE FUNCTION ⭐⭐
  loadMore() {
    this.visibleCount.set(this.visibleCount() + 3);
    this.updateVisibleReviews();
  }

  // Apply visible slice
  updateVisibleReviews() {
    this.visibleReviews.set(this.reviews().slice(0, this.visibleCount()));
  }

  // Average rating
  getAverageRating(): number {
    const all = this.reviews();
    if (all.length === 0) return 0;
    return +(all.reduce((s, r) => s + r.rating, 0) / all.length).toFixed(1);
  }
}
