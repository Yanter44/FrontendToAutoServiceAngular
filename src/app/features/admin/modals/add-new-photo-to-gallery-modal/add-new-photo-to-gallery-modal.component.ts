import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { CloudinaryService } from '../../../../core/services/cloudinary.service';
import { PhotoGalleryService } from '../../../../core/services/photo-gallery.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminGalleryFacade } from '../../data/admin-gallery.facade';
import { AdminModalService } from '../../data/admin-modal.service';

@Component({
  selector: 'app-add-new-photo-to-gallery-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-new-photo-to-gallery-modal.component.html'
})
export class AddNewPhotoToGalleryModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly gallery = inject(AdminGalleryFacade);
  private readonly cloudinaryService= inject(CloudinaryService);
  private readonly photoGalleryService = inject(PhotoGalleryService);
  private readonly toast = inject(ToastService);
  private readonly key = AdminModal.AddNewPhotoToGallery;

  galleryFile: File | null = null;
  galleryPreview: string | null = null;
  galleryTag = '';
  galleryGroup = '';
  galleryDragover = false;
  galleryUploading = false;

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  onGalleryDropZoneClick(event: Event): void {
    if ((event.target as HTMLElement).closest('.AddNewPhotoToGalleryReplaceBtn')) return;
    document.getElementById('PhotoFileInput')?.click();
  }

  onGalleryFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.handleGalleryFile(file);
  }

  onGalleryDragOver(event: DragEvent): void {
    event.preventDefault();
    this.galleryDragover = true;
  }

  onGalleryDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.galleryDragover = false;
  }

  onGalleryDrop(event: DragEvent): void {
    event.preventDefault();
    this.galleryDragover = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleGalleryFile(file);
  }

  handleGalleryFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.toast.error('Можно загружать только изображения');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.toast.error('Файл слишком большой (максимум 10 МБ)');
      return;
    }
    this.galleryFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.galleryPreview = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }

  async submitGalleryPhoto(): Promise<void> {
    const file = this.galleryFile;
    if (!file) {
      this.toast.error('Выберите фото');
      return;
    }
    if (!this.galleryTag.trim()) {
      this.toast.error('Введите тег');
      return;
    }
    if (!this.galleryGroup.trim()) {
      this.toast.error('Введите группу');
      return;
    }
    this.galleryUploading = true;
    try {
      const uploaded = await this.cloudinaryService.uploadPhoto(file, 'AdminUploadLibraryPhoto');
      const result = await firstValueFrom(this.photoGalleryService.addNewPhotoToGallery({
        tag: this.galleryTag.trim(),
        group: this.galleryGroup.trim(),
        publicId: uploaded.publicId,
        url: uploaded.url
      }));
      if (result?.success) {
        this.modal.close(this.key);
        this.resetGalleryForm();
        await this.gallery.load();
        this.toast.success('Фото добавлено');
      } else {
        this.toast.error('Не удалось добавить фото');
      }
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'Ошибка при загрузке фото');
    } finally {
      this.galleryUploading = false;
    }
  }

  private resetGalleryForm(): void {
    this.galleryFile = null;
    this.galleryPreview = null;
    this.galleryTag = '';
    this.galleryGroup = '';
    const input = document.getElementById('PhotoFileInput') as HTMLInputElement | null;
    if (input) input.value = '';
  }
}
