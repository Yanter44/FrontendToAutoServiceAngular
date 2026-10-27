import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { PromptService } from '../../../../core/services/prompt.service';
import { isApiOk } from '../../../../shared/util/api.util';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminPromptsFacade } from '../../data/admin-prompts.facade';

@Component({
  selector: 'app-delete-prompt-modal',
  standalone: true,
  templateUrl: './delete-prompt-modal.component.html'
})
export class DeletePromptModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly prompts = inject(AdminPromptsFacade);
  private readonly promptService = inject(PromptService);
  private readonly key = AdminModal.DeletePrompt;

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  selectedPromptTag(): string {
    return this.modal.selectedPrompt()?.tag || '';
  }

  async submitDeletePrompt(): Promise<void> {
    const prompt = this.modal.selectedPrompt();
    if (!prompt) return;
    const result = await firstValueFrom(this.promptService.deletePrompt(prompt.promptId));
    if (isApiOk(result)) {
      this.modal.close(this.key);
      await this.prompts.load();
    }
  }
}
