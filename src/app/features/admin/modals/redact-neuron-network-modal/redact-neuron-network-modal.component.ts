import { Component, effect, inject, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminModal } from '../../../../core/model';
import { AdminModalService } from '../../data/admin-modal.service';

@Component({
  selector: 'app-redact-neuron-network-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './redact-neuron-network-modal.component.html'
})
export class RedactNeuronNetworkModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly key = AdminModal.RedactNeuronNetwork;
  private preparedId: number | null = null;

  redactNeuronName = '';
  redactNeuronLink = '';

  constructor() {
    effect(() => {
      if (!this.modal.isOpen(this.key)) {
        this.preparedId = null;
        return;
      }
      const nn = this.modal.selectedNeuronNetwork();
      if (nn && this.preparedId !== nn.id) {
        untracked(() => {
          this.preparedId = nn.id;
          this.redactNeuronName = nn.name;
          this.redactNeuronLink = nn.link;
        });
      }
    });
  }

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  submitRedactNeuronNetwork(): void {
    this.modal.close(this.key);
  }
}
