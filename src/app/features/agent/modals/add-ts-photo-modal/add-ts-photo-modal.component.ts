import { Component, effect, inject, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AgentModal, UploadedMediaItem } from '../../../../core/model';
import { CloudinaryService } from '../../../../core/services/cloudinary.service';
import { RequirementService } from '../../../../core/services/requirement.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AgentModalService } from '../../data/agent-modal.service';
import { AgentStateService } from '../../data/agent-state.service';

@Component({
  selector: 'app-add-ts-photo-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-ts-photo-modal.component.html'
})
export class AddTsPhotoModalComponent {
  readonly agentState = inject(AgentStateService);
  private readonly agentModalsService = inject(AgentModalService);
  private readonly requirementsService = inject(RequirementService);
  private readonly cloudinaryService = inject(CloudinaryService);
  private readonly toast = inject(ToastService);

  selectedPhotoFile: File | null = null;
  photoPreviewUrl: string | null = null;
  selectedPhotoTypeId: number | null = null;
  savingPhoto = false;
  photoSaveText = 'Добавить';

  private prepared = false;

  constructor() {
    effect(() => {
      const open = this.agentModalsService.isOpen(AgentModal.AddTsPhoto);
      if (!open) {
        this.prepared = false;
        return;
      }
      if (!this.prepared) {
        untracked(() => {
          this.prepared = true;
          void this.ensureRequirements();
        });
      }
    });
  }

  isPhotoOpen(): boolean {
    return this.agentModalsService.isOpen(AgentModal.AddTsPhoto);
  }

  closePhoto(): void {
    this.agentModalsService.close(AgentModal.AddTsPhoto);
    this.resetPhotoDropZone();
  }

  onPhotoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedPhotoFile = file;
    if (this.photoPreviewUrl) URL.revokeObjectURL(this.photoPreviewUrl);
    this.photoPreviewUrl = URL.createObjectURL(file);
  }

  async savePhoto(): Promise<void> {
    if (!this.selectedPhotoFile) {
      this.toast.warning('Пожалуйста, выберите файл перед добавлением!');
      return;
    }

    const requirement = this.agentState.photoRequirements().find(item => item.id === this.selectedPhotoTypeId)
      ?? this.agentState.photoRequirements()[0];
    const typeText = requirement?.displayName || 'Фото';

    try {
      this.savingPhoto = true;
      this.photoSaveText = 'Загрузка...';

      const result = await this.cloudinaryService.uploadPhoto(
        this.selectedPhotoFile,
        'AgentUploadApplicationPhoto'   // ← вот это
      );

      const item: UploadedMediaItem = {
        id: 'photo_' + Date.now(),
        type: typeText,
        url: result.url
      };

      this.agentState.uploadedPhotos.update(list => [...list, item]);
      this.closePhoto();
      console.log('Все фотографии в хранилище');
      console.log(this.agentState.uploadedPhotos());
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'Ошибка загрузки фото');
    } finally {
      this.savingPhoto = false;
      this.photoSaveText = 'Добавить';
    }
  }

  private async ensureRequirements(): Promise<void> {
    const list = await firstValueFrom(this.requirementsService.getAllPhotoRequirements());
    this.agentState.photoRequirements.set(list ?? []);
    this.selectedPhotoTypeId = list?.[0]?.id ?? null;
    this.resetPhotoDropZone();
  }

  private resetPhotoDropZone(): void {
    if (this.photoPreviewUrl) URL.revokeObjectURL(this.photoPreviewUrl);
    this.photoPreviewUrl = null;
    this.selectedPhotoFile = null;
  }
}
