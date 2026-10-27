import { Component, effect, inject, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { RequirementService } from '../../../../core/services/requirement.service';
import { ToastService } from '../../../../core/services/toast.service';
import { isApiOk } from '../../../../shared/util/api.util';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminRequirementsFacade } from '../../data/admin-requirements.facade';

@Component({
  selector: 'app-edit-document-requirement-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-document-requirement-modal.component.html'
})
export class EditDocumentRequirementModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly requirements = inject(AdminRequirementsFacade);
  private readonly requirementService = inject(RequirementService);
  private readonly toast = inject(ToastService);
  private readonly key = AdminModal.EditDocumentRequirement;
  private preparedId: number | null = null;

  editDocumentType = '';
  editDocumentDisplayName = '';
  editDocumentIsRequire = 'true';

  constructor() {
    effect(() => {
      if (!this.modal.isOpen(this.key)) {
        this.preparedId = null;
        return;
      }
      const item = this.modal.selectedDocumentRequirement();
      if (item && this.preparedId !== item.id) {
        untracked(() => {
          this.preparedId = item.id;
          this.editDocumentType = item.documentType;
          this.editDocumentDisplayName = item.displayName;
          this.editDocumentIsRequire = item.isRequire ? 'true' : 'false';
        });
      }
    });
  }

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  async submitEditDocumentRequirement(): Promise<void> {
    const item = this.modal.selectedDocumentRequirement();
    if (!item) return;
    if (!this.editDocumentType.trim() || !this.editDocumentDisplayName.trim()) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    const result = await firstValueFrom(this.requirementService.editDocumentRequirement({
      id: item.id,
      documentType: this.editDocumentType.trim(),
      displayName: this.editDocumentDisplayName.trim(),
      isRequire: this.editDocumentIsRequire === 'true'
    }));
    if (isApiOk(result)) {
      this.modal.close(this.key);
      await this.requirements.load();
      this.toast.success('Требование успешно обновлено');
    } else {
      this.toast.error('Ошибка при обновлении');
    }
  }
}
