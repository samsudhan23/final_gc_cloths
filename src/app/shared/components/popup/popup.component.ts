import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SplitPipe } from "../../core/pipes/split.pipe";

@Component({
  selector: 'app-popup',
  imports: [Dialog, ButtonModule, InputTextModule, AvatarModule, CommonModule, SplitPipe],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss'
})
export class PopupComponent {
  visible: boolean = false;
  @Input() galleries: any = [];
  @Input() single: any = '';

  constructor() {
  }
  showDialog() {
    this.visible = true;
  }
}
