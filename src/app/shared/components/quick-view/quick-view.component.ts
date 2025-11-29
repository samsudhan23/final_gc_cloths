import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-quick-view',
  imports: [CommonModule],
  templateUrl: './quick-view.component.html',
  styleUrl: './quick-view.component.scss'
})
export class QuickViewComponent {
  @Input() selectedProducts: any = null;
  @Output() closeEmitter = new EventEmitter()

  constructor() {

  }

  ngOnInit() {
console.log(this.selectedProducts , 'selectedProducts');
  }

  closeQuickView() {
    this.closeEmitter.emit()
  }
}
