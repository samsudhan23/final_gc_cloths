import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SplitPipe } from "../../core/pipes/split.pipe";
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-popup',
  imports: [Dialog, ButtonModule, InputTextModule, AvatarModule, CommonModule, SplitPipe, ImageModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss'
})
export class PopupComponent {
  visible: boolean = false;
  @Input() galleries: any = [];
  @Input() single: any = '';
  @Input() added: any = '';
  galleryPreviews: any = [];
  base64Data: string | ArrayBuffer | null = '';

  constructor() {
  }

  // open Dialog
  showDialog() {
    if (this.galleries != 0) {
      this.galleries.forEach((element: Blob, index: string | number) => {
        if (element instanceof File) {
          const reader = new FileReader();
          reader.readAsDataURL(element);
          reader.onload = () => {
            this.galleryPreviews[index] = reader.result as string;
          };
        } else {
          this.galleryPreviews[index] = element;
        }
      });

      // this.galleries.forEach((element: Blob, index: string | number) => {
      //   if (element instanceof File) {
      //     const reader = new FileReader();
      //     reader.readAsDataURL(element);
      //     reader.onload = () => {
      //       this.galleryPreviews[index] = reader.result as string; // use for display only
      //     };
      //   } else {
      //     this.galleryPreviews[index] = element; // it's already a URL
      //   }
      // });
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

  // Get File names
  getGalleryDisplayName(item: File | string): string {
    if (item instanceof File) {
      return item.name;
    } else if (typeof item === 'string') {
      const segments = item.split('/');
      return segments[segments.length - 1];
    }
    return '';
  }

  deleteImage(index: number) {
    this.galleryPreviews.splice(index, 1);
    this.galleries.splice(index, 1);
  }
}
