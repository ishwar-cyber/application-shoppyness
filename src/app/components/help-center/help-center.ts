import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-help-center',
  imports: [CommonModule, RouterLink],
  templateUrl: './help-center.html',
  styleUrl: './help-center.scss'
})
export class HelpCenter {

  ngOnInit(): void {
    //add scroll to top on init
    window.scrollTo(0, 0);
  }
}
