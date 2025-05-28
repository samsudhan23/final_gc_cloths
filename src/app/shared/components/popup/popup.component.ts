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
  @Input() addedGallery: any = [];
  @Input() single: any = '';
  @Input() added: any = '';
  base64Data: string | ArrayBuffer | null = '';

  constructor() {
  }
  showDialog() {
    if (this.addedGallery) {
      this.galleries = this.addedGallery;
      this.galleries.forEach((element: any, index: number) => {
        if (element instanceof File) {
          const reader = new FileReader();
          reader.readAsDataURL(element);
          reader.onload = () => {
            this.galleries[index] = reader.result as string;
          };
        }
      });
    }
    if (this.added instanceof File) {
      const reader = new FileReader();
      reader.readAsDataURL(this.added);
      reader.onload = () => {
        this.base64Data = reader.result;
      };
    }
    this.visible = true;
  }
}
