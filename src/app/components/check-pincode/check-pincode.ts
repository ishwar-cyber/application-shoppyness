import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap, tap, catchError, of } from 'rxjs';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-check-pincode',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './check-pincode.html',
  styleUrl: './check-pincode.scss'
})
export class CheckPincode {

  private readonly productService = inject(ProductService);

  /* ---------------- UI Signals ---------------- */
  showLocationPopup = signal(false);
  pincode = signal('');
  deliveryState = signal<'idle' | 'checking' | 'available' | 'unavailable' | 'error'>('idle');
  deliveryDate = signal('');
  errorMessage = signal('');

  /* ---------------- RxJS Input Stream ---------------- */
  private pincode$ = new Subject<string>();

  constructor() {
    this.pincode$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter(pin => /^\d{6}$/.test(pin)),
        tap(() => {
          this.deliveryState.set('checking');
          this.errorMessage.set('');
        }),
        switchMap(pin =>
          this.productService.checkPincode({
            pickup: '411057',
            delivery: pin,
            weight: 1,
            cod: 0,
            value: 999
          }).pipe(
            catchError(err => {
              this.deliveryState.set('error');
              this.errorMessage.set(err?.error?.message || 'Delivery not available');
              return of(null);
            })
          )
        )
      )
      .subscribe((res: any) => {
        if (!res?.data?.etd) {
          this.deliveryState.set('unavailable');
          return;
        }

        this.deliveryDate.set(res.data.etd);
        this.deliveryState.set('available');

        // ✅ Auto close popup on success
        this.showLocationPopup.set(false);
      });
  }

  /* ---------------- UI Actions ---------------- */

  toggleLocationPopup() {
    this.showLocationPopup.update(v => !v);
  }

  onDeliveryPincodeChange(value: string) {
    if (!/^\d{0,6}$/.test(value)) return;

    this.pincode.set(value);

    if (value.length === 6) {
      this.pincode$.next(value);
    }
  }
}
