import { Component, computed, inject } from '@angular/core';
import { ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="ToastContainer">
      @for (toast of toasts(); track toast.id) {
        <div class="Toast Toast--{{ toast.type.charAt(0).toUpperCase() + toast.type.slice(1) }}"
             [class.Show]="true">
          <div class="Toast__Icon">{{ iconFor(toast.type) }}</div>
          <div class="Toast__Body">
            <div class="Toast__Title">{{ toast.title }}</div>
            <div class="Toast__Message">{{ toast.message }}</div>
          </div>
          <button class="Toast__Close" type="button" aria-label="Закрыть" (click)="close(toast.id)">✕</button>
        </div>
      }
    </div>
  `
})
export class ToastHostComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = computed(() => this.toastService.toasts());
  readonly icons: Record<ToastType, string> = { success: '✔', error: '✖', warning: '⚠', info: 'ℹ' };

  iconFor(type: ToastType): string {
    return this.icons[type];
  }

  close(id: number): void {
    this.toastService.dismiss(id);
  }
}
