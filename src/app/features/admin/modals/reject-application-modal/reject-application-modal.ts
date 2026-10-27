import { Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { AdminStateService } from '../../data/admin-state.service';
import { AdminApplicationsFacade } from '../../data/admin-applications.facade';
import { AdminModalService } from '../../data/admin-modal.service';

@Component({
  selector: 'app-reject-application-modal',
  standalone: true,
  templateUrl: './reject-application-modal.html'
})
export class RejectApplicationModalComponent {
  private readonly state = inject(AdminStateService);
  private readonly applicationsFacade = inject(AdminApplicationsFacade);
  private readonly modal = inject(AdminModalService);
  private readonly key = AdminModal.RejectApplication;

  readonly rejectReason = signal('');
  readonly isSubmitting = signal(false);

  readonly reasonError = computed(() => {
    const value = this.rejectReason().trim();
    if (!value) return 'Укажите причину отклонения';
    if (value.length < 5) return 'Слишком короткая причина (минимум 5 символов)';
    return '';
  });

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  applicationLabel(): string {
    const app = this.state.selectedApplication();
    return app ? `№${app.id}` : '';
  }

  closeFromOverlay(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  close(): void {
    this.rejectReason.set('');
    this.isSubmitting.set(false);
    this.modal.close(this.key);
  }

  async submitRejectApplication(): Promise<void> {
    if (this.isSubmitting() || this.reasonError()) return;

    const reason = this.rejectReason().trim();
    const app = this.state.selectedApplication();
    if (!app) return;

    this.isSubmitting.set(true);
    try {
      await this.applicationsFacade.reject(app.id, reason); 
      this.close();       
    } catch (err) {
      console.error('Ошибка отклонения заявки', err);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}