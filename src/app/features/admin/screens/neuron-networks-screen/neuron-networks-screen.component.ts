import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminModal, NeuronNetworkDto } from '../../../../core/model';
import { neuronNetworksSortConfig } from '../../../../core/config/sort-configs';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ScreenLoadingComponent } from '../../../../shared/components/screen-loading/screen-loading.component';
import { filterPageItems } from '../../../../shared/util/filter.util';
import { ADMIN_PAGE_SIZES } from '../../config/admin-page-sizes';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminNeuronFacade } from '../../data/admin-neuron.facade';
import { AdminStateService } from '../../data/admin-state.service';

@Component({
  selector: 'app-admin-neuron-networks-screen',
  standalone: true,
  imports: [FormsModule, PaginationComponent, ScreenLoadingComponent],
  templateUrl: './neuron-networks-screen.component.html'
})
export class AdminNeuronNetworksScreenComponent implements OnInit {
  readonly state = inject(AdminStateService);
  private readonly neurons = inject(AdminNeuronFacade);
  private readonly modal = inject(AdminModalService);

  readonly search = signal('');
  readonly sort = signal('numberAsc');
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly pageSize = ADMIN_PAGE_SIZES.neuronNetworks;
  readonly result = computed(() => this.state.neuronNetworksResult());
  readonly items = computed(() =>
    filterPageItems(
      this.result().items ?? [],
      this.search(),
      neuronNetworksSortConfig.searchFields,
      this.sort(),
      neuronNetworksSortConfig.sortOptions
    )
  );

  async ngOnInit(): Promise<void> {
    await this.load(1);
  }

  async load(page: number): Promise<void> {
    this.loading.set(true);
    this.page.set(page);
    try {
      await this.neurons.load(page);
    } finally {
      this.loading.set(false);
    }
  }

  add(): void {
    this.modal.open(AdminModal.AddNewNeuronNetwork);
  }

  redact(item: NeuronNetworkDto): void {
    this.modal.selectedNeuronNetwork.set(item);
    this.modal.open(AdminModal.RedactNeuronNetwork);
  }

  remove(item: NeuronNetworkDto): void {
    this.modal.selectedNeuronNetwork.set(item);
    this.modal.open(AdminModal.DeleteNeuronNetwork);
  }
}
