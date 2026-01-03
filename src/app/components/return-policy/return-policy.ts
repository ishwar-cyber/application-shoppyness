import { Component } from '@angular/core';

@Component({
  selector: 'app-return-policy',
  imports: [],
  templateUrl: './return-policy.html',
  styleUrl: './return-policy.scss'
})
export class ReturnPolicy {
  ngOnInit(): void {
    //add scroll to top on init
    window.scrollTo(0, 0);
  }
}
