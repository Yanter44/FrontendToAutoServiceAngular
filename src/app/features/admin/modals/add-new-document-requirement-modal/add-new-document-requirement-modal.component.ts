import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { RequirementService } from '../../../../core/services/requirement.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminRequirementsFacade } from '../../data/admin-requirements.facade';

@Component({
  selector: 'app-add-new-document-requirement-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-new-document-requirement-modal.component.html'
})
export class AddNewDocumentRequirementModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly requirements = inject(AdminRequirementsFacade);
  private readonly requirementService = inject(RequirementService);
  private readonly toast = inject(ToastService);
  private readonly key = AdminModal.AddNewDocumentRequirement;

  documentType = '';
  documentDisplayName = '';
  documentIsRequire = 'true';

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  async submitNewDocumentRequirement(): Promise<void> {
    if (!this.documentType.trim() || !this.documentDisplayName.trim()) {
      this.toast.error('Заполните все необходимые поля!');
      return;
    }
    const created = await firstValueFrom(this.requirementService.addDocumentRequirement({
      documentType: this.documentType.trim(),
      displayName: this.documentDisplayName.trim(),
      isRequire: this.documentIsRequire === 'true'
    }));
    if (created) {
      this.documentType = '';
      this.documentDisplayName = '';
      this.documentIsRequire = 'true';
      this.modal.close(this.key);
      await this.requirements.load();
    }
  }
}
