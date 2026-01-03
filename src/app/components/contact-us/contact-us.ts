import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  imports: [],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss'
})
export class ContactUs {

  ngOnInit(): void {
    //add scroll to top on init
    window.scrollTo(0, 0);
  }
}
