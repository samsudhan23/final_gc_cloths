import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  templateUrl: './table-skeleton.component.html',
  styleUrl: './table-skeleton.component.scss'
})
export class TableSkeletonComponent {
  @Input() rows: number = 5;
  @Input() columns: number = 5;
  @Input() showHeader: boolean = true;
  @Input() showPagination: boolean = true;
  @Input() showSearch: boolean = false;

  get rowsArray(): number[] {
    return Array(this.rows).fill(0).map((_, i) => i);
  }

  get columnsArray(): number[] {
    return Array(this.columns).fill(0).map((_, i) => i);
  }
}
