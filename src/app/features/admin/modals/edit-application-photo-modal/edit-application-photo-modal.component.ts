import { Component, HostListener, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal, PromptTagSelection } from '../../../../core/model';
import { NeuronNetworkService } from '../../../../core/services/neuron-network.service';
import { PhotoGalleryService } from '../../../../core/services/photo-gallery.service';
import { ToastService } from '../../../../core/services/toast.service';
import { generatedPhotoSrc } from '../../../../shared/util/media.util';
import { PromptTagsInputComponent } from '../../../../shared/components/prompt-tags-input/prompt-tags-input.component';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminStateService } from '../../data/admin-state.service';

@Component({
  selector: 'app-edit-application-photo-modal',
  standalone: true,
  imports: [FormsModule, PromptTagsInputComponent],
  templateUrl: './edit-application-photo-modal.component.html'
})
export class EditApplicationPhotoModalComponent {
  readonly state = inject(AdminStateService);
  readonly modal = inject(AdminModalService);
  private readonly neuronNetworkService = inject(NeuronNetworkService);
  private readonly photoGalleryService = inject(PhotoGalleryService);
  private readonly toast = inject(ToastService);
  private readonly key = AdminModal.EditApplicationPhoto;

  selectedNeuronNetworkId: number | null = null;
  generatingPhoto = false;
  readonly previewUrl = signal<string | null>(null);

  readonly generatedSrc = computed(() => {
    const value = this.state.generatedPhotoByAi();
    return value ? generatedPhotoSrc(value) : null;
  });
  readonly additionalPhotos = computed(() => this.state.additionalPhotos());
  readonly selectedTags = computed(() => this.modal.selectedPromptTags());

  constructor() {
    effect(() => {
      if (!this.modal.isOpen(this.key)) {
        this.selectedNeuronNetworkId = null;
        this.previewUrl.set(null);
        return;
      }
      untracked(() => {
        const first = this.state.allNeuronNetworks()[0];
        if (this.selectedNeuronNetworkId == null && first) {
          this.selectedNeuronNetworkId = first.id;
        }
      });
    });
  }

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  originalPhotoUrl(): string {
    const photo = this.modal.selectedPhoto();
    return photo?.url || photo?.photoUrl || '';
  }

  openPreview(url: string): void {
    if (!url) return;
    this.previewUrl.set(url);
  }

  closePreview(): void {
    this.previewUrl.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.previewUrl()) this.closePreview();
  }

  onPromptTagsChange(tags: PromptTagSelection[]): void {
    this.modal.selectedPromptTags.set(tags);
  }

  async openGalleryPicker(): Promise<void> {
    try {
      const result = await firstValueFrom(this.photoGalleryService.getPhotoGallery(1, 200));
      this.modal.galleryPickerPhotos.set(result?.data?.items ?? []);
    } catch {
      this.modal.galleryPickerPhotos.set([]);
    }
    this.modal.selectedGalleryIds.set(this.state.additionalPhotos().map(photo => photo.id));
    this.modal.open(AdminModal.SelectGalleryPhoto);
  }

  async generatePhoto(): Promise<void> {
    const application = this.state.selectedApplication();
    const photo = this.modal.selectedPhoto();
    if (!application || !photo?.id) return;

    if (!this.selectedTags().length) {
      this.toast.error('Выберите хотя бы один тег для генерации');
      return;
    }

    if (this.selectedNeuronNetworkId == null || `${this.selectedNeuronNetworkId}` === '') {
      this.toast.error('Выберите нейросеть');
      return;
    }

    const additionalPhotoUrls = this.additionalPhotos()
      .map(p => p.url)
      .filter((url): url is string => !!url);

    this.generatingPhoto = true;
    try {
      const result = await firstValueFrom(this.neuronNetworkService.generatePhoto({
        applicationId: application.id,
        photoId: photo.id,
        neuronNetworkId: Number(this.selectedNeuronNetworkId),
        promptsIds: this.selectedTags().map(tag => tag.promptId),
        additionalPhotoUrls,   // ← вот оно
      }));

      const image = result?.data?.imageBase64;
      if (image) {
        this.state.generatedPhotoByAi.set(image);
      } else {
        this.toast.error(result?.message ?? 'Не удалось сгенерировать фото');
      }
    } catch (err) {
      console.error('Ошибка генерации', err);
      this.toast.error('Ошибка генерации фото');
    } finally {
      this.generatingPhoto = false;
    }
  }

  async confirmGeneratedPhoto(): Promise<void> {
    const application = this.state.selectedApplication();
    const photo = this.modal.selectedPhoto();
    const imageBase64 = this.state.generatedPhotoByAi();
    if (!application || !photo?.id || !imageBase64) return;
    this.modal.close(this.key);

    await firstValueFrom(this.neuronNetworkService.confirmGeneratedPhotoByAI({
      applicationId: application.id,
      photoId: photo.id,
      imageBase64
    }));
    
    this.toast.success('Фото подтверждено');
  }
}
