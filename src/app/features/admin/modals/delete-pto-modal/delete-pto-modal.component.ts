import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { PtoService } from '../../../../core/services/pto.service';
import { ToastService } from '../../../../core/services/toast.service';
import { isApiOk } from '../../../../shared/util/api.util';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminPtosFacade } from '../../data/admin-ptos.facade';

@Component({
  selector: 'app-delete-pto-modal',
  standalone: true,
  templateUrl: './delete-pto-modal.component.html'
})
export class DeletePtoModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly ptos = inject(AdminPtosFacade);
  private readonly ptoService = inject(PtoService);
  private readonly toast = inject(ToastService);
  private readonly key = AdminModal.DeletePto;

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  selectedPtoName(): string {
    return this.modal.selectedPto()?.name || '';
  }

  async submitDeletePto(): Promise<void> {
    const pto = this.modal.selectedPto();
    if (!pto) return;
    const result = await firstValueFrom(this.ptoService.deletePto(pto.id));
    if (isApiOk(result)) {
      this.modal.close(this.key);
      await this.ptos.load();
      this.toast.success('ПТО удалён');
    } else {
      this.toast.error(result?.message || 'Не удалось удалить ПТО');
    }
  }
}
