import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { applicationsSortConfig } from '../../../../core/config/sort-configs';
import { AgentModal, ApplicationDto, ApplicationProvidedDocument, PtoDto, VehicleCategory } from '../../../../core/model';
import { AgentModalService } from '../../data/agent-modal.service';
import { AgentStateService } from '../../data/agent-state.service';
import { ApplicationService } from '../../../../core/services/application.service';
import { PtoService } from '../../../../core/services/pto.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { filterAndSort } from '../../../../core/utils/helpers';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ScreenLoadingComponent } from '../../../../shared/components/screen-loading/screen-loading.component';
import { RuDatePipe } from '../../../../shared/pipes/ru-date.pipe';
import { unwrapList } from '../../../../shared/util/api.util';
import { agentApplicationStatusMeta } from '../../../../core/utils/agent-application-status-meta';
import { RequirementService } from '../../../../core/services/requirement.service';

@Component({
  selector: 'app-agent-applications-screen',
  standalone: true,
  imports: [FormsModule, PaginationComponent, RuDatePipe, ScreenLoadingComponent],
  templateUrl: './applications-screen.component.html',
  host: { class: 'ApplicationsScreen ScreenContainer' },
  styles: [`:host { display: block; height: 100%; min-height: 0; }`]
})

export class AgentApplicationsScreenComponent implements OnInit {
  readonly agentState = inject(AgentStateService);
  private readonly applicationService = inject(ApplicationService);
  private readonly vehicleService = inject(VehicleService);
  private readonly ptoService = inject(PtoService);
  private readonly agentModals = inject(AgentModalService);
  private readonly requirementService = inject(RequirementService);

  readonly pageSize = 10;
  readonly loading = signal(true);
  search = '';
  sort = 'newest';
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  async ngOnInit(): Promise<void> {
    try {
      await this.ensureApplications();
      await this.ensureApplicationProvidedDocuments();
      await this.ensureVehicleCategoriesBySrts();
      await this.ensureVehicleCategoriesByOkp();
      await this.ensurePtos();
      await this.ensureMetrics();
      await this.loadPage(1);
    } finally {
      this.loading.set(false);
    }
  }

  displayedApplications(): ApplicationDto[] {
    return filterAndSort({
      items: this.agentState.applicationsResult().items as never,
      searchValue: this.search,
      searchFields: applicationsSortConfig.searchFields,
      sortValue: this.sort,
      sortOptions: applicationsSortConfig.sortOptions as never
    }) as unknown as ApplicationDto[];
  }

  onSearchInput(value: string): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.search = value;
    }, 300);
  }

  onSortChange(value: string): void {
    this.sort = value;
  }

  openCreate(): void {
    this.agentModals.open(AgentModal.CreateApplication);
  }

  openSidebar(app: ApplicationDto): void {
    this.agentState.selectedApplication.set(app);
  }

  statusMeta(app: ApplicationDto): { className: string; label: string } {
    return agentApplicationStatusMeta(app.status, app.errorMessage);
  }

  vehicleLabel(app: ApplicationDto): string {
    const label = `${app.brand || ''} ${app.model || ''}`.trim();
    return label || 'Не указано';
  }

  async loadPage(page: number): Promise<void> {
    this.loading.set(true);
    try {
      const result = await firstValueFrom(this.applicationService.getApplications(page, this.pageSize));
      if (result?.data) {
        this.agentState.applicationsResult.set(result.data);
      }
    } finally {
      this.loading.set(false);
    }
  }

  private async ensureApplications(): Promise<void> {
    if (this.agentState.applicationsResult().items.length === 0) {
      const result = await firstValueFrom(this.applicationService.getApplications(1, this.pageSize));
      if (result?.data) {
        this.agentState.applicationsResult.set(result.data);
        console.log(result.data);
      }
    }
  }

  private async ensureVehicleCategoriesBySrts(): Promise<void> {
    if (this.agentState.vehicleCategoriesBySrts().length > 0) return;
    const raw = await firstValueFrom(this.vehicleService.getAllVehicleCategoriesBySrts());
    const categoriesBySrts = unwrapList<VehicleCategory>(raw);
    console.log('Категории по СРТС из API:', categoriesBySrts);
    this.agentState.vehicleCategoriesBySrts.set(categoriesBySrts);
  }
  private async ensureApplicationProvidedDocuments(): Promise<void> {
    if(this.agentState.applicationProvidedDocuments().length > 0) return;
    const raw = await firstValueFrom(this.requirementService.getAllDocumentRequirements());
    const applicationProvidedDocuments = unwrapList<ApplicationProvidedDocument>(raw);
    console.log('Необходимые документы из API:', applicationProvidedDocuments);
    this.agentState.applicationProvidedDocuments.set(applicationProvidedDocuments);
  }

  private async ensureVehicleCategoriesByOkp(): Promise<void> {
     if(this.agentState.vehicleCategoriesByOkp().length > 0) return;
     const raw = await firstValueFrom(this.vehicleService.getAllVehicleCategoriesByOkp());
     const categoriesByOkp = unwrapList<VehicleCategory>(raw);
     console.log('Категории по ОКП из API:', categoriesByOkp);
     this.agentState.vehicleCategoriesByOkp.set(categoriesByOkp);
  }

  private async ensurePtos(): Promise<void> {
    if (this.agentState.ptos().length > 0) return;
    const raw = await firstValueFrom(this.ptoService.getAllPtos());
    const ptos = unwrapList<PtoDto>(raw);
    console.log('ПТО из API:', ptos);
    this.agentState.ptos.set(ptos);
  }

  private async ensureMetrics(): Promise<void> {
    const metrics = await firstValueFrom(this.applicationService.getApplicationsMetrics());
    if (metrics) {
      this.agentState.applicationsMetrics.set({
        totalApplicationsCount: metrics.totalApplicationsCount ?? 0,
        totalApplicationsInModerationCount: metrics.totalApplicationsInModerationCount ?? 0,
        totalApplicationsApprovedCount: metrics.totalApplicationsApprovedCount ?? 0,
        totalApplicationsTodayCount: metrics.totalApplicationsTodayCount ?? 0
      });
    }
  }
}
