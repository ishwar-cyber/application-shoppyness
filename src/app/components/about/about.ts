import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {

  ngOnInit(): void {
    //add scroll to top on init
    window.scrollTo(0, 0);
  }
}
