import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { RequirementService } from '../../../../core/services/requirement.service';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminRequirementsFacade } from '../../data/admin-requirements.facade';

@Component({
  selector: 'app-delete-document-requirement-modal',
  standalone: true,
  templateUrl: './delete-document-requirement-modal.component.html'
})
export class DeleteDocumentRequirementModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly requirements = inject(AdminRequirementsFacade);
  private readonly requirementService = inject(RequirementService);
  private readonly key = AdminModal.DeleteDocumentRequirement;

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  selectedDocumentReqName(): string {
    const item = this.modal.selectedDocumentRequirement();
    return item?.displayName || String(item?.id ?? '');
  }

  async submitDeleteDocumentRequirement(): Promise<void> {
    const item = this.modal.selectedDocumentRequirement();
    if (!item) return;
    const ok = await firstValueFrom(this.requirementService.deleteDocumentRequirement(item.id));
    if (ok) {
      this.modal.close(this.key);
      await this.requirements.load();
    }
  }
}
