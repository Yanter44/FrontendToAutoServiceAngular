import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminModal, PtoDto } from '../../../../core/model';
import { ptosSortConfig } from '../../../../core/config/sort-configs';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ScreenLoadingComponent } from '../../../../shared/components/screen-loading/screen-loading.component';
import { filterPageItems } from '../../../../shared/util/filter.util';
import { ADMIN_PAGE_SIZES } from '../../config/admin-page-sizes';
import { AdminDetailsSidebarService } from '../../data/admin-details-sidebar.service';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminPtosFacade } from '../../data/admin-ptos.facade';
import { AdminStateService } from '../../data/admin-state.service';
import { PtoDetailsSidebarComponent } from '../../layout/pto-details-sidebar/pto-details-sidebar.component';

@Component({
  selector: 'app-admin-ptos-screen',
  standalone: true,
  imports: [FormsModule, PaginationComponent, ScreenLoadingComponent],
  templateUrl: './ptos-screen.component.html'
})
export class AdminPtosScreenComponent implements OnInit {
  readonly state = inject(AdminStateService);
  private readonly ptos = inject(AdminPtosFacade);
  private readonly modal = inject(AdminModalService);
  private readonly detailsSidebar = inject(AdminDetailsSidebarService);

  readonly search = signal('');
  readonly sort = signal('numberAsc');
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly pageSize = ADMIN_PAGE_SIZES.ptos;
  readonly result = computed(() => this.state.ptosResult());
  readonly items = computed(() =>
    filterPageItems(this.result().items ?? [], this.search(), ptosSortConfig.searchFields, this.sort(), ptosSortConfig.sortOptions)
  );

  async ngOnInit(): Promise<void> {
    await this.load(1);
  }

  async load(page: number): Promise<void> {
    this.loading.set(true);
    this.page.set(page);
    try {
      await this.ptos.load(page);
    } finally {
      this.loading.set(false);
    }
  }

  add(): void {
    void this.ptos.loadVehicleCategoriesBySrts().then(() => this.modal.open(AdminModal.AddNewPto));
  }

  redact(pto: PtoDto): void {
    this.modal.selectedPto.set(pto);
    this.modal.open(AdminModal.RedactPto);
  }

  remove(pto: PtoDto): void {
    this.modal.selectedPto.set(pto);
    this.modal.open(AdminModal.DeletePto);
  }

  selectedPto(pto: PtoDto): void {
    this.state.selectedApplication.set(null);
    this.detailsSidebar.show(PtoDetailsSidebarComponent, pto);
    console.log(pto);
  }
}
