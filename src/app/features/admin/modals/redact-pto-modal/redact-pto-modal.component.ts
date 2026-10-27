import { Component, inject } from '@angular/core';
import { AdminModal } from '../../../../core/model';
import { AdminModalService } from '../../data/admin-modal.service';

@Component({
  selector: 'app-redact-pto-modal',
  standalone: true,
  templateUrl: './redact-pto-modal.component.html'
})
export class RedactPtoModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly key = AdminModal.RedactPto;

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  submitRedactPto(): void {
    this.modal.close(this.key);
  }
}
