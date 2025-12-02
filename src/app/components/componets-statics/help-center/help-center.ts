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

}
