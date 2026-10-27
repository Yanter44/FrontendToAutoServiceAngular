import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { PtoDto } from '../../../../core/model';
import { AdminDetailsSidebarService } from '../../data/admin-details-sidebar.service';
import { AdminPtosFacade } from '../../data/admin-ptos.facade';
import { AdminStateService } from '../../data/admin-state.service';

@Component({
  selector: 'app-pto-details-sidebar',
  standalone: true,
  host: { style: 'display: block' },
  templateUrl: './pto-details-sidebar.component.html'
})
export class PtoDetailsSidebarComponent {
  private readonly detailsSidebar = inject(AdminDetailsSidebarService);
  private readonly ptosFacade = inject(AdminPtosFacade);
  private readonly state = inject(AdminStateService);

  readonly pto = computed(() => this.detailsSidebar.data<PtoDto>());
  readonly detailsTab = signal<'ptodata' | 'ptoprices'>('ptodata');


  private readonly vehicleCategoriesBySrtsById = computed(() =>
    new Map(this.state.vehicleCategoriesBySrts().map(c => [c.id, c.name]))
  );

  readonly priceRows = computed(() => {
    const list = this.pto()?.pricePolicies ?? [];
    const map = this.vehicleCategoriesBySrtsById();
    return list.map(p => ({
      id: p.vehicleCategoriesBySrtsId,
      name: map.get(p.vehicleCategoriesBySrtsId) ?? `Категория ${p.vehicleCategoriesBySrtsId}`,
      price: p.price,
    }));
  });

  constructor() {
    effect(() => {
      this.pto();
      untracked(() => this.detailsTab.set('ptodata'));
    });

    void this.ptosFacade.loadVehicleCategoriesBySrts();
  }

  setDetailsTab(tab: 'ptodata' | 'ptoprices'): void {
    this.detailsTab.set(tab);
  }
}