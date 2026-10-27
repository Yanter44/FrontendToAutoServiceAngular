import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  styleUrl: './pagination.component.css',
  template: `
    @if (totalPages > 0) {
      <button class="PaginationButton" [disabled]="currentPage <= 1" (click)="go(currentPage - 1)">←</button>
      @for (page of pages; track $index) {
        @if (page === '...') {
          <span class="PaginationDots">...</span>
        } @else {
          <button class="PaginationNumber" [class.Active]="page === currentPage" (click)="go(+page)">{{ page }}</button>
        }
      }
      <button class="PaginationButton" [disabled]="currentPage >= totalPages" (click)="go(currentPage + 1)">→</button>
    }
  `
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get pages(): Array<number | '...'> {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const items: Array<number | '...'> = [1];
    if (current > 3) items.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) items.push(i);
    if (current < total - 2) items.push('...');
    items.push(total);
    return items;
  }

  go(page: number): void {
    if (!page || page === this.currentPage || page < 1 || page > this.totalPages) return;
    this.pageChange.emit(page);
  }
}
