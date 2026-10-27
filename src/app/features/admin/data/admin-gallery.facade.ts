import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { emptyPagedResult } from '../../../core/model';
import { PhotoGalleryService } from '../../../core/services/photo-gallery.service';
import { ADMIN_PAGE_SIZES } from '../config/admin-page-sizes';
import { AdminStateService } from './admin-state.service';

@Injectable({ providedIn: 'root' })
export class AdminGalleryFacade {
  private readonly state = inject(AdminStateService);
  private readonly api = inject(PhotoGalleryService);

  async load(page = this.state.photoGalleryResult().page || 1): Promise<void> {
    try {
      const result = await firstValueFrom(this.api.getPhotoGallery(page, ADMIN_PAGE_SIZES.photogallery));
      if (result?.data) this.state.photoGalleryResult.set(result.data);
    } catch {
      this.state.photoGalleryResult.set(emptyPagedResult());
    }
  }
}
