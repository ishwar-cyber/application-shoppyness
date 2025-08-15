import { Component, input } from '@angular/core';

@Component({
  selector: 'app-shipping',
  imports: [],
  templateUrl: './shipping.html',
  styleUrl: './shipping.scss'
})
export class Shipping {
  shippingForm = input();
}
