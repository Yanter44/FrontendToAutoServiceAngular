import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NeuronNetworkService } from '../../../core/services/neuron-network.service';
import { ADMIN_PAGE_SIZES } from '../config/admin-page-sizes';
import { AdminStateService } from './admin-state.service';

@Injectable({ providedIn: 'root' })
export class AdminNeuronFacade {
  private readonly state = inject(AdminStateService);
  private readonly api = inject(NeuronNetworkService);

  async load(page = this.state.neuronNetworksResult().page || 1): Promise<void> {
    const result = await firstValueFrom(this.api.getNeuronNetworks(page, ADMIN_PAGE_SIZES.neuronNetworks));
    if (result?.data) this.state.neuronNetworksResult.set(result.data);
  }

  async loadAll(): Promise<void> {
    const result = await firstValueFrom(this.api.getAllNeuronNetworks());
    this.state.allNeuronNetworks.set(result?.data ?? []);
  }
}
