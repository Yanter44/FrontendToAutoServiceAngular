import { Injectable, Type, computed, signal } from '@angular/core';

export interface AdminDetailsSidebarSlot {
  component: Type<any>;
}

@Injectable({ providedIn: 'root' })
export class AdminDetailsSidebarService {
  readonly slot = signal<AdminDetailsSidebarSlot | null>(null);
  private readonly payload = signal<unknown>(null);
  readonly open = computed(() => this.slot() !== null);

  show(component: Type<any>, data: unknown): void {
    this.payload.set(data);
    this.slot.set({ component });
  }

  data<T>(): T | null {
    return this.payload() as T | null;
  }

  close(): void {
    this.slot.set(null);
    this.payload.set(null);
  }
}
