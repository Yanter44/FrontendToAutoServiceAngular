import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminModal, DocumentRequirement, PhotoRequirement } from '../../../../core/model';
import { ScreenLoadingComponent } from '../../../../shared/components/screen-loading/screen-loading.component';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminRequirementsFacade } from '../../data/admin-requirements.facade';
import { AdminStateService } from '../../data/admin-state.service';

@Component({
  selector: 'app-admin-requirements-screen',
  standalone: true,
  imports: [ScreenLoadingComponent],
  templateUrl: './requirements-screen.component.html'
})
export class AdminRequirementsScreenComponent implements OnInit {
  readonly state = inject(AdminStateService);
  private readonly requirements = inject(AdminRequirementsFacade);
  private readonly modal = inject(AdminModalService);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      await this.requirements.load();
    } finally {
      this.loading.set(false);
    }
  }

  addPhoto(): void {
    this.modal.open(AdminModal.AddNewPhotoRequirement);
  }

  addDocument(): void {
    this.modal.open(AdminModal.AddNewDocumentRequirement);
  }

  editPhoto(item: PhotoRequirement): void {
    this.modal.selectedPhotoRequirement.set(item);
    this.modal.open(AdminModal.EditPhotoRequirement);
  }

  deletePhoto(item: PhotoRequirement): void {
    this.modal.selectedPhotoRequirement.set(item);
    this.modal.open(AdminModal.DeletePhotoRequirement);
  }

  editDocument(item: DocumentRequirement): void {
    this.modal.selectedDocumentRequirement.set(item);
    this.modal.open(AdminModal.EditDocumentRequirement);
  }

  deleteDocument(item: DocumentRequirement): void {
    this.modal.selectedDocumentRequirement.set(item);
    this.modal.open(AdminModal.DeleteDocumentRequirement);
  }
}
