import { Component, inject, signal } from '@angular/core';
import { Router } from 'express';
import { ProfileService } from '../../services/profile-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-order',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-order.html',
  styleUrl: './my-order.scss'
})
export class MyOrder {


  // signals
  orders = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  private readonly profile = inject(ProfileService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const userId = sessionStorage.getItem('userId') || '';

    if (!userId) {
      this.error.set('User not logged in');
      this.loading.set(false);
      return;
    }

    this.fetchOrders(userId);
  }

  /** Fetch Orders for Logged-In User */
  fetchOrders(userId: string) {
    this.loading.set(true);

    this.profile.getUserOrders().subscribe({
      next: (res: any) => {
        this.orders.set(res?.payload || []);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.error?.message || 'Failed to load orders');
        this.loading.set(false);
      }
    });
  }

  /** Navigate to Order Tracking Page */
  viewDetails(order: any) {
    this.router.navigate(['/order-details'], {
      queryParams: { orderId: order._id }
    });
  }

  /** Get Badge Color Class Dynamically */
  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered': return 'delivered';
      case 'shipped': return 'shipped';
      case 'packed': return 'packed';
      case 'pending': return 'pending';
      default: return 'pending';
    }
  }
}
