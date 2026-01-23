import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-filter-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  templateUrl: './filter-skeleton.component.html',
  styleUrl: './filter-skeleton.component.scss'
})
export class FilterSkeletonComponent {
  filterGroups = [
    { title: true, items: 4 },
    { title: true, items: 3 },
    { title: true, items: 6 },
    { title: true, items: 2 }
  ];
}
