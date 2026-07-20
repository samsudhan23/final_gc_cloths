import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SplitPipe } from '../../core/pipes/split.pipe';
import { ImageModule } from 'primeng/image';
import { AdminProductService } from '../../../module/admin_module/service/productService/admin-product.service';
import { ToastrService } from 'ngx-toastr';
import { apiResponse } from '../../interface/response';

@Component({
  selector: 'app-popup',
  imports: [Dialog, ButtonModule, InputTextModule, AvatarModule, CommonModule, SplitPipe, ImageModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss'
})
export class PopupComponent {
  visible: boolean = false;
  @Input() galleries: any[] = [];
  @Input() single: any = '';
  @Input() added: any = '';
  /** Set when editing an existing product so delete removes from DB + Cloudinary */
  @Input() productId: string | null = null;
  @Output() galleryChanged = new EventEmitter<any[]>();

  galleryPreviews: any;
  base64Data: string | ArrayBuffer | null = '';
  deletingIndex: number | null = null;

  constructor(
    private productService: AdminProductService,
    private toast: ToastrService
  ) {}

  showDialog() {
    this.galleryPreviews = [];
    if (this.galleries?.length) {
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

  getGalleryDisplayName(item: File | string): string {
    if (item instanceof File) {
      return item.name;
    }
    if (typeof item === 'string') {
      return item.split('/').pop() || item;
    }
    return '';
  }

  private isPersistedGalleryImage(item: unknown): item is string {
    return typeof item === 'string' && item.startsWith('http');
  }

  private removeLocally(index: number): void {
    this.galleryPreviews.splice(index, 1);
    this.galleries.splice(index, 1);
    this.galleryChanged.emit([...this.galleries]);
  }

  deleteImage(index: number): void {
    const item = this.galleries[index];
    if (item === undefined) {
      return;
    }

    // Unsaved file during add/edit — remove from form only
    if (item instanceof File) {
      this.removeLocally(index);
      return;
    }

    // Saved Cloudinary URL while editing an existing product
    if (this.productId && this.isPersistedGalleryImage(item)) {
      if (!confirm('Delete this gallery image permanently from this product?')) {
        return;
      }

      const imageUrl = typeof item === 'string' ? item.trim() : '';
      this.deletingIndex = index;
      this.productService.deleteGalleryImage(this.productId, imageUrl, index).subscribe({
        next: (res: apiResponse) => {
          this.deletingIndex = null;
          if (res.success || res.code === 200) {
            this.removeLocally(index);
            this.toast.success(res.message || 'Gallery image deleted');
          } else {
            this.toast.error(res.message || 'Failed to delete image');
          }
        },
        error: (err) => {
          this.deletingIndex = null;
          this.toast.error(err?.error?.message || 'Failed to delete gallery image');
        }
      });
      return;
    }

    // Legacy URL or add mode — local list only
    this.removeLocally(index);
  }
}
