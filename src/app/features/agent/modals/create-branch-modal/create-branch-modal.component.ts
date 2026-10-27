import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgentModal, CreateBranchDto } from '../../../../core/model';
import { AgentModalService } from '../../data/agent-modal.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AgentBranchesFacade } from '../../data/agent-branches-fascade';

@Component({
  selector: 'app-create-branch-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-branch-modal.component.html'
})
export class CreateBranchModalComponent {
  private readonly agentModals = inject(AgentModalService);
  private readonly toast = inject(ToastService);
  private readonly branchesFacade = inject(AgentBranchesFacade);

  name = '';
  fee: number | null = null;

  isOpen(): boolean {
    return this.agentModals.isOpen(AgentModal.CreateBranch);
  }

  close(): void {
    this.reset();
    this.agentModals.close(AgentModal.CreateBranch);
  }

  async submit(): Promise<void> {
    const dto: CreateBranchDto = {
      name: this.name.trim(),
      fee: Number(this.fee)
    };

    if (!dto.name) {
      this.toast.error('Введите название ветки');
      return;
    }

    if (!Number.isFinite(dto.fee) || dto.fee < 0) {
      this.toast.error('Введите корректную наценку');
      return;
    }

    const ok = await this.branchesFacade.create(dto);
    if (ok) {
      this.close();
    }
  }

  private reset(): void {
    this.name = '';
    this.fee = null;
  }
}