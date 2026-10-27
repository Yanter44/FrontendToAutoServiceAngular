import { Component, computed, effect, inject, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { PaymentService } from '../../../../core/services/payment.service';
import { ToastService } from '../../../../core/services/toast.service';
import { generateUUID } from '../../../../core/utils/helpers';
import { formatMoney } from '../../../../shared/util/money.util';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminPaymentsFacade } from '../../data/admin-payments.facade';
import { AdminStateService } from '../../data/admin-state.service';
import { AdminUsersFacade } from '../../data/admin-users.facade';

@Component({
  selector: 'app-deduct-balance-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './deduct-balance-modal.component.html'
})
export class DeductBalanceModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly state = inject(AdminStateService);
  private readonly users = inject(AdminUsersFacade);
  private readonly payments = inject(AdminPaymentsFacade);
  private readonly paymentService = inject(PaymentService);
  private readonly toast = inject(ToastService);
  private readonly key = AdminModal.DeductBalance;

  debitAgentId: number | null = null;
  debitAmount: number | null = 5000;
  debitComment = '';
  debitQuick = 5000;

  readonly agents = computed(() => this.state.availableAgents());

  constructor() {
    effect(() => {
      if (!this.modal.isOpen(this.key)) return;
      untracked(() => {
        if (!this.agents().length) void this.users.loadAgents();
        const first = this.agents()[0];
        if (first && this.debitAgentId == null) this.debitAgentId = first.id;
      });
    });
  }

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  setDebitQuick(value: number): void {
    this.debitQuick = value;
    this.debitAmount = value;
  }

  debitBalanceText(): string {
    return formatMoney(this.agents().find(agent => agent.id === Number(this.debitAgentId))?.balance);
  }

  async submitDebit(): Promise<void> {
    const agentId = Number(this.debitAgentId);
    const amount = Number(this.debitAmount);
    if (!agentId) {
      alert('Выберите агента');
      return;
    }
    if (!amount || amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }
    const ok = await firstValueFrom(this.paymentService.debit({
      agentId,
      amount,
      comment: this.debitComment.trim(),
      idempotencyKey: generateUUID()
    }));
    if (ok) {
      this.modal.close(this.key);
      this.debitComment = '';
      await this.users.loadAgents();
      await this.payments.load();
    } else {
      this.toast.error('Произошла ошибка при списании средств');
    }
  }
}
