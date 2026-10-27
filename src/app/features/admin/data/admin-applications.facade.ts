import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ADMIN_PAGE_SIZES } from '../config/admin-page-sizes';
import { AdminDetailsSidebarService } from './admin-details-sidebar.service';
import { AdminStateService } from './admin-state.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AcceptApplicationDto } from '../../../core/model';
import { RejectApplicationDto } from '../../../core/model';

@Injectable({ providedIn: 'root' })
export class AdminApplicationsFacade {
  private readonly state = inject(AdminStateService);
  private readonly detailsSidebar = inject(AdminDetailsSidebarService);
  private readonly api = inject(ApplicationService);

  async load(page = this.state.applicationsResult().page || 1): Promise<void> {
    const result = await firstValueFrom(this.api.getApplications(page, ADMIN_PAGE_SIZES.applications));
    if (result?.data) this.state.applicationsResult.set(result.data);
    console.log(result?.data);
  }

  async loadMetrics(): Promise<void> {
    const metrics = await firstValueFrom(this.api.getApplicationsMetrics());
    if (metrics) {
      this.state.applicationsMetrics.set({
        totalApplicationsCount: metrics.totalApplicationsCount ?? 0,
        totalApplicationsInModerationCount: metrics.totalApplicationsInModerationCount ?? 0,
        totalApplicationsApprovedCount: metrics.totalApplicationsApprovedCount ?? 0,
        totalApplicationsTodayCount: metrics.totalApplicationsTodayCount ?? 0
      });
    }
  }
  async accept(id: number): Promise<void> {
    const model: AcceptApplicationDto = { applicationId: id };
    await firstValueFrom(this.api.acceptApplication(model));
    await this.load();
    this.state.selectedApplication.set(null);
    this.detailsSidebar.close();
  }

  async reject(id: number, reason: string): Promise<void> {
    const model: RejectApplicationDto = { applicationId: id, rejectReason: reason };
    await firstValueFrom(this.api.rejectApplication(model));
    await this.load();
    this.state.selectedApplication.set(null);
    this.detailsSidebar.close();
  }
}
