import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { RequirementService } from '../../../../core/services/requirement.service';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminRequirementsFacade } from '../../data/admin-requirements.facade';

@Component({
  selector: 'app-add-new-photo-requirement-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-new-photo-requirement-modal.component.html'
})
export class AddNewPhotoRequirementModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly requirements = inject(AdminRequirementsFacade);
  private readonly requirementService = inject(RequirementService);
  private readonly key = AdminModal.AddNewPhotoRequirement;

  photoType = '';
  photoDisplayName = '';
  photoIsRequire = 'true';

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  async submitNewPhotoRequirement(): Promise<void> {
    if (!this.photoType.trim() || !this.photoDisplayName.trim()) {
      alert('Заполните все необходимые поля!');
      return;
    }
    const created = await firstValueFrom(this.requirementService.addPhotoRequirement({
      photoType: this.photoType.trim(),
      displayName: this.photoDisplayName.trim(),
      isRequire: this.photoIsRequire === 'true'
    }));
    if (created) {
      this.photoType = '';
      this.photoDisplayName = '';
      this.photoIsRequire = 'true';
      this.modal.close(this.key);
      await this.requirements.load();
    }
  }
}
