import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, effect, Inject, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../services/profile-service';
interface OrderStatus {
  step: string;
  label: string;
  key: string;
  date?: string;
  completed: boolean;
}

@Component({
  selector: 'app-order-details',
  imports: [CommonModule],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss'
})
export class OrderDetails implements OnInit {

  order = signal<any>(null);
  orderId = signal<string>('');
  orderDate = signal<string>('2025-11-09');
  estimatedDelivery = signal<string>('2025-11-15');
  private readonly router = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);
  
 ORDER_STEPS = signal<OrderStatus[]>([
  // { key: 'placed', label: 'Order Placed', completed: true },
  // { key: 'confirmed', label: 'Order Confirmed', completed: false },
  // { key: 'packed', label: 'Packed', completed: false },
  // { key: 'shipped', label: 'Shipped', completed: false },
  // { key: 'out_for_delivery', label: 'Out for Delivery', completed: false },
  // { key: 'delivered', label: 'Delivered', completed: false }
]);
  // Signal for progress
  progress = signal(0);
  ngOnInit(): void {
    let userId = sessionStorage.getItem('userId') || ''; 
    this.router.queryParamMap.subscribe(params => {
      const id = params.get('orderId');
      if (id) {
        this.orderId.set(id);
        this.getOrderForTracking(userId, id);
      }
    });
  }

  getOrderForTracking(userId: string, orderId: string) {
    this.profileService.getOrderById(userId, orderId).subscribe((order: any) => {
      if (order) {
        console.log('order ', order);
        this.ORDER_STEPS.set(order?.payload?.tracking);
        this.orderId.set(order?.payload?.orderNumber || '');
        this.orderDate.set(new Date(order.date).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }));
        this.estimatedDelivery.set(new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }));
      }
    });
  }



  setOrderData(response: any) {
    this.order.set(response);

    this.ORDER_STEPS.set(this.ORDER_STEPS().map(step => ({
      ...step,
      completed: this.isStepCompleted(step.key, response.status)
    })));
  }

  isStepCompleted(stepKey: string, currentStatus: string): boolean {
    const orderFlow = this.ORDER_STEPS().map(s => s.key);
    return orderFlow.indexOf(stepKey) <= orderFlow.indexOf(currentStatus);
  }
}

