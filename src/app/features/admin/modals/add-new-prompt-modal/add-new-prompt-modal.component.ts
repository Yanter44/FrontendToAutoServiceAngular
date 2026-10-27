import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { PromptService } from '../../../../core/services/prompt.service';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminPromptsFacade } from '../../data/admin-prompts.facade';

@Component({
  selector: 'app-add-new-prompt-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-new-prompt-modal.component.html'
})
export class AddNewPromptModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly prompts = inject(AdminPromptsFacade);
  private readonly promptService = inject(PromptService);
  private readonly key = AdminModal.AddNewPrompt;

  promptTag = '';
  promptDescription = '';

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  async submitNewPrompt(): Promise<void> {
    if (!this.promptTag.trim() || !this.promptDescription.trim()) {
      alert('Пожалуйста, заполните все поля!');
      return;
    }
    const ok = await firstValueFrom(this.promptService.addNewPrompt(this.promptTag.trim(), this.promptDescription.trim()));
    if (ok) {
      this.promptTag = '';
      this.promptDescription = '';
      this.modal.close(this.key);
      await this.prompts.load();
    } else {
      alert('Ошибка при создании промпта');
    }
  }
}
