import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApplicationDto } from '../../../../core/model';
import { applicationsSortConfig } from '../../../../core/config/sort-configs';
import { staffApplicationStatusMeta } from '../../../../core/utils/staff-application-status-meta';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ScreenLoadingComponent } from '../../../../shared/components/screen-loading/screen-loading.component';
import { RuDatePipe } from '../../../../shared/pipes/ru-date.pipe';
import { filterPageItems } from '../../../../shared/util/filter.util';
import { ADMIN_PAGE_SIZES } from '../../config/admin-page-sizes';
import { AdminApplicationsFacade } from '../../data/admin-applications.facade';
import { AdminDetailsSidebarService } from '../../data/admin-details-sidebar.service';
import { AdminStateService } from '../../data/admin-state.service';
import { ApplicationDetailsSidebarComponent } from '../../layout/application-details-sidebar/application-details-sidebar.component';

@Component({
  selector: 'app-admin-applications-screen',
  standalone: true,
  imports: [FormsModule, PaginationComponent, RuDatePipe, ScreenLoadingComponent],
  templateUrl: './applications-screen.component.html'
})
export class AdminApplicationsScreenComponent implements OnInit {
  readonly state = inject(AdminStateService);
  private readonly applications = inject(AdminApplicationsFacade);
  private readonly detailsSidebar = inject(AdminDetailsSidebarService);

  readonly search = signal('');
  readonly sort = signal('newest');
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly pageSize = ADMIN_PAGE_SIZES.applications;
  readonly metrics = computed(() => this.state.applicationsMetrics());
  readonly result = computed(() => this.state.applicationsResult());
  
  readonly items = computed(() =>
    filterPageItems(
      this.result().items ?? [],
      this.search(),
      applicationsSortConfig.searchFields,
      this.sort(),
      applicationsSortConfig.sortOptions
    )
  );

  async ngOnInit(): Promise<void> {
    try {
      await this.applications.loadMetrics();
      await this.load(1);
    } finally {
      this.loading.set(false);
    }
  }

  async load(page: number): Promise<void> {
    this.loading.set(true);
    this.page.set(page);
    try {
      await this.applications.load(page);
    } finally {
      this.loading.set(false);
    }
  }

  statusMeta(app: ApplicationDto) {
    return staffApplicationStatusMeta(app.status, app.errorMessage);
  }

  selectApplication(app: ApplicationDto): void {
    this.state.selectedApplication.set(app);
    this.detailsSidebar.show(ApplicationDetailsSidebarComponent, app);
  }
}
