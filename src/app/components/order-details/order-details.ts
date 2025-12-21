import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, Inject, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss'
})
export class OrderDetails implements OnInit {

  order = signal<any>(null);
  orderId = signal<string>('');
  orderDate = signal<string>('');
  estimatedDelivery = signal<string>('2025-11-15');
  private readonly router = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);
  isCancelledFlag = signal<boolean>(false);
    // ---- DERIVED STATES ----
  isCancelled = computed(() =>
    this.ORDER_STEPS().find(s => s.key === 'CANCELLED')?.completed
  );

  canCancelOrder = computed(() => {
    const steps = this.ORDER_STEPS();
    const shipped = steps.find(s => s.key === 'SHIPPED')?.completed;
    const delivered = steps.find(s => s.key === 'DELIVERED')?.completed;
    return !shipped && !delivered && !this.isCancelled();
  });
  ORDER_STEPS = signal<OrderStatus[]>([]);
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
        this.isCancelledFlag.set(order.payload?.orderStatus.toLowerCase() === 'cancelled' ?  false : true)
        this.ORDER_STEPS.set(order?.payload?.tracking);
        this.orderId.set(order?.payload?.orderNumber || '');
        this.orderDate.set(new Date(order.date).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }));
        this.estimatedDelivery.set(new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }));
      }
    });
  }

 // ---- CANCEL LOGIC ----
  cancelOrder() {
    if (!this.canCancelOrder()) return;

    this.ORDER_STEPS.update(steps =>
      steps.map(step => {
        if (step.key === 'CANCELLED') {
          return { ...step, completed: true };
        }

        if (
          step.key === 'SHIPPED' ||
          step.key === 'DELIVERED'
        ) {
          return { ...step, completed: false };
        }
        return step;
      })
    );

    // ✅ Future backend call
    const reason = {
      reason: 'i dont want this model'
    }
    this.profileService.cancelOrder(this.orderId(), reason).subscribe();
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

