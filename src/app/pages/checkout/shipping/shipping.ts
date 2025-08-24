import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipping',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shipping.html',
  styleUrl: './shipping.scss'
})
export class Shipping {
// default = 'online'
  paymentMethod = signal<string>('online');
  continue = output<void>();
}
