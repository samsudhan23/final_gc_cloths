import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  templateUrl: './product-card-skeleton.component.html',
  styleUrl: './product-card-skeleton.component.scss'
})
export class ProductCardSkeletonComponent {
  @Input() count: number = 8;
  @Input() columns: number = 4; // For responsive grid

  get itemsArray(): number[] {
    return Array(this.count).fill(0).map((_, i) => i);
  }
}
