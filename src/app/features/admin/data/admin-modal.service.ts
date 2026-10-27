import { Injectable, inject, signal } from '@angular/core';
import { ADMIN_MODAL_NAMES, AdminModal, ApplicationPhoto, DocumentRequirement, GalleryPhotoDto, NeuronNetworkDto, PhotoRequirement, PromptDto,PromptTagSelection, PtoDto,UserDto} from '../../../core/model';
import { ModalService } from '../../../core/services/modal.service';

@Injectable({ providedIn: 'root' })
export class AdminModalService {
  private readonly modals = inject(ModalService);

  readonly selectedUser = signal<UserDto | null>(null);
  readonly selectedPto = signal<PtoDto | null>(null);
  readonly selectedPrompt = signal<PromptDto | null>(null);
  readonly selectedNeuronNetwork = signal<NeuronNetworkDto | null>(null);
  readonly selectedPhoto = signal<ApplicationPhoto | null>(null);
  readonly selectedPhotoRequirement = signal<PhotoRequirement | null>(null);
  readonly selectedDocumentRequirement = signal<DocumentRequirement | null>(null);
  readonly galleryPickerPhotos = signal<GalleryPhotoDto[]>([]);
  readonly selectedGalleryIds = signal<number[]>([]);
  readonly selectedPromptTags = signal<PromptTagSelection[]>([]);

  open(name: AdminModal): void {
    this.modals.open(name);
  }

  close(name: AdminModal): void {
    this.modals.close(name);
  }

  isOpen(name: AdminModal): boolean {
    return this.modals.isOpen(name);
  }

  hasOpenModal(): boolean {
    return ADMIN_MODAL_NAMES.some(name => this.modals.isOpen(name));
  }

  closeFromOverlay(event: Event, name: AdminModal): void {
    event.stopPropagation();
    this.close(name);
  }
}
