import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminModal, PromptDto } from '../../../../core/model';
import { promptsSortConfig } from '../../../../core/config/sort-configs';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ScreenLoadingComponent } from '../../../../shared/components/screen-loading/screen-loading.component';
import { filterPageItems } from '../../../../shared/util/filter.util';
import { ADMIN_PAGE_SIZES } from '../../config/admin-page-sizes';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminPromptsFacade } from '../../data/admin-prompts.facade';
import { AdminStateService } from '../../data/admin-state.service';

@Component({
  selector: 'app-admin-prompts-screen',
  standalone: true,
  imports: [FormsModule, PaginationComponent, ScreenLoadingComponent],
  templateUrl: './prompts-screen.component.html'
})
export class AdminPromptsScreenComponent implements OnInit {
  readonly state = inject(AdminStateService);
  private readonly prompts = inject(AdminPromptsFacade);
  private readonly modal = inject(AdminModalService);

  readonly search = signal('');
  readonly sort = signal('numberAsc');
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly pageSize = ADMIN_PAGE_SIZES.prompts;
  readonly result = computed(() => this.state.promptsResult());
  readonly items = computed(() =>
    filterPageItems(this.result().items ?? [], this.search(), promptsSortConfig.searchFields, this.sort(), promptsSortConfig.sortOptions)
  );

  async ngOnInit(): Promise<void> {
    await this.load(1);
  }

  async load(page: number): Promise<void> {
    this.loading.set(true);
    this.page.set(page);
    try {
      await this.prompts.load(page);
    } finally {
      this.loading.set(false);
    }
  }

  add(): void {
    this.modal.open(AdminModal.AddNewPrompt);
  }

  redact(prompt: PromptDto): void {
    this.modal.selectedPrompt.set(prompt);
    this.modal.open(AdminModal.RedactPrompt);
  }

  remove(prompt: PromptDto): void {
    this.modal.selectedPrompt.set(prompt);
    this.modal.open(AdminModal.DeletePrompt);
  }
}
