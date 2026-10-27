import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { NeuronNetworkService } from '../../../../core/services/neuron-network.service';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminNeuronFacade } from '../../data/admin-neuron.facade';

@Component({
  selector: 'app-add-new-neuron-network-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-new-neuron-network-modal.component.html'
})
export class AddNewNeuronNetworkModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly neurons = inject(AdminNeuronFacade);
  private readonly neuronNetworkService = inject(NeuronNetworkService);
  private readonly key = AdminModal.AddNewNeuronNetwork;

  neuronName = '';
  neuronLink = '';

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  async submitNewNeuronNetwork(): Promise<void> {
    if (!this.neuronName.trim()) {
      alert('Введите имя нейронной сети');
      return;
    }
    if (!this.neuronLink.trim()) {
      alert('Введите ссылку на нейронную сеть с route ai');
      return;
    }
    const ok = await firstValueFrom(this.neuronNetworkService.addNewNeuronNetwork({
      name: this.neuronName.trim(),
      link: this.neuronLink.trim()
    }));
    if (ok) {
      this.neuronName = '';
      this.neuronLink = '';
      this.modal.close(this.key);
      await this.neurons.load(1);
    } else {
      alert('Не удалось добавить нейронную сеть');
    }
  }
}
