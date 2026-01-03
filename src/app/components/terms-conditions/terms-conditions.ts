import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-conditions',
  imports: [],
  templateUrl: './terms-conditions.html',
  styleUrl: './terms-conditions.scss'
})
export class TermsConditions {

  ngOnInit(): void {
    //add scroll to top on init
    window.scrollTo(0, 0);
  }
}
