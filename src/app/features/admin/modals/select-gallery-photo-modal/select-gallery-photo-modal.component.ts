import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminModal, GalleryPhotoDto } from '../../../../core/model';
import { photoFileName } from '../../../../shared/util/media.util';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminStateService } from '../../data/admin-state.service';

@Component({
  selector: 'app-select-gallery-photo-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './select-gallery-photo-modal.component.html'
})
export class SelectGalleryPhotoModalComponent {
  readonly modal = inject(AdminModalService);
  private readonly state = inject(AdminStateService);
  private readonly toast = inject(ToastService);
  private readonly key = AdminModal.SelectGalleryPhoto;

  /** Сколько доп. фото можно выбрать. Согласуй с лимитом на бэке. */
  readonly maxSelection = signal(4);

  readonly gallerySearch = signal('');

  readonly filteredGallery = computed(() => {
    const query = this.gallerySearch().trim().toLowerCase();
    const items = this.modal.galleryPickerPhotos();
    if (!query) return items;
    return items.filter(photo =>
      [photo.tag, photo.group, photo.name, photoFileName(photo)]
        .some(value => value?.toLowerCase().includes(query))
    );
  });

  readonly selectedCount = computed(() => this.modal.selectedGalleryIds().length);
  readonly isSelectionFull = computed(() => this.selectedCount() >= this.maxSelection());

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  photoName(photo: GalleryPhotoDto): string {
    return photoFileName(photo);
  }

  isGallerySelected(id: number): boolean {
    return this.modal.selectedGalleryIds().includes(id);
  }

  toggleGalleryPhoto(id: number): void {
    this.modal.selectedGalleryIds.update(ids => {
      if (ids.includes(id)) return ids.filter(item => item !== id);

      if (ids.length >= this.maxSelection()) {
        this.toast.error(`Можно выбрать не больше ${this.maxSelection()} фото`);
        return ids;
      }

      return [...ids, id];
    });
  }

  clearSelection(): void {
    this.modal.selectedGalleryIds.set([]);
  }

  confirmGalleryPicker(): void {
    const selected = this.modal.galleryPickerPhotos()
      .filter(photo => this.modal.selectedGalleryIds().includes(photo.id));
    this.state.additionalPhotos.set(selected);
    this.modal.close(this.key);
  }
}