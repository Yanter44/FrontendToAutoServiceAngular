import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { AdminModal, ApplicationDto, ApplicationPhoto } from '../../../../core/model';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminNeuronFacade } from '../../data/admin-neuron.facade';
import { AdminPromptsFacade } from '../../data/admin-prompts.facade';
import { AdminStateService } from '../../data/admin-state.service';
import { staffApplicationStatusMeta } from '../../../../core/utils/staff-application-status-meta';
import { AdminApplicationsFacade } from '../../data/admin-applications.facade';
import { AdminDetailsSidebarService } from '../../data/admin-details-sidebar.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ApplicationStatus } from '../../../../core/model';
import {
  documentBlock,
  extraFacts,
  gasCylinderBlock,
  gasEquipmentBlock,
  primaryFacts,
  ptoBlock,
  tachographBlock,
  vehicleTitle
} from '../../../../shared/util/application-details-view';
@Component({
  selector: 'app-application-details-sidebar',
  standalone: true,
  host: { style: 'display: block' },
  templateUrl: './application-details-sidebar.component.html'
})

export class ApplicationDetailsSidebarComponent {
  private readonly state = inject(AdminStateService);
  private readonly modal = inject(AdminModalService);
  private readonly neurons = inject(AdminNeuronFacade);
  private readonly prompts = inject(AdminPromptsFacade);
  private readonly applicationsFacade = inject(AdminApplicationsFacade);
  private readonly detailsSidebar = inject(AdminDetailsSidebarService);
  private readonly toast = inject(ToastService);

  readonly AcceptApplicationIsConfirming = signal(false);       

  readonly detailsTab = signal<'vehicle' | 'media'>('vehicle');
  readonly application = computed(() => this.detailsSidebar.data<ApplicationDto>());
  readonly primaryOf = primaryFacts;
  readonly extraOf = extraFacts;
  readonly titleOf = vehicleTitle;
  readonly documentOf = documentBlock;
  readonly tachographOf = tachographBlock;
  readonly gasEquipmentOf = gasEquipmentBlock;
  readonly gasCylinderOf = gasCylinderBlock;

  readonly applicationStatus = computed(() => {
    const app = this.application();
    return staffApplicationStatusMeta(app?.status, app?.errorMessage);
  });
  
  readonly canModerate = computed(() => {
    const app = this.application();
    return app?.status == ApplicationStatus.OnModeration;
  });

  constructor() {
    effect(() => {
      this.application();
      untracked(() => this.detailsTab.set('vehicle'));
    });
  }

  setDetailsTab(tab: 'vehicle' | 'media'): void {
    this.detailsTab.set(tab);
  }

  ptoOf(app: ApplicationDto) {
    return ptoBlock(app, this.state.ptosResult().items);
  }
  
  openEditPhoto(event: Event, photo: ApplicationPhoto): void {
    event.preventDefault();
    event.stopPropagation();
    void this.prepareEditPhoto(photo);
  }

  photoUrl(photo: ApplicationPhoto): string {
    return photo.url || photo.photoUrl || '';
  }

  private async prepareEditPhoto(photo: ApplicationPhoto): Promise<void> {
    this.modal.selectedPhoto.set(photo);
    this.state.generatedPhotoByAi.set(null);
    this.state.additionalPhotos.set([]);
    this.modal.selectedPromptTags.set([]);
    await this.neurons.loadAll();
    await this.prompts.loadAll();
    this.modal.open(AdminModal.EditApplicationPhoto);
  }

  async confirmApplication(applicationId: number): Promise<void> {
    if (this.AcceptApplicationIsConfirming()) return;
    this.AcceptApplicationIsConfirming.set(true);
    try {
      await this.applicationsFacade.accept(applicationId);
    } catch (err) {
      console.error('Ошибка подтверждения заявки', err);
      this.toast.error('Выберите агента');
    } finally {
      this.AcceptApplicationIsConfirming.set(false);
    }
  }

  openRejectModal(app: ApplicationDto): void {
    console.log(app.email);
    this.modal.open(AdminModal.RejectApplication);
  }
}
