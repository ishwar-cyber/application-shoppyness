import { Component, input } from '@angular/core';

@Component({
  selector: 'app-billing',
  imports: [],
  templateUrl: './billing.html',
  styleUrl: './billing.scss'
})
export class Billing {
  billingForm = input();
  sameAsBilling = input()
}
