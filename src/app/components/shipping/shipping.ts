import { Component } from '@angular/core';

@Component({
  selector: 'app-shipping',
  imports: [],
  templateUrl: './shipping.html',
  styleUrl: './shipping.scss'
})
export class Shipping {

  ngOnInit(): void {
    //add scroll to top on init
    window.scrollTo(0, 0);
  }
}
