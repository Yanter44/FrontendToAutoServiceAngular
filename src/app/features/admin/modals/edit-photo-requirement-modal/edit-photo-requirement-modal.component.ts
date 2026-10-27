import { Component, effect, inject, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { RequirementService } from '../../../../core/services/requirement.service';
import { isApiOk } from '../../../../shared/util/api.util';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminRequirementsFacade } from '../../data/admin-requirements.facade';

@Component({
  selector: 'app-edit-photo-requirement-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-photo-requirement-modal.component.html'
})
export class EditPhotoRequirementModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly requirements = inject(AdminRequirementsFacade);
  private readonly requirementService = inject(RequirementService);
  private readonly key = AdminModal.EditPhotoRequirement;
  private preparedId: number | null = null;

  editPhotoType = '';
  editPhotoDisplayName = '';
  editPhotoIsRequire = 'true';

  constructor() {
    effect(() => {
      if (!this.modal.isOpen(this.key)) {
        this.preparedId = null;
        return;
      }
      const item = this.modal.selectedPhotoRequirement();
      if (item && this.preparedId !== item.id) {
        untracked(() => {
          this.preparedId = item.id;
          this.editPhotoType = item.photoType;
          this.editPhotoDisplayName = item.displayName;
          this.editPhotoIsRequire = item.isRequire ? 'true' : 'false';
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

  async submitEditPhotoRequirement(): Promise<void> {
    const item = this.modal.selectedPhotoRequirement();
    if (!item) return;
    if (!this.editPhotoType.trim() || !this.editPhotoDisplayName.trim()) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    const result = await firstValueFrom(this.requirementService.editPhotoRequirement({
      id: item.id,
      photoType: this.editPhotoType.trim(),
      displayName: this.editPhotoDisplayName.trim(),
      isRequire: this.editPhotoIsRequire === 'true'
    }));
    if (isApiOk(result)) {
      this.modal.close(this.key);
      await this.requirements.load();
      alert('Требование успешно обновлено');
    } else {
      alert('Ошибка при обновлении');
    }
  }
}
