import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterModule, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  currentYear = new Date().getFullYear();
  private readonly platformId = inject(PLATFORM_ID);

  scrollToTop(){
    if(isPlatformBrowser(this.platformId)){
      window.scrollTo({top:0, behavior:'smooth'})
    }
  }
}
