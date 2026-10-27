import { Component, computed, effect, inject, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  AdminModal,
  RedactUserTab,
  RoleType,
  USER_BLOCK_REASON_LABEL,
  UserBlockHistoryItem,
  UserBlockReason,
  UserDto
} from '../../../../core/model';
import { ToastService } from '../../../../core/services/toast.service';
import { UserService } from '../../../../core/services/user.service';
import { dateTimeFormatter } from '../../../../core/utils/helpers';
import { formatMoney } from '../../../../shared/util/money.util';
import { normalRoleName } from '../../../../shared/util/role.util';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminStateService } from '../../data/admin-state.service';
import { AdminUsersFacade } from '../../data/admin-users.facade';

@Component({
  selector: 'app-redact-user-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './redact-user-modal.component.html'
})
export class RedactUserModalComponent {
  readonly state = inject(AdminStateService);
  readonly modal = inject(AdminModalService);
  private readonly users = inject(AdminUsersFacade);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly key = AdminModal.RedactUser;
  private preparedUserId: number | null = null;

  debtLimitInput = '';
  debtLimitPreset: string | null = null;
  blockReason = '';
  blockComment = '';
  readonly blockHistory = computed(() => (this.state.redactUser().blockHistory || []) as UserBlockHistoryItem[]);
  readonly isUserBlocked = computed(() => this.blockHistory().some(item => item.isActive));
  readonly userRole = computed(() => this.modal.selectedUser()?.role ?? '');
    
  readonly canHaveDebtLimit = computed(() =>
    this.userRole() === RoleType.Agent 
  );

  constructor() {
    effect(() => {
      if (!this.modal.isOpen(this.key)) {
        this.preparedUserId = null;
        return;
      }
      const user = this.modal.selectedUser();
      if (user && this.preparedUserId !== user.userId) {
        untracked(() => {
          this.preparedUserId = user.userId;
          void this.prepareRedactUser(user);
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

  money(value?: number | null): string {
    return formatMoney(value);
  }

  roleName(role?: string): string {
    return normalRoleName(role);
  }

  formatDate(value?: string | null): string {
    return dateTimeFormatter.formatDate(value);
  }

  formatDateTime(value?: string | null): string {
    return dateTimeFormatter.formatDateTime(value);
  }

  setRedactTab(tab: string): void {
    this.state.redactUser.update(current => ({ ...current, activeTab: tab }));
  }

  setDebtPreset(value: string): void {
    this.debtLimitInput = value;
    this.debtLimitPreset = value;
  }

  onDebtLimitInput(value: string): void {
    this.debtLimitInput = value.replace(/\D/g, '');
    this.debtLimitPreset = this.debtLimitInput;
  }

  submitButtonLabel(): string {
    const tab = this.state.redactUser().activeTab;
    if (tab === RedactUserTab.DebtLimit) return 'Сохранить';
    return this.isUserBlocked() ? 'Разблокировать' : 'Заблокировать';
  }

  async submitRedactUser(): Promise<void> {
    const user = this.modal.selectedUser();
    if (!user) return;
    const tab = this.state.redactUser().activeTab;
    try {
      if (tab === RedactUserTab.DebtLimit) {
        if (!this.debtLimitInput.trim()) throw new Error('Введите новый лимит');
        const debtLimit = Number(this.debtLimitInput);
        if (Number.isNaN(debtLimit) || debtLimit < 0) throw new Error('Введите корректный лимит');
        const result = await firstValueFrom(this.userService.changeUserDebtLimit({ userId: user.userId, debtLimit }));
        if (result?.success === false) throw new Error(result.message || 'Не удалось изменить лимит');
        this.modal.close(this.key);
        await this.users.load();
        this.toast.success('Лимит обновлён');
      } else if (tab === RedactUserTab.Status) {
        if (this.isUserBlocked()) {
          const reason = this.blockComment.trim();
          if (!reason) throw new Error('Укажите причину разблокировки');
          const result = await firstValueFrom(this.userService.unblockUser({
            unblockUserId: user.userId,
            unblockReason: reason
          }));
          if (result?.success === false) throw new Error(result.message || 'Не удалось разблокировать');
        } else {
          if (!this.blockReason) throw new Error('Выберите причину блокировки');
          const reasonText = this.blockReasonLabel();
          const fullReason = this.blockComment.trim() ? `${reasonText}: ${this.blockComment.trim()}` : reasonText;
          const result = await firstValueFrom(this.userService.blockUser({
            blockUserId: user.userId,
            reason: fullReason,
            blockUntil: null
          }));
          if (result?.success === false) throw new Error(result.message || 'Не удалось заблокировать');
        }
        await this.loadBlockHistory(user.userId);
        this.toast.success('Статус обновлён');
        await this.users.load();
      }
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'Ошибка при сохранении изменений');
    }
  }

  private async prepareRedactUser(user: UserDto): Promise<void> {
    this.state.redactUser.set({
      userId: user.userId,
      user,
      activeTab: this.state.redactUser().activeTab || RedactUserTab.Account,
      blockHistory: this.state.redactUser().blockHistory,
      blockHistoryLoaded: this.state.redactUser().blockHistoryLoaded
    });
    this.debtLimitInput = '';
    this.debtLimitPreset = null;
    this.blockReason = '';
    this.blockComment = '';
    await this.loadBlockHistory(user.userId);
  }

  private async loadBlockHistory(userId: number): Promise<void> {
    const response = await firstValueFrom(this.userService.getUserBlockHistory(userId));
    this.state.redactUser.update(current => ({
      ...current,
      blockHistory: response?.data ?? [],
      blockHistoryLoaded: true
    }));
  }

  private blockReasonLabel(): string {
    const reason = this.blockReason as UserBlockReason;
    return USER_BLOCK_REASON_LABEL[reason] || this.blockReason;
  }
}
