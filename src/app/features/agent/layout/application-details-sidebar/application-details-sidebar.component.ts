import { Component, effect, inject } from '@angular/core';
import { ApplicationDocument, ApplicationDto, ApplicationPhoto } from '../../../../core/model';
import { agentApplicationStatusMeta } from '../../../../core/utils/agent-application-status-meta';
import { AgentStateService } from '../../data/agent-state.service';
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
  host: { class: 'DetailsSidebar' },
  templateUrl: './application-details-sidebar.component.html'
})
export class ApplicationDetailsSidebarComponent {
  private readonly agentState = inject(AgentStateService);

  detailsTab: 'vehicle' | 'media' = 'vehicle';
  tabFadeIn = true;
  readonly primaryOf = primaryFacts;
  readonly extraOf = extraFacts;
  readonly titleOf = vehicleTitle;
  readonly documentOf = documentBlock;
  readonly tachographOf = tachographBlock;
  readonly gasEquipmentOf = gasEquipmentBlock;
  readonly gasCylinderOf = gasCylinderBlock;

  constructor() {
    effect(() => {
      const app = this.agentState.selectedApplication();
      if (app) {
        this.detailsTab = 'vehicle';
        this.tabFadeIn = true;
      }
    });
  }

  application(): ApplicationDto | null {
    return this.agentState.selectedApplication();
  }

  statusMeta(app: ApplicationDto): { className: string; label: string } {
    return agentApplicationStatusMeta(app.status, app.errorMessage);
  }

  photoUrl(photo: ApplicationPhoto): string {
    return photo.url || photo.photoUrl || '';
  }

  documentUrl(doc: ApplicationDocument): string {
    return doc.url || doc.documentUrl || '';
  }

  selectDetailsTab(tab: 'vehicle' | 'media'): void {
    this.detailsTab = tab;
    this.tabFadeIn = false;
    setTimeout(() => {
      this.tabFadeIn = true;
    }, 10);
  }

  ptoOf(app: ApplicationDto) {
    return ptoBlock(app, this.agentState.ptos());
  }
}
