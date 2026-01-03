import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  input,
  Output,
  signal,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { PopUp } from '../pop-up/pop-up';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, PopUp],
  templateUrl: './order-success.html',
  styleUrl: './order-success.scss'
})
export class OrderSuccess implements OnInit, OnDestroy {

  // 🔹 Inputs (READ ONLY)
  orderId = input.required<string>();
  order = input.required<any>();
  show = input.required<boolean>();

  // 🔹 Outputs
  @Output() close = new EventEmitter<void>();

  // 🔹 Internal state
  countdown = signal<number>(5);
  private redirectSub?: Subscription;

  private readonly router = inject(Router);

  ngOnInit(): void {
    this.redirectSub = timer(0, 1000).subscribe(sec => {
      const remaining = 5 - sec;
      this.countdown.set(remaining);

      if (remaining === 0) {
        this.goToOrder();
      }
    });
  }

  ngOnDestroy(): void {
    this.redirectSub?.unsubscribe();
  }

  // ✅ Child only EMITS
  onClose() {
    this.redirectSub?.unsubscribe();
    this.close.emit();
  }

  goToOrder() {
    this.redirectSub?.unsubscribe();
    this.router.navigate(['/orders/details'], {
      queryParams: { orderId: this.orderId() }
    });
  }
}
