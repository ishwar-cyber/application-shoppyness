import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PopUp } from "../pop-up/pop-up";

@Component({
  selector: 'app-order-success',
  imports: [CommonModule, PopUp],
  templateUrl: './order-success.html',
  styleUrl: './order-success.scss'
})
export class OrderSuccess {

  @Input() order: any = null;
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  readonly router = inject(Router);
  onClose() {
    this.show = false;
    this.close.emit();
  }

  navigateToProfile() {
    // this.router.navigate(['/profile']);
  }
}
