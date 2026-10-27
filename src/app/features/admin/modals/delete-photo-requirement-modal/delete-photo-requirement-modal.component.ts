import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { RequirementService } from '../../../../core/services/requirement.service';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminRequirementsFacade } from '../../data/admin-requirements.facade';

@Component({
  selector: 'app-delete-photo-requirement-modal',
  standalone: true,
  templateUrl: './delete-photo-requirement-modal.component.html'
})
export class DeletePhotoRequirementModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly requirements = inject(AdminRequirementsFacade);
  private readonly requirementService = inject(RequirementService);
  private readonly key = AdminModal.DeletePhotoRequirement;

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  selectedPhotoReqName(): string {
    const item = this.modal.selectedPhotoRequirement();
    return item?.displayName || String(item?.id ?? '');
  }

  async submitDeletePhotoRequirement(): Promise<void> {
    const item = this.modal.selectedPhotoRequirement();
    if (!item) return;
    const ok = await firstValueFrom(this.requirementService.deletePhotoRequirement(item.id));
    if (ok) {
      this.modal.close(this.key);
      await this.requirements.load();
    }
  }
}
