import { Component, inject } from '@angular/core';
import { AdminModal } from '../../../../core/model';
import { AdminModalService } from '../../data/admin-modal.service';

@Component({
  selector: 'app-delete-neuron-network-modal',
  standalone: true,
  templateUrl: './delete-neuron-network-modal.component.html'
})
export class DeleteNeuronNetworkModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly key = AdminModal.DeleteNeuronNetwork;

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  selectedNeuronName(): string {
    return this.modal.selectedNeuronNetwork()?.name || '';
  }

  submitDeleteNeuronNetwork(): void {
    this.modal.close(this.key);
  }
}
