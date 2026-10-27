import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  readonly visible = signal(false);
  readonly percent = signal(0);
  private current = 0;
  private total = 10;

  show(totalSteps = 10): void {
    this.total = totalSteps;
    this.current = 0;
    this.percent.set(0);
    this.visible.set(true);
  }

  next(): void {
    this.current = Math.min(this.current + 1, this.total);
    this.percent.set(Math.round((this.current / this.total) * 100));
  }

  hide(): void {
    this.percent.set(100);
    setTimeout(() => this.visible.set(false), 250);
  }
}
