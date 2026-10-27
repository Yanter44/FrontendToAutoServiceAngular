import { Component, effect, inject, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { PromptService } from '../../../../core/services/prompt.service';
import { isApiOk } from '../../../../shared/util/api.util';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminPromptsFacade } from '../../data/admin-prompts.facade';

@Component({
  selector: 'app-redact-prompt-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './redact-prompt-modal.component.html'
})
export class RedactPromptModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly prompts = inject(AdminPromptsFacade);
  private readonly promptService = inject(PromptService);
  private readonly key = AdminModal.RedactPrompt;
  private preparedId: number | null = null;

  redactPromptTag = '';
  redactPromptDescription = '';

  constructor() {
    effect(() => {
      if (!this.modal.isOpen(this.key)) {
        this.preparedId = null;
        return;
      }
      const prompt = this.modal.selectedPrompt();
      if (prompt && this.preparedId !== prompt.promptId) {
        untracked(() => {
          this.preparedId = prompt.promptId;
          this.redactPromptTag = prompt.tag;
          this.redactPromptDescription = prompt.description;
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

  async submitRedactPrompt(): Promise<void> {
    const prompt = this.modal.selectedPrompt();
    if (!prompt) return;
    const result = await firstValueFrom(this.promptService.redactPrompt({
      promptId: prompt.promptId,
      tag: this.redactPromptTag,
      description: this.redactPromptDescription
    }));
    if (isApiOk(result)) {
      this.modal.close(this.key);
      await this.prompts.load();
    }
  }
}
