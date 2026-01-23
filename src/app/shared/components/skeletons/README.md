# Skeleton Components

Reusable PrimeNG skeleton components for loading states across the application.

## Components

### 1. TableSkeletonComponent (`app-table-skeleton`)

A reusable skeleton loader for tables that can be used anywhere tables are displayed.

**Usage:**
```html
<app-table-skeleton 
  [rows]="5" 
  [columns]="6" 
  [showHeader]="true" 
  [showPagination]="true"
  [showSearch]="true">
</app-table-skeleton>
```

**Inputs:**
- `rows` (number): Number of skeleton rows to display (default: 5)
- `columns` (number): Number of skeleton columns to display (default: 5)
- `showHeader` (boolean): Show table header skeleton (default: true)
- `showPagination` (boolean): Show pagination skeleton (default: true)
- `showSearch` (boolean): Show search bar skeleton (default: false)

**Example in Component:**
```typescript
import { TableSkeletonComponent } from '../../../shared/components/skeletons/table-skeleton/table-skeleton.component';

@Component({
  imports: [TableSkeletonComponent],
  // ...
})
export class YourComponent {
  isLoading = false;
  
  loadData() {
    this.isLoading = true;
    // ... fetch data
    this.isLoading = false;
  }
}
```

```html
<app-table-skeleton *ngIf="isLoading" [rows]="10" [columns]="5"></app-table-skeleton>
<p-table *ngIf="!isLoading" [value]="data">...</p-table>
```

### 2. ProductCardSkeletonComponent (`app-product-card-skeleton`)

A skeleton loader for product card grids.

**Usage:**
```html
<app-product-card-skeleton [count]="8"></app-product-card-skeleton>
```

**Inputs:**
- `count` (number): Number of product card skeletons to display (default: 8)
- `columns` (number): Number of columns for responsive grid (default: 4)

**Example:**
```html
<app-product-card-skeleton *ngIf="isLoading" [count]="8"></app-product-card-skeleton>
<div *ngIf="!isLoading" class="row g-4">
  <!-- Product cards -->
</div>
```

### 3. FilterSkeletonComponent (`app-filter-skeleton`)

A skeleton loader for filter sidebars.

**Usage:**
```html
<app-filter-skeleton></app-filter-skeleton>
```

**Example:**
```html
<app-filter-skeleton *ngIf="isLoadingFilters"></app-filter-skeleton>
<div *ngIf="!isLoadingFilters">
  <!-- Filter content -->
</div>
```

## Best Practices

1. **Always use loading states**: Set `isLoading` flags when fetching data
2. **Conditional rendering**: Use `*ngIf` to toggle between skeleton and actual content
3. **Match skeleton to content**: Use appropriate skeleton components that match your actual UI structure
4. **Reuse components**: Use these skeleton components across the application for consistency

## Integration Example

```typescript
export class YourComponent {
  isLoading = false;
  isLoadingFilters = false;
  
  ngOnInit() {
    this.loadData();
    this.loadFilters();
  }
  
  loadData() {
    this.isLoading = true;
    this.service.getData().subscribe(
      (data) => {
        this.data = data;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }
  
  loadFilters() {
    this.isLoadingFilters = true;
    this.service.getFilters().subscribe(
      (filters) => {
        this.filters = filters;
        this.isLoadingFilters = false;
      },
      (error) => {
        this.isLoadingFilters = false;
      }
    );
  }
}
```

```html
<!-- Filters -->
<app-filter-skeleton *ngIf="isLoadingFilters"></app-filter-skeleton>
<div *ngIf="!isLoadingFilters">
  <!-- Filter UI -->
</div>

<!-- Content -->
<app-table-skeleton *ngIf="isLoading" [rows]="10"></app-table-skeleton>
<p-table *ngIf="!isLoading" [value]="data">...</p-table>
```
