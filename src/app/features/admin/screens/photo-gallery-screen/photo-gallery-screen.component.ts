import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminModal, GalleryPhotoDto } from '../../../../core/model';
import { dateTimeFormatter } from '../../../../core/utils/helpers';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ScreenLoadingComponent } from '../../../../shared/components/screen-loading/screen-loading.component';
import { filterPageItems } from '../../../../shared/util/filter.util';
import { photoFileName } from '../../../../shared/util/media.util';
import { ADMIN_PAGE_SIZES } from '../../config/admin-page-sizes';
import { AdminGalleryFacade } from '../../data/admin-gallery.facade';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminStateService } from '../../data/admin-state.service';

const photoGallerySortConfig = {
  searchFields: ['id', 'tag', 'group', 'name', 'publicId'],
  sortOptions: {
    numberAsc: (a: GalleryPhotoDto, b: GalleryPhotoDto) => a.id - b.id,
    numberDesc: (a: GalleryPhotoDto, b: GalleryPhotoDto) => b.id - a.id
  }
};

@Component({
  selector: 'app-admin-photo-gallery-screen',
  standalone: true,
  imports: [FormsModule, PaginationComponent, ScreenLoadingComponent],
  templateUrl: './photo-gallery-screen.component.html'
})
export class AdminPhotoGalleryScreenComponent implements OnInit {
  readonly state = inject(AdminStateService);
  private readonly gallery = inject(AdminGalleryFacade);
  private readonly modal = inject(AdminModalService);

  readonly search = signal('');
  readonly sort = signal('numberAsc');
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly pageSize = ADMIN_PAGE_SIZES.photogallery;
  readonly result = computed(() => this.state.photoGalleryResult());
  readonly items = computed(() =>
    filterPageItems(
      this.result().items ?? [],
      this.search(),
      photoGallerySortConfig.searchFields,
      this.sort(),
      photoGallerySortConfig.sortOptions
    )
  );

  async ngOnInit(): Promise<void> {
    await this.load(1);
  }

  async load(page: number): Promise<void> {
    this.loading.set(true);
    this.page.set(page);
    try {
      await this.gallery.load(page);
    } finally {
      this.loading.set(false);
    }
  }

  fileName(photo: GalleryPhotoDto): string {
    return photoFileName(photo);
  }

  date(photo: GalleryPhotoDto): string {
    return dateTimeFormatter.formatDate(photo.createdAt);
  }

  add(): void {
    this.modal.open(AdminModal.AddNewPhotoToGallery);
  }
}
