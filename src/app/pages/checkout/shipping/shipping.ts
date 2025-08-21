import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipping',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shipping.html',
  styleUrl: './shipping.scss'
})
export class Shipping {
// default = 'online'
  paymentMethod = input<'online' | 'cod'>('online');

  methodChange = output<'online' | 'cod'>();
  continue = output<void>();

  select(method: 'online') {
    this.methodChange.emit(method);
  }
}
