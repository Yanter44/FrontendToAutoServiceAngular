import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DocumentRequirement, PhotoRequirement } from '../../../core/model';
import { RequirementService } from '../../../core/services/requirement.service';
import { unwrapList } from '../../../shared/util/api.util';
import { AdminStateService } from './admin-state.service';

@Injectable({ providedIn: 'root' })
export class AdminRequirementsFacade {
  private readonly state = inject(AdminStateService);
  private readonly api = inject(RequirementService);

  async load(): Promise<void> {
    const photos = await firstValueFrom(this.api.getAllPhotoRequirements());
    const documents = await firstValueFrom(this.api.getAllDocumentRequirements());
    this.state.photoRequirements.set(unwrapList<PhotoRequirement>(photos));
    this.state.documentRequirements.set(unwrapList<DocumentRequirement>(documents));
  }
}
