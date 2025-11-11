import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pop-up',
  imports: [CommonModule],
  templateUrl: './pop-up.html',
  styleUrl: './pop-up.scss'
})
export class PopUp {

   /** Controls popup visibility */
  @Input() isOpen: boolean = false;

  /** Animation type: 'bottom' | 'side' */
  @Input() animation: 'bottom' | 'side' = 'bottom';

  /** Emits when popup is closed */
  @Output() close = new EventEmitter<void>();

  closePopup() {
    this.close.emit();
  }
}
