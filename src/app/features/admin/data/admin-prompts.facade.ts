import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PromptDto } from '../../../core/model';
import { PromptService } from '../../../core/services/prompt.service';
import { unwrapList } from '../../../shared/util/api.util';
import { ADMIN_PAGE_SIZES } from '../config/admin-page-sizes';
import { AdminStateService } from './admin-state.service';

@Injectable({ providedIn: 'root' })
export class AdminPromptsFacade {
  private readonly state = inject(AdminStateService);
  private readonly api = inject(PromptService);

  async load(page = this.state.promptsResult().page || 1): Promise<void> {
    const result = await firstValueFrom(this.api.getPrompts(page, ADMIN_PAGE_SIZES.prompts));
    if (result?.data) this.state.promptsResult.set(result.data);
  }

  async loadAll(): Promise<PromptDto[]> {
    const raw = await firstValueFrom(this.api.getAllPrompts());
    let items = unwrapList<unknown>(raw).map(normalizePrompt).filter((item): item is PromptDto => !!item);
    if (!items.length) {
      const paged = await firstValueFrom(this.api.getPrompts(1, 500));
      items = (paged?.data?.items ?? []).map(normalizePrompt).filter((item): item is PromptDto => !!item);
    }
    this.state.availablePrompts.set(items);
    return items;
  }
}

function normalizePrompt(raw: unknown): PromptDto | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as { promptId?: number; id?: number; tag?: string; description?: string };
  const promptId = Number(item.promptId ?? item.id);
  const tag = (item.tag ?? '').trim();
  if (!Number.isFinite(promptId) || promptId <= 0 || !tag) return null;
  return { promptId, tag, description: item.description ?? '' };
}
