import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly openModals = signal<Set<string>>(new Set());

  isOpen(name: string): boolean {
    return this.openModals().has(name);
  }

  open(name: string): void {
    this.openModals.update(set => new Set(set).add(name));
  }

  close(name: string): void {
    this.openModals.update(set => {
      const next = new Set(set);
      next.delete(name);
      return next;
    });
  }

  toggle(name: string): void {
    if (this.isOpen(name)) this.close(name);
    else this.open(name);
  }

  closeAll(): void {
    this.openModals.set(new Set());
  }
}
